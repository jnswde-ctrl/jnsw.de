import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const userRoleValues = ["admin", "member"] as const;
export const userStatusValues = ["active", "suspended"] as const;
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash"),
    emailVerifiedAt: text("email_verified_at"),
    lastVerificationEmailSentAt: text("last_verification_email_sent_at"),
    role: text("role", { enum: userRoleValues }).notNull().default("member"),
    status: text("status", { enum: userStatusValues })
      .notNull()
      .default("active"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    lastSignedInAt: text("last_signed_in_at"),
  },
  (table) => [index("users_role_status_idx").on(table.role, table.status)],
);
export const emailVerificationTokens = sqliteTable(
  "email_verification_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("email_verification_tokens_user_id_idx").on(table.userId),
    index("email_verification_tokens_expires_at_idx").on(table.expiresAt),
  ],
);
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);
export const applicationStatusValues = ["draft", "ready", "sent", "waiting", "interview", "offer", "rejected", "withdrawn", "archived"] as const;
export const careerItemKindValues = ["experience", "project"] as const;
export const careerItems = sqliteTable("career_items", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: careerItemKindValues }).notNull(), title: text("title").notNull(), organization: text("organization"), description: text("description").notNull().default(""), link: text("link"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("career_items_user_id_idx").on(table.userId)]);
export const jobApplications = sqliteTable("job_applications", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  company: text("company").notNull(), role: text("role").notNull(), jobUrl: text("job_url"), salary: text("salary"), deadlineAt: text("deadline_at"), status: text("status", { enum: applicationStatusValues }).notNull().default("draft"), notes: text("notes").notNull().default(""), followUpAt: text("follow_up_at"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`), archivedAt: text("archived_at"),
}, (table) => [index("job_applications_user_id_idx").on(table.userId), index("job_applications_user_status_idx").on(table.userId, table.status)]);
export const applicationEvidence = sqliteTable("application_evidence", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), applicationId: text("application_id").notNull().references(() => jobApplications.id, { onDelete: "cascade" }), careerItemId: text("career_item_id").notNull().references(() => careerItems.id, { onDelete: "cascade" }), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("application_evidence_user_id_idx").on(table.userId), index("application_evidence_application_id_idx").on(table.applicationId)]);
export const applicationDocumentVersions = sqliteTable("application_document_versions", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), applicationId: text("application_id").notNull().references(() => jobApplications.id, { onDelete: "cascade" }), content: text("content").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("application_document_versions_user_id_idx").on(table.userId), index("application_document_versions_application_id_idx").on(table.applicationId)]);
export const applicationAttachments = sqliteTable("application_attachments", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), applicationId: text("application_id").notNull().references(() => jobApplications.id, { onDelete: "cascade" }), kind: text("kind").notNull(), fileName: text("file_name").notNull(), objectKey: text("object_key").notNull().unique(), contentType: text("content_type").notNull(), size: text("size").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("application_attachments_user_id_idx").on(table.userId), index("application_attachments_application_id_idx").on(table.applicationId)]);
export const applicationTimelineEvents = sqliteTable("application_timeline_events", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), applicationId: text("application_id").notNull().references(() => jobApplications.id, { onDelete: "cascade" }), type: text("type").notNull(), occurredAt: text("occurred_at").notNull(), note: text("note").notNull().default(""), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("application_timeline_events_user_id_idx").on(table.userId), index("application_timeline_events_application_id_idx").on(table.applicationId)]);
