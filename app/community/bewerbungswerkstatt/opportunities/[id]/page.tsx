import { redirect } from "next/navigation";
import { requireActiveUser } from "../../../../auth";
import { OpportunityEditor } from "./OpportunityEditor";
export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await requireActiveUser())) redirect("/community");
  return <OpportunityEditor id={(await params).id} />;
}
