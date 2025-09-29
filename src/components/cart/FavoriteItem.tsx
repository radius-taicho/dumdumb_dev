import React from 'react';
import Link from 'next/link';
import { FavoriteItemType } from '@/types/cart';
import { CharacterBadges } from '@/components/common/CharacterBadges';

interface FavoriteItemProps {
  item: FavoriteItemType;
  onRemove: (id: string) => void;
}

export const FavoriteItem: React.FC<FavoriteItemProps> = ({ item, onRemove }) => {
  // 画像を取得する関数
  const getItemImageUrl = (images: string): string => {
    if (!images) return "/images/placeholder.jpg";
    
    // カンマ区切りの最初の画像を取得
    const imageArray = images.split(",");
    const firstImage = imageArray[0].trim();
    return firstImage;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Link href={`/items/${item.item.id}`}>
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {/* 画像表示 */}
          {item.item.images ? (
            <img
              src={getItemImageUrl(item.item.images)}
              alt={item.item.name}
              className="w-full h-full object-cover"
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
          
          {/* お気に入り削除ボタン */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            aria-label="お気に入りから削除"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </Link>
      
      <div className="p-3">
        <Link href={`/items/${item.item.id}`}>
          <h3 className="font-medium mb-1 hover:text-orange-500">
            {item.item.name}
          </h3>
        </Link>
        <p className="text-gray-800 mb-1">
          ¥{Math.floor(Number(item.item.price)).toLocaleString()}
        </p>
        
        {/* キャラクターバッジ */}
        <CharacterBadges characters={item.item.characters} />
      </div>
    </div>
  );
};
