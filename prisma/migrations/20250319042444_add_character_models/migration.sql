-- AlterTable
ALTER TABLE `CartItem` ADD COLUMN `size` ENUM('S', 'M', 'L', 'XL', 'XXL') NULL;

-- AlterTable
ALTER TABLE `Item` ADD COLUMN `characterId` VARCHAR(191) NULL,
    ADD COLUMN `hasSizes` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `size` ENUM('S', 'M', 'L', 'XL', 'XXL') NULL;

-- CreateTable
CREATE TABLE `ItemSize` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `size` ENUM('S', 'M', 'L', 'XL', 'XXL') NOT NULL,
    `inventory` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ItemSize_itemId_size_key`(`itemId`, `size`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Character` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `characterSeriesId` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 999,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterSeries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 999,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CharacterSeries_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `cart_item_with_size` ON `CartItem`(`cartId`, `itemId`, `size`);

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemSize` ADD CONSTRAINT `ItemSize_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_characterSeriesId_fkey` FOREIGN KEY (`characterSeriesId`) REFERENCES `CharacterSeries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
