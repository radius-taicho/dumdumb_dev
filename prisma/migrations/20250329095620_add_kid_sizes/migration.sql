-- AlterTable
ALTER TABLE `CartItem` MODIFY `size` ENUM('S', 'M', 'L', 'XL', 'XXL', 'KID_100', 'KID_110', 'KID_120', 'KID_130', 'KID_140') NULL;

-- AlterTable
ALTER TABLE `ItemSize` MODIFY `size` ENUM('S', 'M', 'L', 'XL', 'XXL', 'KID_100', 'KID_110', 'KID_120', 'KID_130', 'KID_140') NOT NULL;

-- AlterTable
ALTER TABLE `OrderItem` MODIFY `size` ENUM('S', 'M', 'L', 'XL', 'XXL', 'KID_100', 'KID_110', 'KID_120', 'KID_130', 'KID_140') NULL;
