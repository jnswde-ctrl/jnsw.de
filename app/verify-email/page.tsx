import { verifyEmailAddress } from "../../db/email-verification";
import { redirect } from "next/navigation";
import { completeEmailVerification } from "./verification-flow";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  if (await completeEmailVerification(token, verifyEmailAddress)) redirect("/#community");

  return <main className="subpage"><section className="community-section"><h1>Ungültiger Bestätigungslink.</h1><p>Bitte fordere über die Anmeldung einen neuen Bestätigungslink an.</p></section></main>;
}
