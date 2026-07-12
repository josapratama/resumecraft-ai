CREATE TABLE `certifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvId` int NOT NULL,
	`position` int NOT NULL,
	`certificationName` varchar(255) NOT NULL,
	`issuer` varchar(255) NOT NULL,
	`issueDate` varchar(10),
	`expiryDate` varchar(10),
	`link` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cvs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`template` enum('modern','classic','minimal') NOT NULL DEFAULT 'modern',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cvs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `educations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvId` int NOT NULL,
	`position` int NOT NULL,
	`degree` varchar(255) NOT NULL,
	`field` varchar(255) NOT NULL,
	`school` varchar(255) NOT NULL,
	`location` varchar(255),
	`graduationDate` varchar(10),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `educations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personalInfos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvId` int NOT NULL,
	`fullName` varchar(255),
	`email` varchar(320),
	`phone` varchar(20),
	`location` varchar(255),
	`professionalSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personalInfos_id` PRIMARY KEY(`id`),
	CONSTRAINT `personalInfos_cvId_unique` UNIQUE(`cvId`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvId` int NOT NULL,
	`position` int NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`description` text,
	`technologies` text,
	`link` varchar(2048),
	`startDate` varchar(10),
	`endDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvId` int NOT NULL,
	`position` int NOT NULL,
	`category` varchar(255) NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`proficiency` enum('beginner','intermediate','advanced','expert'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workExperiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvId` int NOT NULL,
	`position` int NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`company` varchar(255) NOT NULL,
	`location` varchar(255),
	`startDate` varchar(10),
	`endDate` varchar(10),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workExperiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `certifications` ADD CONSTRAINT `certifications_cvId_cvs_id_fk` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cvs` ADD CONSTRAINT `cvs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `educations` ADD CONSTRAINT `educations_cvId_cvs_id_fk` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personalInfos` ADD CONSTRAINT `personalInfos_cvId_cvs_id_fk` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_cvId_cvs_id_fk` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `skills` ADD CONSTRAINT `skills_cvId_cvs_id_fk` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workExperiences` ADD CONSTRAINT `workExperiences_cvId_cvs_id_fk` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE no action ON UPDATE no action;