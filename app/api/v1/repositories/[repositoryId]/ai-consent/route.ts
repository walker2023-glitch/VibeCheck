import { updateConsent } from "../../../../../../server/demo/api";

export const runtime = "nodejs";
export async function PUT(request: Request, { params }: { params: Promise<{ repositoryId: string }> }) {
  return updateConsent(request, (await params).repositoryId);
}
