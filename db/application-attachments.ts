import { and, desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from ".";
import { applicationAttachments, jobApplications } from "./schema";

export const attachmentKinds = ["application", "confirmation", "response", "other"] as const;
export type AttachmentKind = (typeof attachmentKinds)[number];
export const maxAttachmentSize = 10 * 1024 * 1024;

function bucket() { if (!env.APPLICATION_DOCUMENTS) throw new Error("R2 binding `APPLICATION_DOCUMENTS` is unavailable."); return env.APPLICATION_DOCUMENTS; }
export async function listAttachments(userId:string, applicationId:string) { return getDb().select().from(applicationAttachments).where(and(eq(applicationAttachments.userId,userId),eq(applicationAttachments.applicationId,applicationId))).orderBy(desc(applicationAttachments.createdAt)); }
export async function addAttachment(userId:string, applicationId:string, kind:AttachmentKind, file:File) {
  const owned = await getDb().query.jobApplications.findFirst({where:and(eq(jobApplications.id,applicationId),eq(jobApplications.userId,userId))}); if (!owned) return null;
  const id=crypto.randomUUID(), objectKey=`${userId}/${applicationId}/${id}.pdf`, fileName=file.name.replace(/[\\/:*?"<>|]/g,"_").slice(0,180)||"dokument.pdf";
  await bucket().put(objectKey, file.stream(), { httpMetadata:{contentType:"application/pdf",contentDisposition:`attachment; filename="${fileName}"`} });
  const [item]=await getDb().insert(applicationAttachments).values({id,userId,applicationId,kind,fileName,objectKey,contentType:"application/pdf",size:String(file.size)}).returning(); return item;
}
export async function getAttachment(userId:string, applicationId:string, attachmentId:string) { const item=await getDb().query.applicationAttachments.findFirst({where:and(eq(applicationAttachments.id,attachmentId),eq(applicationAttachments.userId,userId),eq(applicationAttachments.applicationId,applicationId))}); if (!item) return null; const object=await bucket().get(item.objectKey); return object?{item,object}:null; }
export async function removeAttachment(userId:string, applicationId:string, attachmentId:string) { const [item]=await getDb().delete(applicationAttachments).where(and(eq(applicationAttachments.id,attachmentId),eq(applicationAttachments.userId,userId),eq(applicationAttachments.applicationId,applicationId))).returning(); if (!item)return false; await bucket().delete(item.objectKey); return true; }
