CREATE TABLE `drafts` (
	`owner` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`nonce` text NOT NULL,
	`data` text NOT NULL,
	`status` text NOT NULL,
	`known_total` integer NOT NULL,
	`total` integer,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	`confirmed` integer,
	`eta` integer,
	`events` text NOT NULL,
	`courier_hash` text
);
--> statement-breakpoint
CREATE INDEX `orders_owner_idx` ON `orders` (`owner`);--> statement-breakpoint
CREATE INDEX `orders_status_created_idx` ON `orders` (`status`,`created`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_nonce_idx` ON `orders` (`owner`,`nonce`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`window` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`endpoint` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`audience` text NOT NULL,
	`data` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `subscriptions_owner_idx` ON `subscriptions` (`owner`);--> statement-breakpoint
CREATE INDEX `subscriptions_audience_idx` ON `subscriptions` (`audience`);