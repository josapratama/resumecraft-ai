CREATE TABLE IF NOT EXISTS `coverLetters` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `cvId` int NOT NULL,
  `userId` int NOT NULL,
  `template` varchar(64) NOT NULL DEFAULT 'standard-indonesian',
  `title` varchar(255) NOT NULL DEFAULT 'Surat Lamaran Kerja',
  `recipientCompany` varchar(255),
  `recipientName` varchar(255),
  `jobTitle` varchar(255),
  `data` json NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `coverLetters_cvId_fk` FOREIGN KEY (`cvId`) REFERENCES `cvs`(`id`) ON DELETE CASCADE,
  CONSTRAINT `coverLetters_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `authProvider` varchar(32) NOT NULL DEFAULT 'local';
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `authHubId` varchar(128);
