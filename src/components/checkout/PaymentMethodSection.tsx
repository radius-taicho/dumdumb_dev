import React from 'react';

type PaymentMethodType = {
  id: string;
  type: string;
  cardNumber?: string | null;
  cardHolderName?: string | null;
  expiryMonth?: string | null;
  expiryYear?: string | null;
  amazonPayId?: string | null;
  isDefault: boolean;
};

type PaymentMethodSectionProps = {
  paymentMethods: PaymentMethodType[];
  selectedPaymentMethodId: string;
  onPaymentMethodSelect: (id: string) => void;
  onAddNew: () => void;
};

const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  paymentMethods,
  selectedPaymentMethodId,
  onPaymentMethodSelect,
  onAddNew
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">お支払い方法</h2>
        <button 
          className="text-orange-500 hover:text-orange-600"
          onClick={onAddNew}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
      
      {paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map((paymentMethod) => (
            <div 
              key={paymentMethod.id} 
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedPaymentMethodId === paymentMethod.id 
                  ? "border-orange-500 bg-orange-50" 
                  : "hover:border-gray-400"
              }`}
              onClick={() => onPaymentMethodSelect(paymentMethod.id)}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <input 
                    type="radio" 
                    checked={selectedPaymentMethodId === paymentMethod.id}
                    onChange={() => onPaymentMethodSelect(paymentMethod.id)}
                    className="accent-orange-500"
                  />
                </div>
                <div>
                  {paymentMethod.type === "CREDIT_CARD" ? (
                    <>
                      <p className="font-medium">クレジットカード</p>
                      <p className="text-sm text-gray-700">
                        {paymentMethod.cardNumber}
                      </p>
                      <p className="text-sm text-gray-700">
                        有効期限: {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                      </p>
                    </>
                  ) : paymentMethod.type === "AMAZON_PAY" ? (
                    <p className="font-medium">Amazon Pay</p>
                  ) : (
                    <p className="font-medium">その他の支払い方法</p>
                  )}
                  
                  {paymentMethod.isDefault && (
                    <span className="inline-block mt-1 text-xs bg-gray-200 rounded px-2 py-1">
                      デフォルト
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-4 text-gray-700">
          <p>お支払い方法を追加してください</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSection;
