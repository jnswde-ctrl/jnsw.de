import { redirect } from "next/navigation";
import { requireActiveUser } from "../../../auth";
import { ApplicationEditor } from "./ApplicationEditor";
export const dynamic="force-dynamic";
export default async function ApplicationPage({params}:{params:Promise<{id:string}>}){if(!await requireActiveUser())redirect("/community");return <ApplicationEditor id={(await params).id}/>}
