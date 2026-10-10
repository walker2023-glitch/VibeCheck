import { randomUUID } from "node:crypto";
import { AIOutputError } from "../ai/service";
import { GithubError } from "../github/public-repository";
import { getGuestSession, type GuestSession, GUEST_TTL_MS } from "./store";

export class ApiError extends Error {
  constructor(public code: string, public status: number, message: string) { super(message); }
}

const NO_STORE = { "Cache-Control": "no-store" };
export function ok(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return Response.json({ data, error: null }, { status, headers: { ...NO_STORE, ...extraHeaders } });
}

function failure(code: string, status: number, message: string, retryable = false): Response {
  return Response.json({ data: null, error: { code, message, requestId: randomUUID(), retryable } }, {
    status, headers: { ...NO_STORE, ...(retryable ? { "Retry-After": "60" } : {}) },
  });
}

export async function handle(action: () => Promise<Response> | Response): Promise<Response> {
  try { return await action(); }
  catch (error) {
    if (error instanceof ApiError) return failure(error.code, error.status, error.message, error.status === 429 || error.status === 503);
    if (error instanceof GithubError) return failure(error.code, error.status, error.message, error.status === 429 || error.status === 503);
    if (error instanceof AIOutputError || (error instanceof Error && error.message === "AI_OUTPUT_INVALID")) return failure("AI_OUTPUT_INVALID", 502, "The generated explanation failed validation.");
    if (error instanceof Error && error.message === "IDEMPOTENCY_CONFLICT") return failure("IDEMPOTENCY_CONFLICT", 409, "This idempotency key was used with different input.");
    if (error instanceof Error && error.message === "RATE_LIMITED") return failure("RATE_LIMITED", 429, "This guest session reached its request limit.", true);
    if (error instanceof Error && error.message === "AI_RATE_LIMITED") return failure("AI_RATE_LIMITED", 429, "The explanation service is temporarily limited.", true);
    if (error instanceof Error && error.message === "AI_UNAVAILABLE") return failure("AI_UNAVAILABLE", 503, "The explanation service is temporarily unavailable.", true);
    return failure("ANALYSIS_FAILED", 500, "This request could not be completed.");
  }
}

function unauthorizedOrigin(): never {
  throw new ApiError("AUTHORIZATION_FAILED", 403, "This request origin is not allowed.");
}

/** When set, APP_ORIGIN is the sole trusted browser origin (normalized). Host/X-Forwarded-* are never consulted. */
function configuredAppOrigin(): string | undefined {
  const raw = process.env.APP_ORIGIN;
  if (raw === undefined || raw === "") return undefined;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    unauthorizedOrigin();
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") unauthorizedOrigin();
  if (parsed.username || parsed.password) unauthorizedOrigin();
  if (parsed.search || parsed.hash) unauthorizedOrigin();
  if (parsed.pathname !== "/" && parsed.pathname !== "") unauthorizedOrigin();
  // Reject whitespace / multi-value / non-origin forms that URL() still parses.
  if (raw.trim() !== raw || /\s/.test(raw)) unauthorizedOrigin();
  return parsed.origin;
}

export function assertOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const trusted = configuredAppOrigin() ?? new URL(request.url).origin;
  if (origin !== trusted) unauthorizedOrigin();
}

export async function readJsonObject(request: Request, allowed: string[]): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new ApiError("INVALID_REQUEST", 400, "Expected a JSON request body.");
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) throw new ApiError("INVALID_REQUEST", 400, "Request body is too large.");
  let text: string;
  try { text = await request.text(); } catch { throw new ApiError("INVALID_REQUEST", 400, "Request body is invalid."); }
  if (text.length > 10_000) throw new ApiError("INVALID_REQUEST", 400, "Request body is too large.");
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new ApiError("INVALID_REQUEST", 400, "Request body is invalid JSON."); }
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !allowed.includes(key))) throw new ApiError("INVALID_REQUEST", 400, "Request fields are invalid.");
  return value as Record<string, unknown>;
}

export function idempotencyKey(request: Request): string {
  const key = request.headers.get("Idempotency-Key");
  if (!key || !/^[A-Za-z0-9._:-]{8,128}$/.test(key)) throw new ApiError("INVALID_REQUEST", 400, "A valid Idempotency-Key header is required.");
  return key;
}

function cookieValue(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

export function guestSession(request: Request): GuestSession | null {
  return getGuestSession(cookieValue(request, "vibecheck_guest"));
}

export function requireGuest(request: Request): GuestSession {
  const session = guestSession(request);
  if (!session) throw new ApiError("RESOURCE_NOT_FOUND", 404, "The requested resource is unavailable.");
  return session;
}

export function guestCookie(session: GuestSession, request: Request): string {
  const configured = configuredAppOrigin();
  const https = configured ? configured.startsWith("https:") : new URL(request.url).protocol === "https:";
  const secure = https ? "; Secure" : "";
  return `vibecheck_guest=${session.id}; Path=/; Max-Age=${Math.floor(GUEST_TTL_MS / 1000)}; HttpOnly; SameSite=Lax${secure}`;
}

export function stringField(value: unknown, field: string, max = 200): string {
  if (typeof value !== "string" || !value || value.length > max) throw new ApiError("INVALID_REQUEST", 400, `${field} is invalid.`);
  return value;
}
