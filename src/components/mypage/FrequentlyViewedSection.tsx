import React from "react";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { ViewedItemCard } from "./ViewedItemCard";
import { ViewItem, ViewHistoryDetailsMap } from "@/types/view-history";

interface FrequentlyViewedSectionProps {
  items: ViewItem[];
  viewHistoryDetails: ViewHistoryDetailsMap;
  showViewHistory: string | null;
  toggleViewHistory: (itemId: string) => void;
}

export const FrequentlyViewedSection: React.FC<
  FrequentlyViewedSectionProps
> = ({ items, viewHistoryDetails, showViewHistory, toggleViewHistory }) => {
  return (
    <div className="mt-20">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FiEye className="mr-2" />
        よく見ているアイテム
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
              showViewCount={true}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded">
          <p className="text-gray-500">よく見ているアイテムはまだないよ...</p>
        </div>
      )}
    </div>
  );
};
