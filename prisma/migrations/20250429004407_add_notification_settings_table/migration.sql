-- CreateTable
CREATE TABLE `UserNotificationSettings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `receiveAllNotifications` BOOLEAN NOT NULL DEFAULT true,
    `receiveSiteNotifications` BOOLEAN NOT NULL DEFAULT true,
    `receiveEmailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `notificationFrequency` VARCHAR(191) NOT NULL DEFAULT 'realtime',
    `seriesNotifications` BOOLEAN NOT NULL DEFAULT true,
    `characterNotifications` BOOLEAN NOT NULL DEFAULT true,
    `waitingNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pointsNotifications` BOOLEAN NOT NULL DEFAULT true,
    `couponNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pointsEarnedNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pointsExpiringNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pointsExpiryNoticeDays` INTEGER NOT NULL DEFAULT 14,
    `couponIssuedNotifications` BOOLEAN NOT NULL DEFAULT true,
    `couponExpiringNotifications` BOOLEAN NOT NULL DEFAULT true,
    `couponExpiryNoticeDays` INTEGER NOT NULL DEFAULT 7,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserNotificationSettings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserNotificationSettings` ADD CONSTRAINT `UserNotificationSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
