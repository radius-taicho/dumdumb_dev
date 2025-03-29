import React from "react";

type Category = {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  itemCount: number;
  image?: string | null;
  mediaId?: string | null;
  media?: {
    url: string;
  } | null;
};

type CategorySectionProps = {
  categories: Category[];
  selectedCategoryId: string | null;
  handleCategorySelect: (id: string | null) => void;
};

const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selectedCategoryId,
  handleCategorySelect,
}) => {
  // カテゴリーの画像URLを取得
  const getCategoryImageUrl = (category: Category) => {
    if (category.media?.url) return category.media.url;
    if (category.image) return category.image;
    return null;
  };

  return (
    <div className="container mx-auto px-4 mb-12">
      <h2 className="text-xl font-bold mb-6">アイテムカテゴリー</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        <button
          onClick={() => handleCategorySelect(null)}
          className={`flex flex-col items-center ${
            selectedCategoryId === null
              ? "opacity-100"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <div
            className={`w-16 h-16 md:w-20 md:h-20 border-2 ${
              selectedCategoryId === null ? "border-black" : "border-gray-300"
            } rounded-full flex items-center justify-center mb-2 transition-colors`}
          >
            <span className="text-lg font-bold">All</span>
          </div>
          <span className="text-xs text-center">すべてのアイテム</span>
        </button>

        {categories.map((category) => {
          const categoryImageUrl = getCategoryImageUrl(category);
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`flex flex-col items-center ${
                selectedCategoryId === category.id
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <div
                className={`w-16 h-16 md:w-20 md:h-20 border-2 ${
                  selectedCategoryId === category.id
                    ? "border-black"
                    : "border-gray-300"
                } rounded-full flex items-center justify-center mb-2 transition-colors overflow-hidden`}
              >
                {categoryImageUrl ? (
                  <img 
                    src={categoryImageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold">
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-xs text-center">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySection;
