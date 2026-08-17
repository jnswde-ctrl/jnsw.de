CREATE TABLE `job_opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_key` text NOT NULL,
	`source_type` text NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`job_url` text,
	`location` text,
	`remote_model` text DEFAULT 'unknown' NOT NULL,
	`advertised_salary` text,
	`deadline_at` text,
	`application_method` text,
	`source_checked_at` text,
	`listing_status` text DEFAULT 'unknown' NOT NULL,
	`review_status` text DEFAULT 'unreviewed' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_opportunities_user_source_key_unique` ON `job_opportunities` (`user_id`,`source_key`);--> statement-breakpoint
CREATE INDEX `job_opportunities_user_id_idx` ON `job_opportunities` (`user_id`);--> statement-breakpoint
CREATE INDEX `job_opportunities_user_review_status_idx` ON `job_opportunities` (`user_id`,`review_status`);--> statement-breakpoint
CREATE TABLE `opportunity_timeline_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opportunity_id` text NOT NULL,
	`type` text NOT NULL,
	`occurred_at` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`opportunity_id`) REFERENCES `job_opportunities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `opportunity_timeline_events_user_id_idx` ON `opportunity_timeline_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `opportunity_timeline_events_opportunity_id_idx` ON `opportunity_timeline_events` (`opportunity_id`);--> statement-breakpoint
ALTER TABLE `job_applications` ADD `opportunity_id` text REFERENCES job_opportunities(id);--> statement-breakpoint
ALTER TABLE `job_applications` ADD `application_method` text;--> statement-breakpoint
ALTER TABLE `job_applications` ADD `applied_at` text;--> statement-breakpoint
INSERT INTO `job_opportunities` (
	`id`, `user_id`, `source_key`, `source_type`, `company`, `role`, `job_url`,
	`advertised_salary`, `deadline_at`, `notes`, `created_at`, `updated_at`, `archived_at`
)
SELECT
	'legacy:' || `id`, `user_id`, 'legacy:' || `id`, 'import', `company`, `role`, `job_url`,
	`salary`, `deadline_at`, `notes`, `created_at`, `updated_at`, `archived_at`
FROM `job_applications`
WHERE `opportunity_id` IS NULL;--> statement-breakpoint
UPDATE `job_applications`
SET `opportunity_id` = 'legacy:' || `id`
WHERE `opportunity_id` IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `job_applications_opportunity_id_unique` ON `job_applications` (`opportunity_id`);
