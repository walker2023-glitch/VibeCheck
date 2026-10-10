/**
 * DEVELOPMENT-ONLY fixtures matching docs/contracts/openapi-v1.yaml.
 * Enabled when NEXT_PUBLIC_USE_FIXTURES=true. Easy to remove: delete this folder
 * and set the env flag off. Production UI must not pretend this is live analysis.
 */
import type {
  AnalysisRun,
  Assessment,
  Attempt,
  Concept,
  Explanation,
  Repository,
  SessionCompletion
} from "../types";

export const demoFixturesLabeled = true as const;

export const FIXTURE_BANNER =
  "Development fixtures active — sample data matching the frozen API contract, not a live repository analysis.";

const commitSha = "a1b2c3d4e5f6789012345678901234567890abcd";

const evidenceAsync = {
  id: "ev_async_1",
  commitSha,
  path: "src/lib/fetchUser.ts",
  startLine: 12,
  endLine: 24,
  language: "typescript",
  kind: "observed" as const,
  snippet: `export async function fetchUser(id: string) {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error("Failed to load user");
  }
  return response.json();
}`,
  snippetTruncated: false
};

const evidenceClosure = {
  id: "ev_closure_1",
  commitSha,
  path: "src/hooks/useCounter.ts",
  startLine: 4,
  endLine: 16,
  language: "typescript",
  kind: "observed" as const,
  snippet: `export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = useCallback(() => {
    setCount((current) => current + 1);
  }, []);
  return { count, increment };
}`,
  snippetTruncated: false
};

const evidenceGuard = {
  id: "ev_guard_1",
  commitSha,
  path: "src/api/session.ts",
  startLine: 18,
  endLine: 28,
  language: "typescript",
  kind: "observed" as const,
  snippet: `export function requireSession(session: Session | null): Session {
  if (!session) {
    throw new UnauthorizedError("Sign in to continue");
  }
  return session;
}`,
  snippetTruncated: false
};

const evidenceMap = {
  id: "ev_map_1",
  commitSha,
  path: "src/utils/groupBy.ts",
  startLine: 1,
  endLine: 12,
  language: "typescript",
  kind: "inferred" as const,
  snippet: `export function groupBy<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}`,
  snippetTruncated: false
};

export const demoRepository: Repository = {
  id: "repo_fixture_1",
  githubUrl: "https://github.com/example/vibecheck-sample",
  visibility: "public",
  persistence: "ephemeral",
  latestRunId: "run_fixture_1"
};

export const demoAnalysisRun: AnalysisRun = {
  id: "run_fixture_1",
  repositoryId: "repo_fixture_1",
  status: "succeeded",
  stage: "complete",
  snapshotSha: commitSha,
  progress: 100,
  partial: false,
  skippedFiles: 0,
  errorCode: null
};

export const demoConcepts: Concept[] = [
  {
    id: "concept_async_await",
    label: "async/await",
    evidence: [evidenceAsync]
  },
  {
    id: "concept_closures",
    label: "Closures & callbacks",
    evidence: [evidenceClosure]
  },
  {
    id: "concept_guards",
    label: "Early return guards",
    evidence: [evidenceGuard]
  },
  {
    id: "concept_reduce",
    label: "Array reduce patterns",
    evidence: [evidenceMap]
  }
];

export const demoExplanation: Explanation = {
  summary:
    "This function waits for a network response before continuing, then checks success before parsing JSON.",
  claims: [
    {
      kind: "observed",
      text: "The function is marked async and uses await on fetch, so execution pauses until the promise settles.",
      evidenceRefs: [evidenceAsync]
    },
    {
      kind: "observed",
      text: "A non-OK response throws before JSON parsing, so callers see a clear failure path.",
      evidenceRefs: [evidenceAsync]
    },
    {
      kind: "inferred",
      text: "This pattern is a common way to keep UI code from treating a failed HTTP status as successful data.",
      evidenceRefs: [evidenceAsync]
    }
  ],
  alternative:
    "You could return a Result type instead of throwing, which makes both outcomes explicit at the type level."
};

