export type ProductStatus = "implemented" | "preview" | "planned";

export type ProductAnswer = {
  id: string;
  match: RegExp;
  status: ProductStatus;
  summary: string;
};

/** Approved, bounded product context for Ask VibeCheck Mode A. */
export const PRODUCT_ANSWERS: ProductAnswer[] = [
  {
    id: "what-is-vibecheck",
    match: /what does vibecheck|what is vibecheck|what can (i|you) do/i,
    status: "implemented",
    summary:
      "VibeCheck helps you understand, learn from, and prove your understanding of AI-assisted code. Live today: public GitHub analysis, Code Detective explanations (deterministic, with optional consented managed Claude), Knowledge Check, and ephemeral demonstrated-vs-unverified results. Plan, Rubber Duck, Deploy, and persistent My Skills are honest product previews — not fully live yet."
  },
  {
    id: "who-for",
    match: /who (is this|is it) for|audience|students|beginners|vibe coders/i,
    status: "implemented",
    summary:
      "VibeCheck is for anyone whose ability to build with AI is growing faster than their understanding — students and vibe coders, professionals working outside their strongest expertise, and educators or teams responsible for AI-assisted software. The guest demo implements analysis and assessment; Education & Teams dashboards are planned, not implemented."
  },
  {
    id: "code-detective",
    match: /what is code detective|code detective/i,
    status: "implemented",
    summary:
      "Code Detective connects concepts to real implementation evidence from your repository. It is implemented now: you can inspect observed evidence, read grounded explanations, and optionally enable managed AI after explicit consent. Claude teaches from bounded evidence; it does not invent repository truth."
  },
  {
    id: "knowledge-check",
    match: /knowledge check|how is knowledge check different|demonstrated knowledge/i,
    status: "implemented",
    summary:
      "Knowledge Check proves understanding separately from generation. It is live with deterministic grading. Found in your code is not the same as demonstrated knowledge — only correct independent assessment evidence counts as demonstrated in this guest session."
  },
  {
    id: "vs-cursor",
    match: /why not (just )?use (cursor|chatgpt|claude|codex)|difference.*(cursor|chatgpt|claude)/i,
    status: "implemented",
    summary:
      "Coding agents help you produce. VibeCheck helps you understand what you produced. Those tools already generate and explain code well. VibeCheck adds a structured learning loop: evidence → teach → assess → track demonstrated skills. It does not replace Cursor or Claude as coding agents."
  },
  {
    id: "rubber-duck",
    match: /rubber duck|what will rubber duck/i,
    status: "preview",
    summary:
      "Rubber Duck is a product preview. The planned experience guides debugging through questions and progressive hints before revealing answers. It is not a live guided session in this demo — use Code Detective and Knowledge Check for the working path today."
  },
  {
    id: "pricing",
    match: /pricing|how would pricing|subscription|pro plan|cost|free tier/i,
    status: "planned",
    summary:
      "Exact prices are not published in this demo. Directionally: Free covers core analysis and a limited learning workflow; Pro would add managed AI usage, higher limits, and persistent history; Bring Your Own Key and Education & Teams are planned options. Nothing here invents a dollar amount."
  },
  {
    id: "byok",
    match: /bring my own|byok|own api key|own key/i,
    status: "planned",
    summary:
      "Bring Your Own Key is planned, not implemented. Today the demo can use server-configured managed Claude only after you grant consent. BYOK would later let advanced users connect supported provider keys so VibeCheck stays the learning layer without forcing managed inference purchases."
  }
];

export function matchProductAnswer(question: string): ProductAnswer | null {
  const trimmed = question.trim();
  if (!trimmed) return null;
  return PRODUCT_ANSWERS.find((entry) => entry.match.test(trimmed)) ?? null;
}

export function fallbackProductAnswer(): ProductAnswer {
  return {
    id: "fallback",
    match: /.*/,
    status: "implemented",
    summary:
      "Ask about what VibeCheck does, who it is for, Code Detective, Knowledge Check, pricing direction, BYOK (planned), or Rubber Duck (preview). For selected code in Code Detective, enable managed AI explanations first, then ask a follow-up about that evidence."
  };
}
