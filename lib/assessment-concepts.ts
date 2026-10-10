/**
 * Builds concept IDs for POST /assessments (max 5 per contract; demo uses 2).
 * The inspected concept is always first; remaining slots fill from other concepts.
 */
export function buildAssessmentConceptIds(
  concepts: ReadonlyArray<{ id: string }>,
  selectedConceptId: string | undefined,
  limit = 2
): string[] {
  if (limit < 1 || concepts.length === 0) return [];

  const selected =
    selectedConceptId && concepts.some((c) => c.id === selectedConceptId)
      ? selectedConceptId
      : concepts[0].id;

  const ids = [selected];
  for (const concept of concepts) {
    if (ids.length >= limit) break;
    if (concept.id === selected) continue;
    ids.push(concept.id);
  }
  return ids;
}
