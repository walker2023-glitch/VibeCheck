import { explainCode } from "../ai/service";
import { createAssessment, getCompletion, gradeAttempt, publicAssessment, publicAttempt } from "../assessment/knowledge-check";
import { answerCompanion } from "../companion/service";
import { checkPublicRepository, parseGithubUrl } from "../github/public-repository";
import { ApiError, assertOrigin, guestCookie, guestSession, handle, idempotencyKey, ok, readJsonObject, requireGuest, stringField } from "./http";
import { analyzeRun, consumeBudget, createRepository, createRun, getOwnedAssessment, getOwnedRepository, getOwnedRun, idempotent, idempotentAsync, newGuestSession, publicRepository, publicRun, saveAssessment } from "./store";

const unavailable = () => new ApiError("RESOURCE_NOT_FOUND", 404, "The requested resource is unavailable.");
const repository = (request: Request, id: string) => {
  const session = requireGuest(request);
  const value = getOwnedRepository(session, id);
  if (!value) throw unavailable();
  return { session, value };
};
const run = (request: Request, id: string) => {
  const session = requireGuest(request);
  const value = getOwnedRun(session, id);
  if (!value) throw unavailable();
  return { session, value };
};
const assessment = (request: Request, id: string) => {
  const session = requireGuest(request);
  const value = getOwnedAssessment(session, id);
  if (!value) throw unavailable();
  return { session, value };
};

export function registerRepository(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    const key = idempotencyKey(request);
    const body = await readJsonObject(request, ["githubUrl"]);
    const githubUrl = stringField(body.githubUrl, "githubUrl");
    try { parseGithubUrl(githubUrl); } catch { throw new ApiError("INVALID_REQUEST", 400, "Expected https://github.com/{owner}/{repo}."); }
    const session = guestSession(request) ?? newGuestSession();
    consumeBudget(session, "import", 10);
    const value = await idempotentAsync(session, "repository", key, body, async () => {
      await checkPublicRepository(githubUrl);
      return publicRepository(createRepository(session, githubUrl));
    });
    return ok(value, 201, { "Set-Cookie": guestCookie(session, request) });
  });
}

export function readRepository(request: Request, id: string) {
  return handle(() => ok(publicRepository(repository(request, id).value)));
}

export function updateConsent(request: Request, id: string) {
  return handle(async () => {
    assertOrigin(request);
    const { value } = repository(request, id);
    const body = await readJsonObject(request, ["granted", "consentVersion"]);
    if (typeof body.granted !== "boolean" || body.consentVersion !== "demo.v1") throw new ApiError("INVALID_REQUEST", 400, "Consent fields are invalid.");
    value.consent = body.granted;
    return ok({ granted: value.consent, consentVersion: "demo.v1" });
  });
}

export function startAnalysis(request: Request, id: string) {
  return handle(async () => {
    assertOrigin(request);
    const key = idempotencyKey(request);
    const { session, value } = repository(request, id);
    const body = await readJsonObject(request, ["fromCommit", "toCommit"]);
    if (body.fromCommit !== undefined || body.toCommit !== undefined) throw new ApiError("INVALID_REQUEST", 400, "The demo analyzes the current default-branch snapshot.");
    consumeBudget(session, "analysis", 10);
    const result = idempotent(session, `analysis:${id}`, key, body, () => {
      const created = createRun(session, value);
      if (created.status === "queued") void analyzeRun(session, created);
      return publicRun(created);
    });
    return ok(result, 202);
  });
}

export function readRun(request: Request, id: string) {
  return handle(() => ok(publicRun(run(request, id).value)));
}

export function readConcepts(request: Request, id: string) {
  return handle(() => {
    const value = run(request, id).value;
    return ok({ items: value.status === "succeeded" ? value.concepts : [], nextCursor: null });
  });
}

export function codeDetective(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    const body = await readJsonObject(request, ["runId", "evidenceId", "audience"]);
    const runId = stringField(body.runId, "runId");
    const evidenceId = stringField(body.evidenceId, "evidenceId");
    if (body.audience !== undefined && body.audience !== "beginner" && body.audience !== "advanced") throw new ApiError("INVALID_REQUEST", 400, "audience is invalid.");
    const { session, value } = run(request, runId);
    if (value.status !== "succeeded") throw new ApiError("ANALYSIS_FAILED", 500, "Analysis is not ready.");
    const concept = value.concepts.find((item) => item.evidence.some((evidence) => evidence.id === evidenceId));
    const evidence = concept?.evidence.find((item) => item.id === evidenceId);
    if (!concept || !evidence) throw unavailable();
    consumeBudget(session, "explain", 20);
    const repo = session.repositories.get(value.repositoryId)!;
    return ok(await explainCode(concept, evidence, { consent: repo.consent, audience: body.audience as "beginner" | "advanced" | undefined }));
  });
}

