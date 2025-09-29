/*
  Warnings:

  - A unique constraint covering the columns `[anonymousSessionId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `CartItem_cartId_itemId_key` ON `CartItem`;

-- AlterTable
ALTER TABLE `Cart` ADD COLUMN `anonymousSessionId` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `AnonymousSession` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AnonymousSession_token_key`(`token`),
    INDEX `AnonymousSession_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnonymousFavorite` (
    `id` VARCHAR(191) NOT NULL,
    `anonymousSessionId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AnonymousFavorite_anonymousSessionId_idx`(`anonymousSessionId`),
    INDEX `AnonymousFavorite_itemId_idx`(`itemId`),
    UNIQUE INDEX `AnonymousFavorite_anonymousSessionId_itemId_key`(`anonymousSessionId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `type` ENUM('RESTOCK', 'NEW_SERIES', 'NEW_ITEM', 'PRICE_CHANGE', 'SYSTEM') NOT NULL,
    `itemId` VARCHAR(191) NULL,
    `characterSeriesId` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestockSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `itemSizeId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RestockSubscription_userId_idx`(`userId`),
    INDEX `RestockSubscription_itemSizeId_idx`(`itemSizeId`),
    UNIQUE INDEX `RestockSubscription_userId_itemSizeId_key`(`userId`, `itemSizeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeriesSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `characterSeriesId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SeriesSubscription_userId_idx`(`userId`),
    INDEX `SeriesSubscription_characterSeriesId_idx`(`characterSeriesId`),
    UNIQUE INDEX `SeriesSubscription_userId_characterSeriesId_key`(`userId`, `characterSeriesId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Cart_anonymousSessionId_key` ON `Cart`(`anonymousSessionId`);

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_anonymousSessionId_fkey` FOREIGN KEY (`anonymousSessionId`) REFERENCES `AnonymousSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnonymousFavorite` ADD CONSTRAINT `AnonymousFavorite_anonymousSessionId_fkey` FOREIGN KEY (`anonymousSessionId`) REFERENCES `AnonymousSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnonymousFavorite` ADD CONSTRAINT `AnonymousFavorite_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestockSubscription` ADD CONSTRAINT `RestockSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestockSubscription` ADD CONSTRAINT `RestockSubscription_itemSizeId_fkey` FOREIGN KEY (`itemSizeId`) REFERENCES `ItemSize`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeriesSubscription` ADD CONSTRAINT `SeriesSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeriesSubscription` ADD CONSTRAINT `SeriesSubscription_characterSeriesId_fkey` FOREIGN KEY (`characterSeriesId`) REFERENCES `CharacterSeries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `CartItem` RENAME INDEX `cart_item_with_size` TO `CartItem_cartId_itemId_size_idx`;
