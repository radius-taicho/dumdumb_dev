import React from 'react';
import { Size } from '@prisma/client';
import RestockNotification from './RestockNotification';

type SizeOptionProps = {
  size: Size;
  displayName: string; // 表示用の名前を追加（100, 110など）
  isSelected: boolean;
  inventory: number;
  onSelect: () => void;
};

const SizeOption: React.FC<SizeOptionProps> = ({ 
  size, 
  displayName,
  isSelected, 
  inventory, 
  onSelect 
}) => {
  const isOutOfStock = inventory <= 0;

  return (
    <div className="relative">
      <button
        onClick={onSelect}
        className={`flex items-center justify-center w-[72px] h-[72px] rounded-full ${
          isSelected
            ? isOutOfStock 
              ? "bg-gray-200 text-gray-700 border-2 border-gray-400" 
              : "bg-orange-500 text-white"
            : isOutOfStock
            ? "bg-gray-200 text-gray-700"
            : "bg-zinc-300"
        } relative text-xl`}
        aria-label={`サイズ ${displayName} を選択`}
        aria-pressed={isSelected}
      >
        {displayName}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-30 text-white text-xs">
            SOLD OUT
          </div>
        )}
      </button>
      
      {/* 再入荷通知アイコン - 在庫がない場合のみ表示 */}
      {isOutOfStock && isSelected && (
        <RestockNotification isVisible={true} />
      )}
    </div>
  );
};

export default SizeOption;