export const demoAssessment: Assessment = {
  id: "assess_fixture_1",
  runId: "run_fixture_1",
  items: [
    {
      id: "item_1",
      conceptId: "concept_async_await",
      type: "multiple_choice",
      question:
        "In fetchUser, what happens if the HTTP response is not OK?",
      options: [
        { id: "opt_a", text: "It still parses JSON and returns whatever body arrived." },
        { id: "opt_b", text: "It throws an Error before calling response.json()." },
        { id: "opt_c", text: "It retries the request automatically once." },
        { id: "opt_d", text: "It returns null." }
      ],
      evidence: [evidenceAsync]
    },
    {
      id: "item_2",
      conceptId: "concept_closures",
      type: "multiple_choice",
      question:
        "Why does useCounter wrap increment in useCallback with an empty dependency array?",
      options: [
        {
          id: "opt_a",
          text: "So increment keeps a stable identity while still reading the latest count via the updater form."
        },
        { id: "opt_b", text: "So React never re-renders when count changes." },
        { id: "opt_c", text: "So the initial value is recomputed on every click." },
        { id: "opt_d", text: "So setCount becomes synchronous." }
      ],
      evidence: [evidenceClosure]
    }
  ]
};

const gradedOutcomes = new Map<string, Attempt>();

export function recordFixtureAttempt(attempt: Attempt): void {
  gradedOutcomes.set(attempt.itemId, attempt);
}

export function resetFixtureAttempts(): void {
  gradedOutcomes.clear();
}

export function demoCompletion(): SessionCompletion {
  const concepts = demoAssessment.items.map((item) => {
    const attempt = gradedOutcomes.get(item.id);
    const demonstrated =
      !!attempt &&
      attempt.outcome === "correct" &&
      !attempt.practiceOnly &&
      (attempt.aiAssistance === "yes" || attempt.aiAssistance === "no");
    return {
      conceptId: item.conceptId,
      status: (demonstrated ? "demonstrated" : "unverified") as "demonstrated" | "unverified",
      independentOutcome:
        attempt && attempt.aiAssistance === "no"
          ? attempt.outcome === "correct"
            ? ("correct" as const)
            : ("incorrect" as const)
          : null,
      assistedOutcome:
        attempt && attempt.aiAssistance === "yes"
          ? attempt.outcome === "correct"
            ? ("correct" as const)
            : ("incorrect" as const)
          : null,
      practiceOnly: attempt?.practiceOnly ?? false,
      evidence: item.evidence
    };
  });

  // Include remaining detected concepts as unverified
  for (const concept of demoConcepts) {
    if (!concepts.some((c) => c.conceptId === concept.id)) {
      concepts.push({
        conceptId: concept.id,
        status: "unverified",
        independentOutcome: null,
        assistedOutcome: null,
        practiceOnly: false,
        evidence: concept.evidence
      });
    }
  }

  return {
    assessmentId: demoAssessment.id,
    completed: demoAssessment.items.every((item) => gradedOutcomes.has(item.id)),
    itemCount: demoAssessment.items.length,
    attemptedItemCount: gradedOutcomes.size,
    concepts,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  };
}

/** Pure helper so live-API selection can be unit-tested without reloading modules. */
export function resolveFixtureMode(flag: string | undefined): boolean {
  // Explicit opt-in only. NEXT_PUBLIC_USE_FIXTURES=false (or unset) selects the live API path.
  return flag === "true";
}

export function isFixtureMode(): boolean {
  return resolveFixtureMode(process.env.NEXT_PUBLIC_USE_FIXTURES);
}

export const fixtureStageSequence: AnalysisRun[] = [
  {
    ...demoAnalysisRun,
    status: "queued",
    stage: "queued",
    progress: 5
  },
  {
    ...demoAnalysisRun,
    status: "running",
    stage: "fetching",
    progress: 25
  },
  {
    ...demoAnalysisRun,
    status: "running",
    stage: "detecting",
    progress: 55
  },
  {
    ...demoAnalysisRun,
    status: "running",
    stage: "clarifying",
    progress: 80
  },
  {
    ...demoAnalysisRun,
    status: "succeeded",
    stage: "complete",
    progress: 100
  }
];
