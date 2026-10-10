export type GenerateInput = {
  operation: "explainCode" | "respondCompanion";
  model: string;
  promptVersion: "explainCode.v1" | "respondCompanion.v1";
  schemaVersion: "explainCode.v1" | "respondCompanion.v1";
  boundedInput: string;
  timeoutMs: number;
  idempotencyScope: string;
};

export interface AIProvider {
  generate(input: GenerateInput): Promise<unknown>;
}
