-- AlterTable
ALTER TABLE `CharacterSeries` ADD COLUMN `isMainVideo` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `subMediaId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ItemCharacter` ADD COLUMN `displayOrder` INTEGER NOT NULL DEFAULT 999;

-- AlterTable
ALTER TABLE `Media` ADD COLUMN `metadata` TEXT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `SliderImage` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `mediaId` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 999,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SliderImage` ADD CONSTRAINT `SliderImage_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterSeries` ADD CONSTRAINT `CharacterSeries_subMediaId_fkey` FOREIGN KEY (`subMediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
