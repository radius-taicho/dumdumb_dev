import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-hot-toast";

type Item = {
  id: string;
  name: string;
  price: number;
  images: string;
  gender?: "MEN" | "WOMEN" | "KIDS" | null;
};

type SeriesItemsGridProps = {
  seriesId: string;
  items: Item[];
};

type Gender = "ALL" | "MEN" | "WOMEN" | "KIDS";

const SeriesItemsGrid: React.FC<SeriesItemsGridProps> = ({ seriesId, items }) => {
  const { data: session, status } = useSession();
  const [selectedGender, setSelectedGender] = useState<Gender>("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "priceHigh" | "priceLow">("newest");
  const [filteredItems, setFilteredItems] = useState<Item[]>(items);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loadingFavorites, setLoadingFavorites] = useState<Record<string, boolean>>({});

  // 性別フィルタリング
  useEffect(() => {
    let result = [...items];

    // 性別でフィルタリング
    if (selectedGender !== "ALL") {
      result = result.filter((item) => item.gender === selectedGender);
    }

    // 並び替え
    switch (sortOrder) {
      case "newest":
        // 新着順（IDの逆順で簡易的に対応）
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "priceHigh":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "priceLow":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
    }

    setFilteredItems(result);
  }, [items, selectedGender, sortOrder]);

  // お気に入り状態の取得
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const fetchFavoritesStatus = async () => {
        try {
          const initialFavorites: Record<string, boolean> = {};
          
          for (const item of items) {
            const response = await fetch(`/api/favorites/check?itemId=${item.id}`);
            if (response.ok) {
              const data = await response.json();
              initialFavorites[item.id] = data.isFavorite;
            }
          }
          
          setFavorites(initialFavorites);
        } catch (error) {
          console.error('Error fetching favorites status:', error);
        }
      };
      
      fetchFavoritesStatus();
    }
  }, [status, session, items]);

  // お気に入りトグル
  const handleFavoriteClick = async (itemId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (status !== 'authenticated' || !session?.user) {
      toast.error('お気に入り機能を使用するにはログインが必要です');
      return;
    }
    
    if (loadingFavorites[itemId]) return;
    
    setLoadingFavorites(prev => ({ ...prev, [itemId]: true }));
    
    try {
      if (favorites[itemId]) {
        const response = await fetch('/api/favorites/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId }),
        });
        
        if (response.ok) {
          setFavorites(prev => ({ ...prev, [itemId]: false }));
          toast.success('お気に入りから削除しました');
        } else {
          toast.error('お気に入りの削除に失敗しました');
        }
      } else {
        const response = await fetch('/api/favorites/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId }),
        });
        
        if (response.ok) {
          setFavorites(prev => ({ ...prev, [itemId]: true }));
          toast.success('お気に入りに追加しました');
        } else {
          toast.error('お気に入りの追加に失敗しました');
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      toast.error('お気に入りの操作中にエラーが発生しました');
    } finally {
      setLoadingFavorites(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // 画像URL処理（カンマ区切りの場合は最初の画像を使用）
  const getImageUrl = (images: string) => {
    if (!images) return "/images/placeholder.jpg";
    const imageArray = images.split(",");
    return imageArray[0].trim();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-8">
        シリーズアイテム
      </h2>

      {/* タブナビゲーション */}
      <div className="border-b mb-6">
        <div className="flex justify-center">
          <button
            className={`px-6 py-2 ${
              selectedGender === "ALL" ? "font-bold border-b-2 border-black" : ""
            }`}
            onClick={() => setSelectedGender("ALL")}
          >
            ALL
          </button>
          <button
            className={`px-6 py-2 ${
              selectedGender === "MEN" ? "font-bold border-b-2 border-black" : ""
            }`}
            onClick={() => setSelectedGender("MEN")}
          >
            MEN
          </button>
          <button
            className={`px-6 py-2 ${
              selectedGender === "WOMEN" ? "font-bold border-b-2 border-black" : ""
            }`}
            onClick={() => setSelectedGender("WOMEN")}
          >
            WOMEN
          </button>
          <button
            className={`px-6 py-2 ${
              selectedGender === "KIDS" ? "font-bold border-b-2 border-black" : ""
            }`}
            onClick={() => setSelectedGender("KIDS")}
          >
            KIDS
          </button>
        </div>
      </div>

      {/* ソートとフィルター */}
      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 ${
              sortOrder === "newest"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            } text-sm rounded-full`}
            onClick={() => setSortOrder("newest")}
          >
            新着順
          </button>
          <button
            className={`px-3 py-1 ${
              sortOrder === "priceHigh"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            } text-sm rounded-full`}
            onClick={() => setSortOrder("priceHigh")}
          >
            価格高い順
          </button>
          <button
            className={`px-3 py-1 ${
              sortOrder === "priceLow"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            } text-sm rounded-full`}
            onClick={() => setSortOrder("priceLow")}
          >
            価格安い順
          </button>
        </div>
      </div>

      {/* アイテムグリッド */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              <Link href={`/items/${item.id}`}>
                <div className="h-[320px] bg-gray-100 mb-2 relative overflow-hidden">
                  {/* アイテム画像 */}
                  <img
                    src={getImageUrl(item.images)}
                    alt={item.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder.jpg";
                    }}
                  />
                  <button
                    onClick={(e) => handleFavoriteClick(item.id, e)}
                    className="absolute top-2 right-2 text-white p-2 bg-white bg-opacity-80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {loadingFavorites[item.id] ? (
                      <span className="block w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></span>
                    ) : favorites[item.id] ? (
                      <FaHeart size={20} className="text-red-500" />
                    ) : (
                      <FiHeart size={20} className="text-gray-800" />
                    )}
                  </button>
                </div>
                <h3 className="text-base">{item.name}</h3>
                <p className="text-base font-medium">
                  ¥{Number(item.price).toLocaleString()}
                </p>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-16 text-center">
            <p className="text-gray-500 mb-4">該当するアイテムがありません</p>
          </div>
        )}
      </div>

      {/* スクロールボタン */}
      <div className="fixed bottom-20 right-8">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SeriesItemsGrid;
