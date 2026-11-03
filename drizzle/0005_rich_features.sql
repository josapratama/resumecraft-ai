ALTER TABLE `cvs` ADD COLUMN `isPublic` int NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `cvs` ADD COLUMN `shareSlug` varchar(128);
--> statement-breakpoint
ALTER TABLE `cvs` ADD COLUMN `viewsCount` int NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `cvs` ADD COLUMN `accentColor` varchar(32);
--> statement-breakpoint
ALTER TABLE `cvs` ADD COLUMN `fontFamily` varchar(64);
--> statement-breakpoint
ALTER TABLE `cvs` ADD COLUMN `targetRole` varchar(255);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvId` int NOT NULL,
	`position` int NOT NULL,
	`language` varchar(128) NOT NULL,
	`proficiency` varchar(64) NOT NULL DEFAULT 'Professional Working',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `languages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvId` int NOT NULL,
	`position` int NOT NULL,
	`category` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`date` varchar(64),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customSections_id` PRIMARY KEY(`id`)
);

