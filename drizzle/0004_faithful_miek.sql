CREATE TABLE `wallets` (
	`owner` text PRIMARY KEY NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "wallet_nonnegative" CHECK("wallets"."balance" >= 0)
);
