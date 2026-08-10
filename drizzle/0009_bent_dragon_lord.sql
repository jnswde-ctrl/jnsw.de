CREATE TABLE `opportunity_analyses` (
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
	`model_version` text,
	`prompt_version` text,
	`confirmed_at` text,
	`correction_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`opportunity_id`) REFERENCES `job_opportunities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opportunity_analyses_version_unique` ON `opportunity_analyses` (`opportunity_id`,`version`);--> statement-breakpoint
CREATE INDEX `opportunity_analyses_user_id_idx` ON `opportunity_analyses` (`user_id`);--> statement-breakpoint
CREATE INDEX `opportunity_analyses_opportunity_id_idx` ON `opportunity_analyses` (`opportunity_id`);--> statement-breakpoint
CREATE TABLE `opportunity_analysis_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`analysis_id` text NOT NULL,
	`career_item_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`analysis_id`) REFERENCES `opportunity_analyses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`career_item_id`) REFERENCES `career_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opportunity_analysis_evidence_unique` ON `opportunity_analysis_evidence` (`analysis_id`,`career_item_id`);--> statement-breakpoint
CREATE INDEX `opportunity_analysis_evidence_user_id_idx` ON `opportunity_analysis_evidence` (`user_id`);--> statement-breakpoint
CREATE TABLE `opportunity_requirements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opportunity_id` text NOT NULL,
	`text` text NOT NULL,
	`kind` text NOT NULL,
	`assessment` text DEFAULT 'unknown' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`opportunity_id`) REFERENCES `job_opportunities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `opportunity_requirements_user_id_idx` ON `opportunity_requirements` (`user_id`);--> statement-breakpoint
CREATE INDEX `opportunity_requirements_opportunity_id_idx` ON `opportunity_requirements` (`opportunity_id`);--> statement-breakpoint
CREATE TABLE `profile_skill_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`skill_id` text NOT NULL,
	`career_item_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skill_id`) REFERENCES `profile_skills`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`career_item_id`) REFERENCES `career_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_skill_evidence_unique` ON `profile_skill_evidence` (`skill_id`,`career_item_id`);--> statement-breakpoint
CREATE INDEX `profile_skill_evidence_user_id_idx` ON `profile_skill_evidence` (`user_id`);--> statement-breakpoint
CREATE TABLE `profile_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`level` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_skills_user_name_unique` ON `profile_skills` (`user_id`,`name`);--> statement-breakpoint
CREATE INDEX `profile_skills_user_id_idx` ON `profile_skills` (`user_id`);