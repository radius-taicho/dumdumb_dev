import React from 'react';

type QuantitySelectorProps = {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity: number;
};

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ 
  quantity, 
  onQuantityChange, 
  maxQuantity 
}) => {
  const decrementQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="inline-flex items-center">
      <button
        onClick={decrementQuantity}
        disabled={quantity <= 1}
        className={`px-3 py-2 border border-r-0 rounded-l-md ${
          quantity <= 1 ? "text-gray-300 border-gray-200" : "text-gray-600 border-gray-300"
        }`}
        aria-label="数量を減らす"
      >
        -
      </button>
      <div className="px-4 py-2 border-t border-b text-center min-w-[40px]">
        {quantity}
      </div>
      <button
        onClick={incrementQuantity}
        disabled={quantity >= maxQuantity}
        className={`px-3 py-2 border border-l-0 rounded-r-md ${
          quantity >= maxQuantity ? "text-gray-300 border-gray-200" : "text-gray-600 border-gray-300"
        }`}
        aria-label="数量を増やす"
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;