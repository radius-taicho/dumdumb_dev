/*
  Warnings:

  - You are about to drop the column `characterId` on the `Item` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_characterId_fkey`;

-- AlterTable
ALTER TABLE `Item` DROP COLUMN `characterId`;

-- CreateTable
CREATE TABLE `ItemCharacter` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ItemCharacter_itemId_idx`(`itemId`),
    INDEX `ItemCharacter_characterId_idx`(`characterId`),
    UNIQUE INDEX `ItemCharacter_itemId_characterId_key`(`itemId`, `characterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemCharacter` ADD CONSTRAINT `ItemCharacter_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemCharacter` ADD CONSTRAINT `ItemCharacter_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
