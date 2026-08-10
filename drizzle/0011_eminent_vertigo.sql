CREATE TABLE `opportunity_analysis_confirmations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`analysis_id` text NOT NULL,
	`correction_note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`analysis_id`) REFERENCES `opportunity_analyses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opportunity_analysis_confirmations_analysis_unique` ON `opportunity_analysis_confirmations` (`analysis_id`);--> statement-breakpoint
CREATE INDEX `opportunity_analysis_confirmations_user_id_idx` ON `opportunity_analysis_confirmations` (`user_id`);--> statement-breakpoint
ALTER TABLE `opportunity_requirements` ADD `analysis_id` text REFERENCES opportunity_analyses(id);--> statement-breakpoint
ALTER TABLE `opportunity_requirements` ADD `evidence_item_ids` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
UPDATE `opportunity_requirements`
SET `analysis_id` = (
  SELECT `id` FROM `opportunity_analyses`
  WHERE `opportunity_id` = `opportunity_requirements`.`opportunity_id`
    AND `user_id` = `opportunity_requirements`.`user_id`
  ORDER BY CAST(`version` AS INTEGER) DESC LIMIT 1
)
WHERE `analysis_id` IS NULL;--> statement-breakpoint
CREATE INDEX `opportunity_requirements_analysis_id_idx` ON `opportunity_requirements` (`analysis_id`);
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
