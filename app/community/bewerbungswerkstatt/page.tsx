import { redirect } from "next/navigation";
import { requireActiveUser } from "../../auth";
import { Bewerbungswerkstatt } from "./Bewerbungswerkstatt";
export const dynamic = "force-dynamic";
export default async function BewerbungswerkstattPage(){ if(!await requireActiveUser()) redirect("/community"); return <Bewerbungswerkstatt />; }
