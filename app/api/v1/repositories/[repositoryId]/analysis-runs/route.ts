import { startAnalysis } from "../../../../../../server/demo/api";

export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ repositoryId: string }> }) {
  return startAnalysis(request, (await params).repositoryId);
}
