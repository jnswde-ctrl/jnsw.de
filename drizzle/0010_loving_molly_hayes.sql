ALTER TABLE `application_document_versions` ADD `document_type` text DEFAULT 'cover_letter' NOT NULL;--> statement-breakpoint
ALTER TABLE `application_document_versions` ADD `status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `application_document_versions` ADD `version` text DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE `application_document_versions` ADD `source_note` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `application_document_versions` ADD `analysis_id` text REFERENCES opportunity_analyses(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `application_document_versions` ADD `evidence_snapshot` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `application_document_versions_type_version_unique` ON `application_document_versions` (`application_id`,`document_type`,`version`);
