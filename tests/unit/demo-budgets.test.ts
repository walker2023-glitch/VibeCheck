import { describe, expect, it } from "vitest";
import { createRepository, createRun, newGuestSession } from "../../server/demo/store";

describe("SEC-11 bounded server work", () => {
  it("limits active repository analysis across guest sessions", () => {
    const sessions = Array.from({ length: 3 }, () => newGuestSession());
    const repositories = sessions.map((session, index) => createRepository(session, `https://github.com/acme/demo${index}`));
    createRun(sessions[0], repositories[0]);
    createRun(sessions[1], repositories[1]);
    expect(() => createRun(sessions[2], repositories[2])).toThrow("RATE_LIMITED");
  });
});
