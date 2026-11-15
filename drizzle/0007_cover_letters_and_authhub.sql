CREATE TABLE `coverLetters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvId` int NOT NULL,
	`userId` int NOT NULL,
	`template` varchar(64) NOT NULL DEFAULT 'standard-indonesian',
	`title` varchar(255) NOT NULL DEFAULT 'Surat Lamaran Kerja',
	`recipientCompany` varchar(255),
	`recipientName` varchar(255),
	`jobTitle` varchar(255),
	`data` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coverLetters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `authProvider` varchar(32) NOT NULL DEFAULT 'local';
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `authHubId` varchar(128);
--> statement-breakpoint
ALTER TABLE `coverLetters` ADD CONSTRAINT `coverLetters_cvId_fk` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `coverLetters` ADD CONSTRAINT `coverLetters_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
