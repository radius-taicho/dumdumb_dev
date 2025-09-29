import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Item, OrderItem } from "@prisma/client";

type OrderItemWithProduct = OrderItem & {
  item: Item;
};

interface OrderItemsProps {
  items: OrderItemWithProduct[];
  orderDate: string;
  deliveryDate: string;
  translations: {
    purchasedItems: string;
    orderDate: string;
    deliveryDate: string;
    sizeLabel: string;
  };
}

/**
 * 注文に含まれるアイテムリストを表示するコンポーネント
 */
const OrderItems: React.FC<OrderItemsProps> = ({
  items,
  orderDate,
  deliveryDate,
  translations,
}) => {
  return (
    <div className="border rounded-lg p-6 mb-12">
      <h2 className="font-semibold mb-4">{translations.purchasedItems}</h2>

      <div className="space-y-6">
        {items.map((orderItem) => {
          const imageUrl = orderItem.item.images?.split(",")[0] || "";

          return (
            <div
              key={orderItem.id}
              className="flex flex-col md:flex-row gap-6 border-b pb-6"
            >
              {/* アイテム画像 */}
              <div className="w-28 h-28 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={orderItem.item.name}
                    width={112}
                    height={112}
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-700 rounded-full flex flex-col items-center justify-center">
                    <div className="flex mb-1">
                      <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div className="w-6 h-1 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              {/* アイテム情報 */}
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <h3 className="font-medium hover:underline">
                    <Link href={`/items/${orderItem.item.id}`}>
                      {orderItem.item.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600">
                    {orderItem.size || translations.sizeLabel}
                  </p>
                  <p className="font-medium mt-2">
                    ¥{Number(orderItem.price).toLocaleString()}
                  </p>
                </div>

                <div className="md:text-right">
                  <div className="mb-4">
                    <p className="text-sm">
                      <span className="text-gray-600 mr-2">
                        {translations.orderDate}
                      </span>
                      <span>{orderDate}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600 mr-2">
                        {translations.deliveryDate}
                      </span>
                      <span>{deliveryDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-end">
                    <p>
                      <span className="text-gray-600 mr-1">×</span>
                      <span>{orderItem.quantity}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderItems;
