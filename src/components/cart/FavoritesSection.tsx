import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FavoriteItem } from "./FavoriteItem";
import { FavoriteItemType } from "@/types/cart";

interface FavoritesSectionProps {
  favoriteItems: FavoriteItemType[];
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favoriteItems: initialFavoriteItems,
}) => {
  const [favoriteItems, setFavoriteItems] =
    useState<FavoriteItemType[]>(initialFavoriteItems);

  // お気に入りから削除するハンドラ
  const handleRemoveFavorite = async (id: string) => {
    try {
      const response = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favoriteId: id,
        }),
      });

      if (response.ok) {
        // 成功したらお気に入りリストから削除
        setFavoriteItems(favoriteItems.filter((item) => item.id !== id));
        toast.success("お気に入りから削除しました");
      } else {
        toast.error("お気に入りから削除できませんでした");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("お気に入りの削除中にエラーが発生しました");
    }
  };

  return (
    <div id="favorites-section" className="mt-16 mb-12">
      <h2 className="text-2xl font-bold mb-6">お気に入りアイテム</h2>

      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {favoriteItems.map((item) => (
            <FavoriteItem
              key={item.id}
              item={item}
              onRemove={handleRemoveFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-gray-500 mb-4">
            お気に入りアイテムはまだないよ...
          </p>
          <Link
            href="/"
            className="text-orange-500 hover:text-orange-600 underline"
          >
            ショッピングを始める
          </Link>
        </div>
      )}
    </div>
  );
};
