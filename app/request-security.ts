/** Security checks shared by every state-changing HTTP route. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}
