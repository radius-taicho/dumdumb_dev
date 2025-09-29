import React from 'react';
import { Order, OrderItem, Item } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

type OrderWithItems = Order & {
  items: (OrderItem & {
    item: Item;
  })[];
};

interface OrderHistoryListProps {
  orders: OrderWithItems[];
  formatOrderDate: (date: string) => string;
  formatDeliveryDate: (date: string) => string;
  translations: {
    noOrdersMessage: string;
    backToItems: string;
    sizeLabel: string;
    otherItems: string;
    quantity: string;
    orderDate: string;
    deliveryDate: string;
    totalQuantity: string;
    viewDetails: string;
  };
}

const OrderHistoryList: React.FC<OrderHistoryListProps> = ({
  orders,
  formatOrderDate,
  formatDeliveryDate,
  translations
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-lg text-gray-600 mb-4">{translations.noOrdersMessage}</p>
        <Link href="/" className="text-orange-500 hover:text-orange-600 underline">
          {translations.backToItems}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-12">
      {orders.map((order) => {
        // 各注文の先頭のアイテムを表示
        const firstItem = order.items[0];
        const imageUrl = firstItem?.item?.images?.split(',')[0] || '';
        const orderDate = formatOrderDate(order.createdAt);
        const deliveryDate = formatDeliveryDate(order.createdAt);
        
        return (
          <div key={order.id} className="border rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* アイテム画像 */}
              <div className="w-28 h-28 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                {imageUrl ? (
                  <Image 
                    src={imageUrl} 
                    alt={firstItem.item.name} 
                    width={112} 
                    height={112} 
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                    <div className="w-4 h-1 bg-white rounded-full mr-1"></div>
                    <div className="w-4 h-1 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              {/* アイテム情報 */}
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <h3 className="font-medium">{firstItem.item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {firstItem.size || translations.sizeLabel}
                    {order.items.length > 1 && ` (${translations.otherItems}${order.items.length - 1}${translations.quantity})`}
                  </p>
                  <p className="font-medium mt-2">
                    ¥{Number(order.totalAmount).toLocaleString()}
                  </p>
                </div>

                <div className="md:text-right">
                  <div className="mb-4">
                    <p className="text-sm">
                      <span className="text-gray-600 mr-2">{translations.orderDate}</span>
                      <span>{orderDate}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600 mr-2">{translations.deliveryDate}</span>
                      <span>{deliveryDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end">
                    <p className="md:mr-6">
                      <span className="text-gray-600 mr-1">×</span>
                      <span>{translations.totalQuantity}{order.items.reduce((sum, item) => sum + item.quantity, 0)}{translations.quantity}</span>
                    </p>
                    <Link
                      href={`/mypage/orders/${order.id}`}
                      className="text-sm text-gray-600 hover:text-indigo-600 underline"
                    >
                      {translations.viewDetails}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistoryList;
