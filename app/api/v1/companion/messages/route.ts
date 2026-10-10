import { companionMessage } from "../../../../../server/demo/api";

export const runtime = "nodejs";
export function POST(request: Request) {
  return companionMessage(request);
}
