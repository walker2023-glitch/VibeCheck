import type { Concept } from "./api/types";

const KEY = "vibecheck_guest_session_v1";

export type GuestSession = {
  githubUrl: string;
  repositoryId: string;
  runId: string;
  concepts: Concept[];
  selectedConceptId?: string;
  selectedEvidenceId?: string;
  assessmentId?: string;
  usingFixtures: boolean;
};

export function loadGuestSession(): GuestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestSession;
  } catch {
    return null;
  }
}

export function saveGuestSession(session: GuestSession): void {
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearGuestSession(): void {
  sessionStorage.removeItem(KEY);
}

export function conceptLabel(session: GuestSession | null, conceptId: string): string {
  return session?.concepts.find((c) => c.id === conceptId)?.label ?? conceptId;
}
