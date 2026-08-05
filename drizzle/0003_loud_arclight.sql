CREATE TABLE `application_document_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`application_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`application_id`) REFERENCES `job_applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `application_document_versions_user_id_idx` ON `application_document_versions` (`user_id`);--> statement-breakpoint
CREATE INDEX `application_document_versions_application_id_idx` ON `application_document_versions` (`application_id`);--> statement-breakpoint
CREATE TABLE `application_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`application_id` text NOT NULL,
	`career_item_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`application_id`) REFERENCES `job_applications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`career_item_id`) REFERENCES `career_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `application_evidence_user_id_idx` ON `application_evidence` (`user_id`);--> statement-breakpoint
CREATE INDEX `application_evidence_application_id_idx` ON `application_evidence` (`application_id`);--> statement-breakpoint
CREATE TABLE `application_timeline_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`application_id` text NOT NULL,
	`type` text NOT NULL,
	`occurred_at` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`application_id`) REFERENCES `job_applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `application_timeline_events_user_id_idx` ON `application_timeline_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `application_timeline_events_application_id_idx` ON `application_timeline_events` (`application_id`);--> statement-breakpoint
CREATE TABLE `career_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`organization` text,
	`description` text DEFAULT '' NOT NULL,
	`link` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `career_items_user_id_idx` ON `career_items` (`user_id`);--> statement-breakpoint
CREATE TABLE `job_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`job_url` text,
	`deadline_at` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`follow_up_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `job_applications_user_id_idx` ON `job_applications` (`user_id`);--> statement-breakpoint
CREATE INDEX `job_applications_user_status_idx` ON `job_applications` (`user_id`,`status`);