export function companionMessage(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    const key = idempotencyKey(request);
    const body = await readJsonObject(request, ["page", "question", "runId", "evidenceId"]);
    const page = stringField(body.page, "page", 120);
    const question = stringField(body.question, "question", 2_000);
    const session = guestSession(request);

    const respond = async () => {
      if (body.runId !== undefined || body.evidenceId !== undefined) {
        if (!session) throw unavailable();
        const runId = stringField(body.runId, "runId");
        const evidenceId = stringField(body.evidenceId, "evidenceId");
        const value = getOwnedRun(session, runId);
        if (!value || value.status !== "succeeded") throw unavailable();
        const concept = value.concepts.find((item) => item.evidence.some((entry) => entry.id === evidenceId));
        const evidence = concept?.evidence.find((entry) => entry.id === evidenceId);
        if (!concept || !evidence) throw unavailable();
        const repo = session.repositories.get(value.repositoryId);
        if (!repo) throw unavailable();
        consumeBudget(session, "companion", 30);
        const reply = await answerCompanion({
          page,
          question,
          consent: repo.consent,
          concept,
          evidence
        });
        return { summary: reply.summary, claims: reply.claims };
      }
      if (session) consumeBudget(session, "companion", 60);
      const reply = await answerCompanion({ page, question, consent: false });
      return { summary: reply.summary, claims: reply.claims };
    };

    if (session) {
      const data = await idempotentAsync(session, "companion", key, body, respond);
      return ok(data);
    }
    return ok(await respond());
  });
}

export function generateAssessment(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    const body = await readJsonObject(request, ["runId", "conceptIds"]);
    const runId = stringField(body.runId, "runId");
    if (!Array.isArray(body.conceptIds) || body.conceptIds.length < 1 || body.conceptIds.length > 5 || body.conceptIds.some((id) => typeof id !== "string" || id.length > 100)) throw new ApiError("INVALID_REQUEST", 400, "conceptIds is invalid.");
    const { session, value } = run(request, runId);
    if (value.status !== "succeeded") throw new ApiError("ASSESSMENT_UNAVAILABLE", 409, "Analysis is not ready for a Knowledge Check.");
    consumeBudget(session, "assessment", 10);
    try {
      const created = createAssessment(runId, value.concepts, body.conceptIds as string[]);
      saveAssessment(session, created);
      return ok(publicAssessment(created), 201);
    } catch { throw new ApiError("ASSESSMENT_UNAVAILABLE", 409, "At least two supported concepts with evidence are needed."); }
  });
}

export function readAssessment(request: Request, id: string) {
  return handle(() => ok(publicAssessment(assessment(request, id).value.assessment)));
}

export function submitAttempt(request: Request, id: string) {
  return handle(async () => {
    assertOrigin(request);
    const key = idempotencyKey(request);
    const body = await readJsonObject(request, ["itemId", "answer", "aiAssistance"]);
    const itemId = stringField(body.itemId, "itemId");
    const answer = stringField(body.answer, "answer", 4_000);
    if (body.aiAssistance !== "yes" && body.aiAssistance !== "no" && body.aiAssistance !== "prefer_not_to_say") throw new ApiError("INVALID_ATTEMPT", 422, "AI assistance declaration is invalid.");
    const { session, value } = assessment(request, id);
    const item = value.assessment.items.find((entry) => entry.id === itemId);
    if (!item) throw unavailable();
    consumeBudget(session, "attempt", 60);
    const attempt = idempotent(session, `attempt:${id}`, key, body, () => {
      try {
        const graded = gradeAttempt(item, answer, body.aiAssistance as "yes" | "no" | "prefer_not_to_say");
        value.attempts.push(graded);
        return graded;
      } catch { throw new ApiError("INVALID_ATTEMPT", 422, "The selected answer is invalid."); }
    });
    return ok(publicAttempt(attempt), 201);
  });
}

export function readCompletion(request: Request, id: string) {
  return handle(() => {
    const { session, value } = assessment(request, id);
    const sourceRun = session.runs.get(value.runId);
    if (!sourceRun) throw unavailable();
    return ok(getCompletion(value.assessment, sourceRun.concepts, value.attempts, new Date(session.expiresAt).toISOString()));
  });
}
