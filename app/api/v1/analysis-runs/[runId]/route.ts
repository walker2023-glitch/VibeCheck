import { readRun } from "../../../../../server/demo/api";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  return readRun(request, (await params).runId);
}
