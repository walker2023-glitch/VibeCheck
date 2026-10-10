export const PASTE_CODE_MAX_CHARS = 32_000;
export type PasteLanguage = "javascript" | "typescript";

export type PasteValidation =
  | { ok: true; language: PasteLanguage; source: string }
  | { ok: false; message: string };

/** Client/server-shared validation. Never executes source. */
export function validatePasteCode(raw: string, language: string): PasteValidation {
  if (language !== "javascript" && language !== "typescript") {
    return { ok: false, message: "Choose JavaScript or TypeScript. Other languages are not supported in this preview." };
  }
  const source = raw.replace(/\r\n/g, "\n");
  if (!source.trim()) {
    return { ok: false, message: "Paste some JavaScript or TypeScript before analyzing." };
  }
  if (source.length > PASTE_CODE_MAX_CHARS) {
    return {
      ok: false,
      message: `Keep pasted code under ${PASTE_CODE_MAX_CHARS.toLocaleString()} characters for this preview.`
    };
  }
  return { ok: true, language, source };
}
