import type { RequestHandler } from "msw";

// The current stories render locally and make no HTTP requests. Keep this
// explicit so handlers can be added only when a story exercises an endpoint.
export const mswHandlers: RequestHandler[] = [];
