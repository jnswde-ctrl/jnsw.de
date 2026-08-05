import { requireActiveUser } from "../../auth";
import { isSameOrigin } from "../../request-security";
export const privateHeaders = { "Cache-Control": "no-store" };
export async function activeUser() { return requireActiveUser(); }
export function denied(status: number, error: string) { return Response.json({ error }, { status, headers: privateHeaders }); }
export function mutationAllowed(request: Request) { return isSameOrigin(request); }
export async function json(request: Request) { return request.json().catch(() => null) as Promise<Record<string, unknown> | null>; }
export const text = (value: unknown, max: number, required = false) => typeof value === "string" && (!required || value.trim()) && value.length <= max ? value.trim() : null;
export const date = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : value === null || value === "" || value === undefined ? null : undefined;
