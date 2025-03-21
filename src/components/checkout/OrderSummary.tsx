import React from 'react';
import Link from 'next/link';

type OrderSummaryProps = {
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  isOrderButtonEnabled: boolean;
  isProcessing: boolean;
  onPlaceOrder: () => void;
};

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  shippingFee,
  tax,
  total,
  isOrderButtonEnabled,
  isProcessing,
  onPlaceOrder
}) => {
  return (
    <div className="border rounded-lg p-6 sticky top-6">
      <h2 className="text-xl font-semibold mb-4">注文内容</h2>

      <div className="space-y-3 border-b pb-4 mb-4">
        <div className="flex justify-between">
          <span>アイテム小計</span>
          <span className="font-medium">
            ¥{subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>送料</span>
          <span className="font-medium">
            ¥{shippingFee.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>内消費税</span>
          <span className="font-medium">¥{tax.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-between font-semibold mb-8">
        <span>合計</span>
        <span className="text-xl">¥{total.toLocaleString()}</span>
      </div>
      
      <button
        onClick={onPlaceOrder}
        disabled={!isOrderButtonEnabled || isProcessing}
        className={`w-full py-3 px-4 rounded-full focus:outline-none transition-colors font-medium mb-4 text-center
          ${isOrderButtonEnabled 
            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isProcessing ? '処理中...' : '注文を確定する'}
      </button>

      <Link
        href="/cartAndFavorites"
        className="block text-center text-gray-700 hover:text-gray-900"
      >
        カートに戻る
      </Link>
    </div>
  );
};

export default OrderSummary;
