import { readRepository } from "../../../../../server/demo/api";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ repositoryId: string }> }) {
  return readRepository(request, (await params).repositoryId);
}
