import React from "react";
import Link from "next/link";
import { AiOutlineHeart } from "react-icons/ai";
import { getImageUrl } from "@/utils/date-format";
import { ViewItem } from "@/types/view-history";

interface RecommendedItemsSectionProps {
  items: ViewItem[];
  loading: boolean;
}

export const RecommendedItemsSection: React.FC<
  RecommendedItemsSectionProps
> = ({ items, loading }) => {
  return (
    <div className="mt-20">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <AiOutlineHeart className="mr-2" />
        dumdumbからのおすすめ
      </h2>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <Link
              href={`/items/${item.id}`}
              key={item.id}
              className="block border hover:border-gray-400 transition-colors"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 bg-rose-500 text-white text-xs py-1 px-2 rounded-br-md">
                  おすすめ
                </div>
              </div>
              <div className="p-2">
                <h3 className="text-sm line-clamp-2 mb-1">{item.name}</h3>
                <p className="text-sm font-bold">
                  ¥{item.price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">おすすめアイテムを読み込み中...</p>
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded">
          <p className="text-gray-500">
            あなたにおすすめのアイテムはまだないよ...
          </p>
          <p className="text-sm text-gray-400 mt-1">
            より多くのアイテムを閲覧すると、おすすめが表示されます
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            アイテムを見る
          </Link>
        </div>
      )}
    </div>
  );
};
