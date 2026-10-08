DROP INDEX `payments_order`;--> statement-breakpoint
CREATE UNIQUE INDEX `payments_order` ON `payments` (`order_id`);