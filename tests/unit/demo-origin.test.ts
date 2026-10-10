import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, assertOrigin, guestCookie } from "../../server/demo/http";
import type { GuestSession } from "../../server/demo/store";

const session = { id: "guest-session-1", expiresAt: Date.now() + 60_000 } as GuestSession;

function request(url: string, origin?: string, extraHeaders?: Record<string, string>) {
  return new Request(url, {
    method: "POST",
    headers: {
      ...(origin ? { origin } : {}),
      ...extraHeaders,
    },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("APP_ORIGIN trusted production origin", () => {
  it("accepts localhost same-origin request when APP_ORIGIN is unset", () => {
    delete process.env.APP_ORIGIN;
    expect(() => assertOrigin(request("http://localhost:3000/api/v1/repositories", "http://localhost:3000"))).not.toThrow();
  });

  it("accepts configured HTTPS production origin even when the internal request URL is HTTP/different", () => {
    vi.stubEnv("APP_ORIGIN", "https://vibecheck.example");
    expect(() =>
      assertOrigin(request("http://0.0.0.0:8080/api/v1/repositories", "https://vibecheck.example")),
    ).not.toThrow();
  });

  it("rejects a wrong external Origin", () => {
    vi.stubEnv("APP_ORIGIN", "https://vibecheck.example");
    expect(() =>
      assertOrigin(request("http://0.0.0.0:8080/api/v1/repositories", "https://evil.example")),
    ).toThrow(ApiError);
    try {
      assertOrigin(request("http://0.0.0.0:8080/api/v1/repositories", "https://evil.example"));
    } catch (error) {
      expect(error).toMatchObject({ code: "AUTHORIZATION_FAILED", status: 403 });
    }
  });

  it("does not let a spoofed Host bypass validation", () => {
    vi.stubEnv("APP_ORIGIN", "https://vibecheck.example");
    expect(() =>
      assertOrigin(
        request("http://0.0.0.0:8080/api/v1/repositories", "https://evil.example", {
          host: "vibecheck.example",
        }),
      ),
    ).toThrow(ApiError);
  });

  it("does not let spoofed X-Forwarded-Host / X-Forwarded-Proto bypass validation", () => {
    vi.stubEnv("APP_ORIGIN", "https://vibecheck.example");
    expect(() =>
      assertOrigin(
        request("http://0.0.0.0:8080/api/v1/repositories", "https://evil.example", {
          "x-forwarded-host": "vibecheck.example",
          "x-forwarded-proto": "https",
        }),
      ),
    ).toThrow(ApiError);
  });

  it("fails closed when APP_ORIGIN is malformed", () => {
    vi.stubEnv("APP_ORIGIN", "https://user:pass@vibecheck.example/path?x=1#frag");
    // Even a matching internal Origin must not be accepted once APP_ORIGIN is set but invalid.
    expect(() =>
      assertOrigin(request("http://0.0.0.0:8080/api/v1/repositories", "http://0.0.0.0:8080")),
    ).toThrow(ApiError);
  });

  it("sets Secure on the guest cookie when APP_ORIGIN is HTTPS", () => {
    vi.stubEnv("APP_ORIGIN", "https://vibecheck.example");
    const cookie = guestCookie(session, request("http://0.0.0.0:8080/api/v1/repositories"));
    expect(cookie).toMatch(/;\s*Secure(?:;|$)/i);
  });

  it("preserves HttpOnly and SameSite=Lax on the guest cookie", () => {
    vi.stubEnv("APP_ORIGIN", "https://vibecheck.example");
    const cookie = guestCookie(session, request("http://0.0.0.0:8080/api/v1/repositories"));
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });
});
