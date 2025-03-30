import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CartItemType,
  FavoriteItemType,
  RecommendedItemType,
} from "@/types/cart";

interface RecommendedItemsProps {
  cartItems: CartItemType[];
  favoriteItems: FavoriteItemType[];
}

export const RecommendedItems: React.FC<RecommendedItemsProps> = ({
  cartItems,
  favoriteItems,
}) => {
  const [recommendedItems, setRecommendedItems] = useState<
    RecommendedItemType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // カートとお気に入りの商品に基づいてレコメンド商品を取得
  useEffect(() => {
    const fetchRecommendedItems = async () => {
      setIsLoading(true);
      try {
        // カートとお気に入りのアイテムIDとキャラクターIDを収集
        const itemIds = new Set<string>();
        const characterIds = new Set<string>();

        // カートアイテムから情報を収集
        cartItems.forEach((cartItem) => {
          itemIds.add(cartItem.itemId);
          cartItem.item.characters?.forEach((character) => {
            characterIds.add(character.id);
          });
        });

        // お気に入りアイテムから情報を収集
        favoriteItems.forEach((favorite) => {
          itemIds.add(favorite.itemId);
          favorite.item.characters?.forEach((character) => {
            characterIds.add(character.id);
          });
        });

        // APIを呼び出してレコメンド商品を取得
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemIds: Array.from(itemIds),
            characterIds: Array.from(characterIds),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setRecommendedItems(data.recommendedItems);
        } else {
          // APIが失敗した場合はダミーデータを使用（実際の実装ではエラーハンドリングを行う）
          setRecommendedItems(getDummyRecommendations());
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendedItems(getDummyRecommendations());
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedItems();
  }, [cartItems, favoriteItems]);

  // ダミーのレコメンデーション（APIが失敗した場合にフォールバック）
  const getDummyRecommendations = (): RecommendedItemType[] => {
    return [
      {
        id: "7",
        name: "アイテム名",
        price: 4800,
        images: "https://placehold.co/400x400/orange/white?text=Item+1",
      },
      {
        id: "8",
        name: "アイテム名",
        price: 4800,
        images: "https://placehold.co/400x400/orange/white?text=Item+2",
      },
      {
        id: "9",
        name: "アイテム名",
        price: 4800,
        images: "https://placehold.co/400x400/orange/white?text=Item+3",
      },
      {
        id: "10",
        name: "アイテム名",
        price: 4800,
        images: "https://placehold.co/400x400/orange/white?text=Item+4",
      },
      {
        id: "11",
        name: "アイテム名",
        price: 4800,
        images: "https://placehold.co/400x400/orange/white?text=Item+5",
      },
    ];
  };

  // レコメンデーションのタイトルを作成（カート・お気に入りの内容に基づいてカスタマイズ）
  const getRecommendationTitle = (): string => {
    const hasCartItems = cartItems.length > 0;
    const hasFavorites = favoriteItems.length > 0;

    if (hasCartItems && hasFavorites) {
      return "dumdumbからのおすすめ";
    } else if (hasCartItems) {
      return "dumdumbからのおすすめ";
    } else if (hasFavorites) {
      return "dumdumbからのおすすめ";
    } else {
      return "dumdumbからのおすすめ";
    }
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">{getRecommendationTitle()}</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="border animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-2">
                  <div className="h-4 bg-gray-200 mb-1 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {recommendedItems.map((item) => (
            <Link
              href={`/items/${item.id}`}
              key={item.id}
              className="border hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {item.images ? (
                  <img
                    src={item.images}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="flex items-center justify-center h-full text-sm text-gray-500">
                    アイテム画像
                  </p>
                )}
              </div>
              <div className="p-2">
                <h3 className="text-sm mb-1">{item.name}</h3>
                <p className="text-sm">¥{item.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
