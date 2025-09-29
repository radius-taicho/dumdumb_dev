-- CreateTable
CREATE TABLE `Point` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coupon` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `discountType` VARCHAR(191) NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `minimumPurchase` DOUBLE NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Coupon_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CouponTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `discountType` VARCHAR(191) NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `minimumPurchase` DOUBLE NULL,
    `validDays` INTEGER NOT NULL,
    `maxUses` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CouponTemplateProduct` (
    `id` VARCHAR(191) NOT NULL,
    `couponTemplateId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    INDEX `CouponTemplateProduct_couponTemplateId_idx`(`couponTemplateId`),
    INDEX `CouponTemplateProduct_productId_idx`(`productId`),
    UNIQUE INDEX `CouponTemplateProduct_couponTemplateId_productId_key`(`couponTemplateId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CouponTemplateCategory` (
    `id` VARCHAR(191) NOT NULL,
    `couponTemplateId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `CouponTemplateCategory_couponTemplateId_idx`(`couponTemplateId`),
    INDEX `CouponTemplateCategory_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `CouponTemplateCategory_couponTemplateId_categoryId_key`(`couponTemplateId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CouponTemplateExcludedProduct` (
    `id` VARCHAR(191) NOT NULL,
    `couponTemplateId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    INDEX `CouponTemplateExcludedProduct_couponTemplateId_idx`(`couponTemplateId`),
    INDEX `CouponTemplateExcludedProduct_productId_idx`(`productId`),
    UNIQUE INDEX `CouponTemplateExcludedProduct_couponTemplateId_productId_key`(`couponTemplateId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CouponTemplateExcludedCategory` (
    `id` VARCHAR(191) NOT NULL,
    `couponTemplateId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `CouponTemplateExcludedCategory_couponTemplateId_idx`(`couponTemplateId`),
    INDEX `CouponTemplateExcludedCategory_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `CouponTemplateExcludedCategory_couponTemplateId_categoryId_key`(`couponTemplateId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CouponUsageHistory` (
    `id` VARCHAR(191) NOT NULL,
    `couponId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `usedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Point` ADD CONSTRAINT `Point_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponTemplateProduct` ADD CONSTRAINT `CouponTemplateProduct_couponTemplateId_fkey` FOREIGN KEY (`couponTemplateId`) REFERENCES `CouponTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponTemplateProduct` ADD CONSTRAINT `CouponTemplateProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponTemplateCategory` ADD CONSTRAINT `CouponTemplateCategory_couponTemplateId_fkey` FOREIGN KEY (`couponTemplateId`) REFERENCES `CouponTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponTemplateCategory` ADD CONSTRAINT `CouponTemplateCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponTemplateExcludedProduct` ADD CONSTRAINT `CouponTemplateExcludedProduct_couponTemplateId_fkey` FOREIGN KEY (`couponTemplateId`) REFERENCES `CouponTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponTemplateExcludedProduct` ADD CONSTRAINT `CouponTemplateExcludedProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponTemplateExcludedCategory` ADD CONSTRAINT `CouponTemplateExcludedCategory_couponTemplateId_fkey` FOREIGN KEY (`couponTemplateId`) REFERENCES `CouponTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponTemplateExcludedCategory` ADD CONSTRAINT `CouponTemplateExcludedCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
