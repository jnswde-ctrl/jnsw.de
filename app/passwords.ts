const encoder = new TextEncoder();
const iterations = 600000;
function bytesToBase64(bytes: Uint8Array) {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text);
}
function base64ToBytes(value: string) {
  const text = atob(value),
    bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return bytes;
}
async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations },
      key,
      256,
    ),
  );
}
export function isValidPassword(password: string) {
  return password.length >= 12 && password.length <= 256;
}
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2-sha256$${iterations}$${bytesToBase64(salt)}$${bytesToBase64(await derive(password, salt))}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [algorithm, count, salt, expected] = stored.split("$");
  if (
    algorithm !== "pbkdf2-sha256" ||
    count !== String(iterations) ||
    !salt ||
    !expected
  )
    return false;
  const actual = bytesToBase64(await derive(password, base64ToBytes(salt)));
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i++)
    difference |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}
