import { readAssessment } from "../../../../../server/demo/api";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  return readAssessment(request, (await params).assessmentId);
}
