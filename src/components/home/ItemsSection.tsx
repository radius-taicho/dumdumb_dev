import React from "react";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

type Category = {
  id: string;
  name: string;
};

type Item = {
  id: string;
  name: string;
  price: number;
  images: string;
  categoryId: string;
  gender?: "MEN" | "WOMEN" | "KIDS" | null;
  createdAt?: string;
};

type Gender = "ALL" | "MEN" | "WOMEN" | "KIDS";

type ItemsSectionProps = {
  categories: Category[];
  selectedCategoryId: string | null;
  filteredItems: Item[];
  selectedGender: Gender;
  sortOrder: "newest" | "priceHigh" | "priceLow";
  handleGenderSelect: (gender: Gender) => void;
  handleSortChange: (order: "newest" | "priceHigh" | "priceLow") => void;
  favorites: Record<string, boolean>;
  loadingFavorites: Record<string, boolean>;
  handleFavoriteClick: (itemId: string, event: React.MouseEvent) => void;
};

const ItemsSection: React.FC<ItemsSectionProps> = ({
  categories,
  selectedCategoryId,
  filteredItems,
  selectedGender,
  sortOrder,
  handleGenderSelect,
  handleSortChange,
  favorites,
  loadingFavorites,
  handleFavoriteClick,
}) => {
  // 画像URL処理（カンマ区切りの場合は最初の画像を使用）
  const getImageUrl = (images: string) => {
    if (!images) return "/images/placeholder.jpg";
    const imageArray = images.split(",");
    return imageArray[0].trim();
  };

  return (
    <div className="container mx-auto px-4 mb-12">
      <h2 className="text-xl font-bold text-center mb-6">
        {selectedCategoryId
          ? categories.find((c) => c.id === selectedCategoryId)?.name
          : "すべてのアイテム"}
      </h2>

      {/* タブナビゲーション */}
      <div className="border-b mb-6">
        <div className="flex justify-center">
          <button
            className={`px-6 py-2 ${
              selectedGender === "ALL"
                ? "font-bold border-b-2 border-black"
                : "text-gray-500"
            }`}
            onClick={() => handleGenderSelect("ALL")}
          >
            ALL
          </button>
          <button
            className={`px-6 py-2 ${
              selectedGender === "MEN"
                ? "font-bold border-b-2 border-black"
                : "text-gray-500"
            }`}
            onClick={() => handleGenderSelect("MEN")}
          >
            MEN
          </button>
          <button
            className={`px-6 py-2 ${
              selectedGender === "WOMEN"
                ? "font-bold border-b-2 border-black"
                : "text-gray-500"
            }`}
            onClick={() => handleGenderSelect("WOMEN")}
          >
            WOMEN
          </button>
          <button
            className={`px-6 py-2 ${
              selectedGender === "KIDS"
                ? "font-bold border-b-2 border-black"
                : "text-gray-500"
            }`}
            onClick={() => handleGenderSelect("KIDS")}
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
            onClick={() => handleSortChange("newest")}
          >
            新着順
          </button>
          <button
            className={`px-3 py-1 ${
              sortOrder === "priceHigh"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            } text-sm rounded-full`}
            onClick={() => handleSortChange("priceHigh")}
          >
            価格高い順
          </button>
          <button
            className={`px-3 py-1 ${
              sortOrder === "priceLow"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            } text-sm rounded-full`}
            onClick={() => handleSortChange("priceLow")}
          >
            価格安い順
          </button>
        </div>
      </div>

      {/* アイテムグリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              <Link href={`/items/${item.id}`}>
                <div className="aspect-[4/5] bg-gray-100 mb-3 relative overflow-hidden rounded-lg">
                  {/* アイテム画像 */}
                  <img
                    src={getImageUrl(item.images)}
                    alt={item.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
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
                <h3 className="text-base font-medium line-clamp-1 mb-1">
                  {item.name}
                </h3>
                <p className="text-lg font-bold">
                  ¥{Number(item.price).toLocaleString()}
                </p>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-16 text-center">
            <p className="text-gray-500 mb-4">
              該当するアイテムがまだないよ...
            </p>
            <button
              onClick={() => {
                handleGenderSelect("ALL");
              }}
              className="text-primary-600 hover:underline"
            >
              すべてのアイテムを表示する
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsSection;
