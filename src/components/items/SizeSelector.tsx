import React from "react";
import { Size } from "@prisma/client";
import SizeOption from "./SizeOption";

type SizeSelectorProps = {
  onSizeSelect: (size: Size | null) => void;
  selectedSize: Size | null;
  hasSizes: boolean;
  itemSizes: { size: Size; inventory: number }[];
  gender?: string | null; // 性別情報を追加
};

const SizeSelector: React.FC<SizeSelectorProps> = ({
  onSizeSelect,
  selectedSize,
  hasSizes,
  itemSizes,
  gender,
}) => {
  // KIDS用サイズと通常サイズを分ける
  const adultSizes: Size[] = ["S", "M", "L", "XL", "XXL"];
  const kidsSizes: Size[] = [
    "KID_100",
    "KID_110",
    "KID_120",
    "KID_130",
    "KID_140",
  ];

  // アイテムのジェンダーに基づいて適切なサイズリストを選択
  const sizes = gender === "KIDS" ? kidsSizes : adultSizes;

  // サイズの在庫状況を取得
  const getInventory = (size: Size): number => {
    if (!hasSizes) return 999; // サイズ管理していない場合は在庫ありとする
    const sizeData = itemSizes.find((item) => item.size === size);
    return sizeData ? sizeData.inventory : 0;
  };

  // サイズの表示名を取得（キッズサイズの場合は "KID_" プレフィックスを削除）
  const getSizeDisplayName = (size: Size): string => {
    return size.toString().startsWith("KID_")
      ? size.toString().replace("KID_", "")
      : size.toString();
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
          displayName={getSizeDisplayName(size)}
          isSelected={selectedSize === size}
          inventory={getInventory(size)}
          onSelect={() => onSizeSelect(size)}
        />
      ))}
    </div>
  );
};

export default SizeSelector;
