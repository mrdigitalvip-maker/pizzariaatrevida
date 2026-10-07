CREATE TABLE `customer_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`password` text NOT NULL,
	`salt` text NOT NULL,
	`recovery` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_accounts_email_unique` ON `customer_accounts` (`email`);--> statement-breakpoint
CREATE TABLE `customer_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `customer_sessions_account` ON `customer_sessions` (`account_id`);--> statement-breakpoint
CREATE TABLE `drivers` (
	`slot` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`vehicle` text NOT NULL,
	`photo_key` text,
	`token_hash` text,
	`active` integer DEFAULT 1 NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `section_settings` (
	`owner` text NOT NULL,
	`section` text NOT NULL,
	`data` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `section_settings_owner` ON `section_settings` (`owner`,`section`);--> statement-breakpoint
ALTER TABLE `order_ops` ADD `driver_slot` integer;