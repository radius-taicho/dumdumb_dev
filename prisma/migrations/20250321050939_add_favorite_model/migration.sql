-- CreateIndex
CREATE INDEX `Favorite_userId_idx` ON `Favorite`(`userId`);

-- RenameIndex
ALTER TABLE `Favorite` RENAME INDEX `Favorite_itemId_fkey` TO `Favorite_itemId_idx`;
