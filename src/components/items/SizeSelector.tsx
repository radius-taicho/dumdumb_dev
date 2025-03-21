import React from 'react';
import { Size } from '@prisma/client';
import SizeOption from './SizeOption';

type SizeSelectorProps = {
  onSizeSelect: (size: Size | null) => void;
  selectedSize: Size | null;
  hasSizes: boolean;
  itemSizes: { size: Size; inventory: number }[];
};

const SizeSelector: React.FC<SizeSelectorProps> = ({ 
  onSizeSelect, 
  selectedSize, 
  hasSizes, 
  itemSizes 
}) => {
  const sizes: Size[] = ["S", "M", "L", "XL", "XXL"];

  // サイズの在庫状況を取得
  const getInventory = (size: Size): number => {
    if (!hasSizes) return 999; // サイズ管理していない場合は在庫ありとする
    const sizeData = itemSizes.find((item) => item.size === size);
    return sizeData ? sizeData.inventory : 0;
  };

  if (!hasSizes) {
    return (
      <div className="text-sm text-gray-500">
        このアイテムはサイズの区別がありません
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {sizes.map((size) => (
        <SizeOption
          key={size}
          size={size}
          isSelected={selectedSize === size}
          inventory={getInventory(size)}
          onSelect={() => onSizeSelect(size)}
        />
      ))}
    </div>
  );
};

export default SizeSelector;