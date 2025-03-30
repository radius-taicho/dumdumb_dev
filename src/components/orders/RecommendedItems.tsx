import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Item } from "@prisma/client";

interface RecommendedItemsProps {
  items: Item[];
  title: string;
}

/**
 * おすすめアイテムセクションを表示するコンポーネント
 */
const RecommendedItems: React.FC<RecommendedItemsProps> = ({
  items,
  title,
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map((item) => {
          const imageUrl = item.images?.split(",")[0] || "";

          return (
            <div key={item.id} className="border p-2">
              <Link href={`/items/${item.id}`}>
                <div className="aspect-square bg-gray-100 mb-3 flex items-center justify-center">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">アイテム画像</p>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-sm mb-1">{item.name}</h3>
                  <p className="text-sm">
                    ¥{Number(item.price).toLocaleString()}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedItems;
