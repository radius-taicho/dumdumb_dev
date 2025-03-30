-- AlterTable
ALTER TABLE `SiteInfo` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ItemViewHistory` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `viewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `anonymousSessionId` VARCHAR(191) NULL,

    INDEX `ItemViewHistory_userId_idx`(`userId`),
    INDEX `ItemViewHistory_itemId_idx`(`itemId`),
    INDEX `ItemViewHistory_anonymousSessionId_idx`(`anonymousSessionId`),
    INDEX `ItemViewHistory_viewedAt_idx`(`viewedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemViewHistory` ADD CONSTRAINT `ItemViewHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemViewHistory` ADD CONSTRAINT `ItemViewHistory_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemViewHistory` ADD CONSTRAINT `ItemViewHistory_anonymousSessionId_fkey` FOREIGN KEY (`anonymousSessionId`) REFERENCES `AnonymousSession`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
