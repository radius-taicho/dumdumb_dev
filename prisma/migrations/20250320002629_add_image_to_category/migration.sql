-- AlterTable
ALTER TABLE `Category` ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `mediaId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
