import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as register } from "../../app/api/v1/repositories/route";
import { GET as repository } from "../../app/api/v1/repositories/[repositoryId]/route";
import { POST as startRun } from "../../app/api/v1/repositories/[repositoryId]/analysis-runs/route";
import { GET as runStatus } from "../../app/api/v1/analysis-runs/[runId]/route";
import { GET as concepts } from "../../app/api/v1/analysis-runs/[runId]/concepts/route";
import { POST as explain } from "../../app/api/v1/code-detective/route";
import { POST as makeAssessment } from "../../app/api/v1/assessments/route";
import { GET as getAssessment } from "../../app/api/v1/assessments/[assessmentId]/route";
import { POST as submit } from "../../app/api/v1/assessments/[assessmentId]/attempts/route";
import { GET as complete } from "../../app/api/v1/assessments/[assessmentId]/completion/route";

const sha = "a".repeat(40);
const blobSha = "b".repeat(40);
const source = "import { useState } from 'react';\nexport async function load() {\n  try {\n    return await fetch('/api');\n  } catch (error) {\n    throw error;\n  }\n}\n";

function fixtureFetch() {
  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith("/repos/acme/demo")) return Response.json({ default_branch: "main", private: false });
    if (url.endsWith("/repos/acme/demo/commits/main")) return Response.json({ sha });
    if (url.endsWith(`/repos/acme/demo/git/trees/${sha}`)) return Response.json({ tree: [{ path: "src", type: "tree", sha: "c".repeat(40) }] });
    if (url.endsWith(`/repos/acme/demo/git/trees/${"c".repeat(40)}`)) return Response.json({ tree: [{ path: "app.ts", type: "blob", sha: blobSha, size: Buffer.byteLength(source) }] });
    if (url.endsWith(`/repos/acme/demo/git/blobs/${blobSha}`)) return Response.json({ encoding: "base64", content: Buffer.from(source).toString("base64"), size: Buffer.byteLength(source) });
    throw new Error(`Unexpected request ${url}`);
  });
}

