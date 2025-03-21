import React from 'react';
import { Size } from '@prisma/client';

type CartItemType = {
  id: string;
  itemId: string;
  quantity: number;
  size: Size | null;
  item: {
    id: string;
    name: string;
    price: number;
    images: string;
    hasSizes: boolean;
    inventory: number;
    character: {
      id: string;
      name: string;
    } | null;
  };
};

type CartItemsSectionProps = {
  cartItems: CartItemType[];
};

const CartItemsSection: React.FC<CartItemsSectionProps> = ({ cartItems }) => {
  // 画像を取得する関数
  const getFirstImage = (imagesString: string): string => {
    if (!imagesString) return '';
    const images = imagesString.split(',').map(img => img.trim());
    return images.length > 0 ? images[0] : '';
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">
        お届けアイテム ({cartItems.length}点)
      </h2>
      <div className="border rounded-lg p-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-start mb-4 last:mb-0">
            {/* アイテム画像 */}
            <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4">
              {item.item.images ? (
                <img 
                  src={getFirstImage(item.item.images)} 
                  alt={item.item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center">
                    <div className="flex">
                      <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* アイテム情報 */}
            <div className="flex-grow">
              <h3 className="font-medium">{item.item.name}</h3>
              {item.size && (
                <p className="text-sm text-gray-600">{item.size}</p>
              )}
              <p className="font-medium mt-2">
                ¥{Number(item.item.price).toLocaleString()}
              </p>
              {item.item.character && (
                <p className="text-sm text-gray-600">
                  {item.item.character.name}
                </p>
              )}
            </div>

            {/* 数量 */}
            <div className="text-right">
              <p className="text-gray-600">×{item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartItemsSection;
