CREATE TABLE `access_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`generation` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_batch_generation` ON `access_batches` (`email`,`generation`);--> statement-breakpoint
CREATE TABLE `access_codes` (
	`hash` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`batch` text NOT NULL,
	`used` text
);
--> statement-breakpoint
CREATE INDEX `access_codes_email` ON `access_codes` (`email`);--> statement-breakpoint
CREATE TABLE `staff_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `staff_sessions_expiry` ON `staff_sessions` (`expires`);