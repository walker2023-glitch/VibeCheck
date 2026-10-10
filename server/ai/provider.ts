export type GenerateInput = {
  operation: "explainCode"; model: string; promptVersion: "explainCode.v1"; schemaVersion: "explainCode.v1";
  boundedInput: string; timeoutMs: number; idempotencyScope: string;
};

export interface AIProvider {
  generate(input: GenerateInput): Promise<unknown>;
}
