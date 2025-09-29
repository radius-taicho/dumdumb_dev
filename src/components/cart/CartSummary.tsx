import React from 'react';
import Link from 'next/link';

interface CartSummaryProps {
  totalItemCount: number;
  cartTotal: number;
  isScrolled: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  totalItemCount,
  cartTotal,
  isScrolled
}) => {
  return (
    <div className="md:w-64 md:flex-shrink-0">
      <div
        className={`border rounded-lg p-6 flex flex-col justify-between ${
          isScrolled ? "md:sticky md:top-20" : ""
        }`}
      >
        {/* テキストを右寄せに変更 */}
        <div className="mb-4">
          <p className="text-sm text-right">
            小計({totalItemCount}点のアイテム)
          </p>
          <p className="font-medium text-right">
            ¥{cartTotal.toLocaleString()}(税込)
          </p>
        </div>

        {/* ボタンを中央配置 */}
        <div className="text-center">
          <Link href="/checkout">
            <button className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full transition-colors">
              レジに進む
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
