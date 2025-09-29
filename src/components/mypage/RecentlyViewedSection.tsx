import React from "react";
import Link from "next/link";
import { FiClock } from "react-icons/fi";
import { ViewedItemCard } from "./ViewedItemCard";
import { ViewItem, ViewHistoryDetailsMap } from "@/types/view-history";

interface RecentlyViewedSectionProps {
  items: ViewItem[];
  viewHistoryDetails: ViewHistoryDetailsMap;
  showViewHistory: string | null;
  toggleViewHistory: (itemId: string) => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  items,
  viewHistoryDetails,
  showViewHistory,
  toggleViewHistory,
}) => {
  return (
    <div className="mt-20">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FiClock className="mr-2" />
        最近見たアイテム
      </h2>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <ViewedItemCard
              key={item.id}
              item={item}
              viewHistory={viewHistoryDetails[item.id]}
              showViewHistory={showViewHistory}
              toggleViewHistory={toggleViewHistory}
              showViewCount={false}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded">
          <p className="text-gray-500">最近見たアイテムはまだないよ...</p>
          <Link
            href="/"
            className="mt-2 inline-block text-blue-500 hover:underline"
          >
            アイテムを見る
          </Link>
        </div>
      )}
    </div>
  );
};