function request(path: string, method = "GET", body?: unknown, cookie?: string, key?: string) {
  return new Request(`http://localhost:3000/api/v1${path}`, {
    method,
    headers: { ...(body ? { "content-type": "application/json" } : {}), ...(cookie ? { cookie } : {}), ...(key ? { "Idempotency-Key": key } : {}), ...(method !== "GET" ? { origin: "http://localhost:3000" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

async function unwrap(response: Response) {
  const json = await response.json();
  expect(json).toHaveProperty("data");
  expect(json).toHaveProperty("error");
  return json;
}

afterEach(() => vi.unstubAllGlobals());

describe("API-001 API-002 guest vertical slice", () => {
  it("registers, analyzes, explains, assesses and separates demonstrated from unverified", async () => {
    vi.stubGlobal("fetch", fixtureFetch());
    const registered = await register(request("/repositories", "POST", { githubUrl: "https://github.com/acme/demo" }, undefined, "register-123"));
    expect(registered.status).toBe(201);
    const cookie = registered.headers.get("set-cookie")!.split(";")[0];
    expect(registered.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    const repo = (await unwrap(registered)).data;
    expect(repo).toMatchObject({ githubUrl: "https://github.com/acme/demo", latestRunId: null, persistence: "ephemeral" });
    const started = await startRun(request(`/repositories/${repo.id}/analysis-runs`, "POST", {}, cookie, "analysis-123"), { params: Promise.resolve({ repositoryId: repo.id }) });
    expect(started.status).toBe(202);
    const run = (await unwrap(started)).data;
    for (let index = 0; index < 20; index++) {
      const state = (await unwrap(await runStatus(request(`/analysis-runs/${run.id}`, "GET", undefined, cookie), { params: Promise.resolve({ runId: run.id }) }))).data;
      if (state.status === "succeeded") break;
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    const latest = (await unwrap(await repository(request(`/repositories/${repo.id}`, "GET", undefined, cookie), { params: Promise.resolve({ repositoryId: repo.id }) }))).data;
    expect(latest.latestRunId).toBe(run.id);
    const found = (await unwrap(await concepts(request(`/analysis-runs/${run.id}/concepts`, "GET", undefined, cookie), { params: Promise.resolve({ runId: run.id }) }))).data.items;
    expect(found.length).toBeGreaterThanOrEqual(3);
    const cited = found[0].evidence[0];
    expect(cited).toMatchObject({ commitSha: sha, path: "src/app.ts", startLine: expect.any(Number) });
    const explanation = (await unwrap(await explain(request("/code-detective", "POST", { runId: run.id, evidenceId: cited.id }, cookie)))).data;
    expect(explanation.claims[0].evidenceRefs[0].id).toBe(cited.id);
    const assessmentResponse = await makeAssessment(request("/assessments", "POST", { runId: run.id, conceptIds: found.slice(0, 2).map((concept: { id: string }) => concept.id) }, cookie));
    expect(assessmentResponse.status).toBe(201);
    const assessment = (await unwrap(assessmentResponse)).data;
    expect(assessment.items).toHaveLength(2);
    expect(JSON.stringify(assessment)).not.toMatch(/correctOptionId|explanation|misconception/);
    expect((await unwrap(await getAssessment(request(`/assessments/${assessment.id}`, "GET", undefined, cookie), { params: Promise.resolve({ assessmentId: assessment.id }) }))).data).toEqual(assessment);
    const before = (await unwrap(await complete(request(`/assessments/${assessment.id}/completion`, "GET", undefined, cookie), { params: Promise.resolve({ assessmentId: assessment.id }) }))).data;
    expect(before.concepts.every((concept: { status: string }) => concept.status === "unverified")).toBe(true);
    const attemptResponse = await submit(request(`/assessments/${assessment.id}/attempts`, "POST", { itemId: assessment.items[0].id, answer: assessment.items[0].options[0].id, aiAssistance: "no" }, cookie, "attempt-123"), { params: Promise.resolve({ assessmentId: assessment.id }) });
    expect(attemptResponse.status).toBe(201);
    const attempt = (await unwrap(attemptResponse)).data;
    expect(attempt).toMatchObject({ gradingLabel: "Deterministically graded", evidence: expect.any(Array) });
    const after = (await unwrap(await complete(request(`/assessments/${assessment.id}/completion`, "GET", undefined, cookie), { params: Promise.resolve({ assessmentId: assessment.id }) }))).data;
    expect(after.concepts.find((concept: { conceptId: string }) => concept.conceptId === "modules").status).toBe("unverified");
    expect(after.attemptedItemCount).toBe(1);
  });

  it("rejects foreign guest IDs, absent idempotency keys, and unsafe URLs with frozen errors", async () => {
    vi.stubGlobal("fetch", fixtureFetch());
    const bad = await register(request("/repositories", "POST", { githubUrl: "https://evil.com/acme/demo" }, undefined, "register-unsafe"));
    expect((await unwrap(bad)).error.code).toBe("INVALID_REQUEST");
    const missing = await register(request("/repositories", "POST", { githubUrl: "https://github.com/acme/demo" }));
    expect((await unwrap(missing)).error.code).toBe("INVALID_REQUEST");
    const foreign = await repository(request("/repositories/does-not-exist", "GET", undefined, "vibecheck_guest=forged"), { params: Promise.resolve({ repositoryId: "does-not-exist" }) });
    expect((await unwrap(foreign)).error.code).toBe("RESOURCE_NOT_FOUND");
  });

  it("replays a registration key and conflicts before fetching a different repository", async () => {
    const fetcher = fixtureFetch();
    vi.stubGlobal("fetch", fetcher);
    const first = await register(request("/repositories", "POST", { githubUrl: "https://github.com/acme/demo" }, undefined, "same-key-123"));
    const cookie = first.headers.get("set-cookie")!.split(";")[0];
    const firstId = (await unwrap(first)).data.id;
    const replay = await register(request("/repositories", "POST", { githubUrl: "https://github.com/acme/demo" }, cookie, "same-key-123"));
    expect((await unwrap(replay)).data.id).toBe(firstId);
    const conflict = await register(request("/repositories", "POST", { githubUrl: "https://github.com/acme/other" }, cookie, "same-key-123"));
    expect(conflict.status).toBe(409);
    expect((await unwrap(conflict)).error.code).toBe("IDEMPOTENCY_CONFLICT");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("replays the original response projection after repository state changes", async () => {
    vi.stubGlobal("fetch", fixtureFetch());
    const first = await register(request("/repositories", "POST", { githubUrl: "https://github.com/acme/demo" }, undefined, "original-123"));
    const cookie = first.headers.get("set-cookie")!.split(";")[0];
    const original = (await unwrap(first)).data;
    await startRun(request(`/repositories/${original.id}/analysis-runs`, "POST", {}, cookie, "original-run-123"), { params: Promise.resolve({ repositoryId: original.id }) });
    const replay = (await unwrap(await register(request("/repositories", "POST", { githubUrl: "https://github.com/acme/demo" }, cookie, "original-123")))).data;
    expect(replay).toEqual(original);
  });
});
