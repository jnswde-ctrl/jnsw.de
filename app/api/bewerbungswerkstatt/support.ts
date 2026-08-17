import { requireActiveUser } from "../../auth";
import { isSameOrigin } from "../../request-security";
export { date, text } from "./input";
export const privateHeaders = { "Cache-Control": "no-store" };
export async function activeUser() {
  return requireActiveUser();
}
export function denied(status: number, error: string) {
  return Response.json({ error }, { status, headers: privateHeaders });
}
export function mutationAllowed(request: Request) {
  return isSameOrigin(request);
}
export async function json(request: Request) {
  return request.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}
