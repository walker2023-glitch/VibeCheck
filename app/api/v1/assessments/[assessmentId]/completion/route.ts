import { readCompletion } from "../../../../../../server/demo/api";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  return readCompletion(request, (await params).assessmentId);
}
