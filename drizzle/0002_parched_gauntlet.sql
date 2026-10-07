CREATE TABLE `order_ops` (
	`order_id` text PRIMARY KEY NOT NULL,
	`note` text,
	`courier_name` text,
	`courier_vehicle` text,
	`tracking_hash` text
);
