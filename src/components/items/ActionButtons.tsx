import React from 'react';
import { FiShoppingCart } from "react-icons/fi";
import { Size } from '@prisma/client';

type ActionButtonsProps = {
  onAddToCart: () => void;
  onBuyNow: () => void;
  isOutOfStock: boolean;
  hasSizes: boolean;
  selectedSize: Size | null;
  isLoading?: boolean;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onAddToCart, 
  onBuyNow, 
  isOutOfStock, 
  hasSizes, 
  selectedSize,
  isLoading = false
}) => {
  // サイズ選択が必要なアイテムの場合、サイズが選択されていないと無効
  const isSizeRequired = hasSizes && !selectedSize;
  const isDisabled = isOutOfStock || isSizeRequired || isLoading;

  return (
    <div className="relative flex gap-4 w-full">
      <button
        className={`flex-1 py-3 text-2xl text-center rounded-3xl min-h-14 ${
          isDisabled
            ? "bg-gray-300 cursor-not-allowed text-gray-500"
            : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
        onClick={onBuyNow}
        disabled={isDisabled}
      >
        {isLoading ? "処理中..." : "今すぐ買う"}
      </button>
      <button
        className={`relative px-4 py-3 rounded-3xl border min-h-14 w-[72px] flex items-center justify-center ${
          isDisabled
            ? "bg-gray-100 cursor-not-allowed border-gray-300"
            : "bg-white border-black hover:bg-gray-100"
        }`}
        onClick={onAddToCart}
        disabled={isDisabled}
      >
        <FiShoppingCart
          className={`w-6 h-6 ${isDisabled ? "text-gray-400" : "text-black"}`}
        />
      </button>
    </div>
  );
};

export default ActionButtons;