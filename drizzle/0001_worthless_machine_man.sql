CREATE TABLE `private_notes` (
	`user_id` text PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`salt` text NOT NULL,
	`iv` text NOT NULL,
	`ciphertext` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated` text NOT NULL
);
