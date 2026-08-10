import { sql } from "drizzle-orm";
import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
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
    status: text("status", { enum: userStatusValues }).notNull().default("active"),
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
export const applicationStatusValues = [
  "draft",
  "ready",
  "sent",
  "waiting",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
  "archived",
] as const;
export const opportunitySourceTypeValues = ["manual", "url", "import"] as const;
export const opportunityRemoteModelValues = ["unknown", "on_site", "hybrid", "remote"] as const;
export const opportunityListingStatusValues = ["unknown", "open", "closed"] as const;
export const opportunityReviewStatusValues = [
  "unreviewed",
  "reviewing",
  "recommended",
  "on_hold",
  "not_recommended",
] as const;
export const careerItemKindValues = ["experience", "project"] as const;
export const profileSkillKindValues = ["experience", "learning"] as const;
export const profileSkillLevelValues = ["basic", "working", "advanced", "expert"] as const;
export const opportunityRequirementKindValues = ["must", "nice_to_have"] as const;
export const requirementAssessmentValues = ["met", "partial", "not_met", "unknown"] as const;
export const analysisRecommendationValues = ["recommended", "on_hold", "not_recommended"] as const;
export const careerItems = sqliteTable(
  "career_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: careerItemKindValues }).notNull(),
    title: text("title").notNull(),
    organization: text("organization"),
    description: text("description").notNull().default(""),
    link: text("link"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("career_items_user_id_idx").on(table.userId)],
);
export const profileSkills = sqliteTable(
  "profile_skills",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind", { enum: profileSkillKindValues }).notNull(),
    level: text("level", { enum: profileSkillLevelValues }).notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("profile_skills_user_name_unique").on(table.userId, table.name),
    index("profile_skills_user_id_idx").on(table.userId),
  ],
);
export const profileSkillEvidence = sqliteTable(
  "profile_skill_evidence",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => profileSkills.id, { onDelete: "cascade" }),
    careerItemId: text("career_item_id")
      .notNull()
      .references(() => careerItems.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("profile_skill_evidence_unique").on(table.skillId, table.careerItemId),
    index("profile_skill_evidence_user_id_idx").on(table.userId),
  ],
);
export const jobOpportunities = sqliteTable(
  "job_opportunities",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceKey: text("source_key").notNull(),
    sourceType: text("source_type", { enum: opportunitySourceTypeValues }).notNull(),
    company: text("company").notNull(),
    role: text("role").notNull(),
    jobUrl: text("job_url"),
    location: text("location"),
    remoteModel: text("remote_model", { enum: opportunityRemoteModelValues })
      .notNull()
      .default("unknown"),
    advertisedSalary: text("advertised_salary"),
    deadlineAt: text("deadline_at"),
    applicationMethod: text("application_method"),
    sourceCheckedAt: text("source_checked_at"),
    listingStatus: text("listing_status", { enum: opportunityListingStatusValues })
      .notNull()
      .default("unknown"),
    reviewStatus: text("review_status", { enum: opportunityReviewStatusValues })
      .notNull()
      .default("unreviewed"),
    notes: text("notes").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    archivedAt: text("archived_at"),
  },
  (table) => [
    uniqueIndex("job_opportunities_user_source_key_unique").on(table.userId, table.sourceKey),
    index("job_opportunities_user_id_idx").on(table.userId),
    index("job_opportunities_user_review_status_idx").on(table.userId, table.reviewStatus),
  ],
);
export const jobApplications = sqliteTable(
  "job_applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opportunityId: text("opportunity_id").references(() => jobOpportunities.id, {
      onDelete: "cascade",
    }),
    company: text("company").notNull(),
    role: text("role").notNull(),
    jobUrl: text("job_url"),
    salary: text("salary"),
    deadlineAt: text("deadline_at"),
    applicationMethod: text("application_method"),
    appliedAt: text("applied_at"),
    status: text("status", { enum: applicationStatusValues }).notNull().default("draft"),
    notes: text("notes").notNull().default(""),
    followUpAt: text("follow_up_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    archivedAt: text("archived_at"),
  },
  (table) => [
    index("job_applications_user_id_idx").on(table.userId),
    index("job_applications_user_status_idx").on(table.userId, table.status),
    uniqueIndex("job_applications_opportunity_id_unique").on(table.opportunityId),
  ],
);
export const opportunityTimelineEvents = sqliteTable(
  "opportunity_timeline_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => jobOpportunities.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    occurredAt: text("occurred_at").notNull(),
    note: text("note").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("opportunity_timeline_events_user_id_idx").on(table.userId),
    index("opportunity_timeline_events_opportunity_id_idx").on(table.opportunityId),
  ],
);
export const opportunityRequirements = sqliteTable(
  "opportunity_requirements",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => jobOpportunities.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    kind: text("kind", { enum: opportunityRequirementKindValues }).notNull(),
    assessment: text("assessment", { enum: requirementAssessmentValues })
      .notNull()
      .default("unknown"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("opportunity_requirements_user_id_idx").on(table.userId),
    index("opportunity_requirements_opportunity_id_idx").on(table.opportunityId),
  ],
);
export const opportunityAnalyses = sqliteTable(
  "opportunity_analyses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => jobOpportunities.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    score: text("score").notNull(),
    scoreScale: text("score_scale").notNull().default("0-100"),
    recommendation: text("recommendation", { enum: analysisRecommendationValues }).notNull(),
    strengths: text("strengths").notNull().default("[]"),
    gaps: text("gaps").notNull().default("[]"),
    risks: text("risks").notNull().default("[]"),
    modelVersion: text("model_version"),
    promptVersion: text("prompt_version"),
    confirmedAt: text("confirmed_at"),
    correctionNote: text("correction_note"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("opportunity_analyses_version_unique").on(table.opportunityId, table.version),
    index("opportunity_analyses_user_id_idx").on(table.userId),
    index("opportunity_analyses_opportunity_id_idx").on(table.opportunityId),
  ],
);
export const opportunityAnalysisEvidence = sqliteTable(
  "opportunity_analysis_evidence",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    analysisId: text("analysis_id")
      .notNull()
      .references(() => opportunityAnalyses.id, { onDelete: "cascade" }),
    careerItemId: text("career_item_id")
      .notNull()
      .references(() => careerItems.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("opportunity_analysis_evidence_unique").on(table.analysisId, table.careerItemId),
    index("opportunity_analysis_evidence_user_id_idx").on(table.userId),
  ],
);
export const applicationEvidence = sqliteTable(
  "application_evidence",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    applicationId: text("application_id")
      .notNull()
      .references(() => jobApplications.id, { onDelete: "cascade" }),
    careerItemId: text("career_item_id")
      .notNull()
      .references(() => careerItems.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("application_evidence_user_id_idx").on(table.userId),
    index("application_evidence_application_id_idx").on(table.applicationId),
  ],
);
export const applicationDocumentVersions = sqliteTable(
  "application_document_versions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    applicationId: text("application_id")
      .notNull()
      .references(() => jobApplications.id, { onDelete: "cascade" }),
    documentType: text("document_type").notNull().default("cover_letter"),
    status: text("status").notNull().default("draft"),
    version: text("version").notNull().default("1"),
    content: text("content").notNull(),
    sourceNote: text("source_note").notNull().default(""),
    analysisId: text("analysis_id").references(() => opportunityAnalyses.id, {
      onDelete: "set null",
    }),
    evidenceSnapshot: text("evidence_snapshot").notNull().default("[]"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("application_document_versions_type_version_unique").on(
      table.applicationId,
      table.documentType,
      table.version,
    ),
    index("application_document_versions_user_id_idx").on(table.userId),
    index("application_document_versions_application_id_idx").on(table.applicationId),
  ],
);
export const applicationAttachments = sqliteTable(
  "application_attachments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    applicationId: text("application_id")
      .notNull()
      .references(() => jobApplications.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    fileName: text("file_name").notNull(),
    objectKey: text("object_key").notNull().unique(),
    contentType: text("content_type").notNull(),
    size: text("size").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("application_attachments_user_id_idx").on(table.userId),
    index("application_attachments_application_id_idx").on(table.applicationId),
  ],
);
export const applicationTimelineEvents = sqliteTable(
  "application_timeline_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    applicationId: text("application_id")
      .notNull()
      .references(() => jobApplications.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    occurredAt: text("occurred_at").notNull(),
    note: text("note").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("application_timeline_events_user_id_idx").on(table.userId),
    index("application_timeline_events_application_id_idx").on(table.applicationId),
  ],
);
