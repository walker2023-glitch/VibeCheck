import { submitAttempt } from "../../../../../../server/demo/api";

export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  return submitAttempt(request, (await params).assessmentId);
}
