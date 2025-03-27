-- XXLサイズを追加するマイグレーション
ALTER TABLE `_prisma_migrations` ADD COLUMN IF NOT EXISTS `migration_name` VARCHAR(191) NULL;

-- サイズ列挙型にXXLを追加
ALTER TYPE Size ADD VALUE 'XXL' AFTER 'XL';
