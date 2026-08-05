export const maxVerificationTokenLength = 128;

export function isVerificationToken(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxVerificationTokenLength;
}

export async function completeEmailVerification(
  token: unknown,
  verify: (token: string) => Promise<boolean>,
) {
  return isVerificationToken(token) && verify(token);
}
