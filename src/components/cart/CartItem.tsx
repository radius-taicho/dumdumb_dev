import React from 'react';
import { toast } from 'react-hot-toast';
import { CartItemType } from '@/types/cart';
import { Size } from '@prisma/client';
import { CharacterBadges } from '@/components/common/CharacterBadges';

interface CartItemProps {
  item: CartItemType;
  quantity: number;
  onRemove: (id: string) => void;
  onQuantityDecrease: (id: string) => void;
  onQuantityIncrease: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  quantity,
  onRemove,
  onQuantityDecrease,
  onQuantityIncrease
}) => {
  // 画像を取得する関数
  const getItemImageUrl = (images: string): string => {
    if (!images) return "/images/placeholder.jpg";
    
    // カンマ区切りの最初の画像を取得
    const imageArray = images.split(",");
    const firstImage = imageArray[0].trim();
    return firstImage;
  };

  // サイズを表示用にフォーマット
  const formatSize = (size: Size | null, hasSizes: boolean): string => {
    if (!hasSizes) return "";
    if (!size) return "サイズなし";
    return size;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 border-b pb-6 last:border-0 last:pb-0">
      {/* アイテム画像 */}
      <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        {item.item.images ? (
          <img
            src={getItemImageUrl(item.item.images)}
            alt={item.item.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
              <div className="flex">
                <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* アイテム詳細と数量調整 */}
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{item.item.name}</h3>
          {/* 削除ボタン */}
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => onRemove(item.id)}
            aria-label="カートから削除"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {item.item.hasSizes && (
          <p className="text-sm text-gray-600">
            {formatSize(item.size, item.item.hasSizes)}
          </p>
        )}
        <p className="font-medium mt-2">
          ¥{Math.floor(Number(item.item.price)).toLocaleString()}
        </p>
        
        {/* キャラクターバッジ */}
        <CharacterBadges characters={item.item.characters} />

        {/* 数量調整 - アイテム情報の下に配置 */}
        <div className="flex items-center border rounded-full overflow-hidden w-fit mt-2">
          <button
            onClick={() => onQuantityDecrease(item.id)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
            aria-label="数量を減らす"
          >
            -
          </button>
          <span className="px-4 py-1">
            {quantity || 1}
          </span>
          <button
            onClick={() => onQuantityIncrease(item.id)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
            aria-label="数量を増やす"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
