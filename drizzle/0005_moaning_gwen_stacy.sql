CREATE TABLE `application_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`application_id` text NOT NULL,
	`kind` text NOT NULL,
	`file_name` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`application_id`) REFERENCES `job_applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `application_attachments_object_key_unique` ON `application_attachments` (`object_key`);--> statement-breakpoint
CREATE INDEX `application_attachments_user_id_idx` ON `application_attachments` (`user_id`);--> statement-breakpoint
CREATE INDEX `application_attachments_application_id_idx` ON `application_attachments` (`application_id`);