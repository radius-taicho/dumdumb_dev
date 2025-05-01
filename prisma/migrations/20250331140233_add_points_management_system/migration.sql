/*
  Warnings:

  - Added the required column `type` to the `Point` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Point` ADD COLUMN `campaignId` VARCHAR(191) NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `orderId` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `PointRule` (
    `id` VARCHAR(191) NOT NULL,
    `defaultRate` DOUBLE NOT NULL,
    `defaultExpiryDays` INTEGER NOT NULL,
    `minPurchaseAmount` DOUBLE NULL,
    `minPointsToUse` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemPointRule` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `pointRate` DOUBLE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ItemPointRule_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoryPointRule` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `pointRate` DOUBLE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CategoryPointRule_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PointCampaign` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `multiplier` DOUBLE NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSpecialEvent` BOOLEAN NOT NULL DEFAULT false,
    `specialEventType` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PointCampaignItem` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,

    INDEX `PointCampaignItem_campaignId_idx`(`campaignId`),
    INDEX `PointCampaignItem_itemId_idx`(`itemId`),
    UNIQUE INDEX `PointCampaignItem_campaignId_itemId_key`(`campaignId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PointCampaignCategory` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `PointCampaignCategory_campaignId_idx`(`campaignId`),
    INDEX `PointCampaignCategory_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `PointCampaignCategory_campaignId_categoryId_key`(`campaignId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Point_orderId_idx` ON `Point`(`orderId`);

-- CreateIndex
CREATE INDEX `Point_campaignId_idx` ON `Point`(`campaignId`);

-- CreateIndex
CREATE INDEX `Point_type_idx` ON `Point`(`type`);

-- CreateIndex
CREATE INDEX `Point_expiresAt_idx` ON `Point`(`expiresAt`);

-- AddForeignKey
ALTER TABLE `Point` ADD CONSTRAINT `Point_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Point` ADD CONSTRAINT `Point_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `PointCampaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPointRule` ADD CONSTRAINT `ItemPointRule_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryPointRule` ADD CONSTRAINT `CategoryPointRule_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointCampaignItem` ADD CONSTRAINT `PointCampaignItem_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `PointCampaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointCampaignItem` ADD CONSTRAINT `PointCampaignItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointCampaignCategory` ADD CONSTRAINT `PointCampaignCategory_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `PointCampaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointCampaignCategory` ADD CONSTRAINT `PointCampaignCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Point` RENAME INDEX `Point_userId_fkey` TO `Point_userId_idx`;
