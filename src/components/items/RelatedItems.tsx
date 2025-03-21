import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiPackage } from "react-icons/fi";

type RelatedItemsProps = {
  characterId: string | null;
  currentItemId: string; // 現在表示している商品のIDを追加
};

const RelatedItems: React.FC<RelatedItemsProps> = ({
  characterId,
  currentItemId,
}) => {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (characterId) {
      const fetchRelatedItems = async () => {
        try {
          const response = await fetch(
            `/api/items/related?characterId=${characterId}`
          );
          if (response.ok) {
            const data = await response.json();
            // 現在表示している商品を除外
            const filteredItems = data.items.filter(
              (item: any) => item.id !== currentItemId
            );
            setRelatedItems(filteredItems);
          }
        } catch (error) {
          console.error("Failed to fetch related items:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRelatedItems();
    } else {
      setLoading(false);
    }
  }, [characterId, currentItemId]);

  if (!characterId || loading) return null;

  // 関連商品がない場合のメッセージ
  if (relatedItems.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8 mb-16">
        <h2 className="text-xl font-bold mb-6">
          このキャラクターの他のアイテム
        </h2>
        <div className="border border-gray-200 rounded-md p-6 flex flex-col items-center justify-center text-center bg-gray-50">
          <FiPackage className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600">
            このキャラクターの他のアイテムはまだないよ...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8 mb-16">
      <h2 className="text-xl font-bold mb-6">このキャラクターの他のアイテム</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {relatedItems.map((item: any) => (
          <Link href={`/items/${item.id}`} key={item.id}>
            <div className="border border-gray-200 rounded p-2 hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                {item.images && (
                  <img
                    src={item.images.split(",")[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-sm font-bold">
                ¥{Math.floor(Number(item.price)).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedItems;
