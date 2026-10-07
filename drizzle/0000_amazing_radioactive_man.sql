CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`status` integer DEFAULT 0 NOT NULL,
	`date` text DEFAULT '' NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`created` text NOT NULL
);
