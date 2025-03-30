import React from 'react';
import Link from 'next/link';
import { FiEye } from 'react-icons/fi';
import { ViewHistoryDetails } from './ViewHistoryDetails';
import { formatViewDate, getImageUrl } from '@/utils/date-format';
import { ViewItem, ViewHistoryDetail } from '@/types/view-history';

interface ViewedItemCardProps {
  item: ViewItem;
  viewHistory?: ViewHistoryDetail;
  showViewHistory: string | null;
  toggleViewHistory: (itemId: string) => void;
  showViewCount?: boolean;
}

export const ViewedItemCard: React.FC<ViewedItemCardProps> = ({
  item,
  viewHistory,
  showViewHistory,
  toggleViewHistory,
  showViewCount = false,
}) => {
  return (
    <div className="flex flex-col border hover:border-gray-400 transition-colors">
      <Link
        href={`/items/${item.id}`}
        className="block"
      >
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
          
          {/* 閲覧回数バッジ（よく見ているアイテム用） */}
          {showViewCount && item.viewCount && (
            <div className="absolute top-0 right-0 bg-black text-white text-xs py-1 px-2 rounded-bl-md">
              {item.viewCount}回閲覧
            </div>
          )}
          
          {/* 最終閲覧日時 */}
          {item.viewedAt && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
              {showViewCount && item.latestView 
                ? `最終閲覧: ${formatViewDate(item.latestView)}`
                : formatViewDate(item.viewedAt)
              }
            </div>
          )}
        </div>
        <div className="p-2 flex-grow">
          <h3 className="text-sm line-clamp-2 mb-1">{item.name}</h3>
          <p className="text-sm font-bold">¥{item.price.toLocaleString()}</p>
        </div>
      </Link>
      
      {/* 閲覧履歴詳細 */}
      {viewHistory && (
        <ViewHistoryDetails
          itemId={item.id}
          viewHistory={viewHistory}
          isOpen={showViewHistory === item.id}
          toggleHistory={toggleViewHistory}
          buttonText={
            showViewCount 
              ? '閲覧履歴を見る' 
              : `${viewHistory.count}回閲覧`
          }
        />
      )}
    </div>
  );
};
