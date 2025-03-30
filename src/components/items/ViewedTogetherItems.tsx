import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiUsers } from "react-icons/fi";

type ViewedTogetherItemsProps = {
  itemId: string;
};

const ViewedTogetherItems: React.FC<ViewedTogetherItemsProps> = ({ itemId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViewedTogetherItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/items/viewed-together?itemId=${itemId}`);
        
        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch items viewed together:", error);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchViewedTogetherItems();
    }
  }, [itemId]);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8 mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <FiUsers className="mr-2" />
          このアイテムを見た人はこれも見ています
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded p-2">
              <div className="aspect-square bg-gray-200 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 mb-2 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 w-1/2 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null; // 関連アイテムがない場合は何も表示しない
  }

  return (
    <section className="container mx-auto px-4 py-8 mb-16">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <FiUsers className="mr-2" />
        このアイテムを見た人はこれも見ています
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {items.map((item: any) => (
          <Link href={`/items/${item.id}`} key={item.id}>
            <div className="border border-gray-200 rounded p-2 hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                {item.images && (
                  <img
                    src={item.images.split(",")[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-sm font-bold">
                ¥{Math.floor(Number(item.price)).toLocaleString()}
              </p>
              {/* キャラクター情報表示 */}
              {item.characters && item.characters.length > 0 && (
                <p className="text-xs text-gray-500 truncate">
                  {item.characters[0].name}
                  {item.characters.length > 1 ? ` 他${item.characters.length - 1}名` : ''}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ViewedTogetherItems;
