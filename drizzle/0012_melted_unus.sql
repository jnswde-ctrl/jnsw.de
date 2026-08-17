DROP TRIGGER `opportunity_analyses_immutable`;--> statement-breakpoint
DROP TRIGGER `opportunity_requirements_analysis_owner`;--> statement-breakpoint
DROP TRIGGER `opportunity_analysis_evidence_owner`;--> statement-breakpoint
DROP TRIGGER `opportunity_analysis_confirmations_owner`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_opportunity_analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opportunity_id` text NOT NULL,
	`version` text NOT NULL,
	`score` text NOT NULL,
	`score_scale` text DEFAULT '0-100' NOT NULL,
	`recommendation` text NOT NULL,
	`strengths` text DEFAULT '[]' NOT NULL,
	`gaps` text DEFAULT '[]' NOT NULL,
	`risks` text DEFAULT '[]' NOT NULL,
	`profile_version` text NOT NULL,
	`model_version` text NOT NULL,
	`prompt_version` text NOT NULL,
	`supersedes_analysis_id` text,
	`confirmed_at` text,
	`correction_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`opportunity_id`) REFERENCES `job_opportunities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`supersedes_analysis_id`) REFERENCES `opportunity_analyses`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_opportunity_analyses`("id", "user_id", "opportunity_id", "version", "score", "score_scale", "recommendation", "strengths", "gaps", "risks", "profile_version", "model_version", "prompt_version", "supersedes_analysis_id", "confirmed_at", "correction_note", "created_at") SELECT "id", "user_id", "opportunity_id", "version", "score", "score_scale", "recommendation", "strengths", "gaps", "risks", 'legacy-unversioned', COALESCE("model_version", 'legacy-unknown'), COALESCE("prompt_version", 'legacy-unknown'), NULL, "confirmed_at", "correction_note", "created_at" FROM `opportunity_analyses`;--> statement-breakpoint
DROP TABLE `opportunity_analyses`;--> statement-breakpoint
ALTER TABLE `__new_opportunity_analyses` RENAME TO `opportunity_analyses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `opportunity_analyses_version_unique` ON `opportunity_analyses` (`opportunity_id`,`version`);--> statement-breakpoint
CREATE INDEX `opportunity_analyses_user_id_idx` ON `opportunity_analyses` (`user_id`);--> statement-breakpoint
CREATE INDEX `opportunity_analyses_opportunity_id_idx` ON `opportunity_analyses` (`opportunity_id`);
--> statement-breakpoint
CREATE TRIGGER `opportunity_analyses_immutable`
BEFORE UPDATE ON `opportunity_analyses`
BEGIN SELECT RAISE(ABORT, 'analysis versions are immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `opportunity_requirements_analysis_owner`
BEFORE INSERT ON `opportunity_requirements`
WHEN NEW.`analysis_id` IS NULL OR NOT EXISTS (SELECT 1 FROM `opportunity_analyses` WHERE `id` = NEW.`analysis_id` AND `user_id` = NEW.`user_id` AND `opportunity_id` = NEW.`opportunity_id`)
BEGIN SELECT RAISE(ABORT, 'analysis ownership mismatch'); END;
--> statement-breakpoint
CREATE TRIGGER `opportunity_analysis_evidence_owner`
BEFORE INSERT ON `opportunity_analysis_evidence`
WHEN NOT EXISTS (SELECT 1 FROM `opportunity_analyses` WHERE `id` = NEW.`analysis_id` AND `user_id` = NEW.`user_id`)
OR NOT EXISTS (SELECT 1 FROM `career_items` WHERE `id` = NEW.`career_item_id` AND `user_id` = NEW.`user_id`)
BEGIN SELECT RAISE(ABORT, 'analysis evidence ownership mismatch'); END;
--> statement-breakpoint
CREATE TRIGGER `opportunity_analysis_confirmations_owner`
BEFORE INSERT ON `opportunity_analysis_confirmations`
WHEN NOT EXISTS (SELECT 1 FROM `opportunity_analyses` WHERE `id` = NEW.`analysis_id` AND `user_id` = NEW.`user_id`)
BEGIN SELECT RAISE(ABORT, 'analysis confirmation ownership mismatch'); END;
--> statement-breakpoint
CREATE TRIGGER `opportunity_requirements_immutable`
BEFORE UPDATE ON `opportunity_requirements`
BEGIN SELECT RAISE(ABORT, 'analysis requirements are immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `opportunity_analysis_evidence_immutable`
BEFORE UPDATE ON `opportunity_analysis_evidence`
BEGIN SELECT RAISE(ABORT, 'analysis evidence is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `opportunity_analysis_confirmations_immutable`
BEFORE UPDATE ON `opportunity_analysis_confirmations`
BEGIN SELECT RAISE(ABORT, 'analysis confirmations are immutable'); END;
