import React from "react";

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
  onDelete: (id: string) => void;
  isProcessing: boolean;
};

const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  paymentMethods,
  selectedPaymentMethodId,
  onPaymentMethodSelect,
  onAddNew,
  onDelete,
  isProcessing,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          お支払い方法 <span className="text-red-500">*</span>
        </h2>
        <button
          className="text-orange-500 hover:text-orange-600"
          onClick={onAddNew}
          disabled={isProcessing}
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
              <div className="flex items-start justify-between w-full">
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
                          有効期限: {paymentMethod.expiryMonth}/
                          {paymentMethod.expiryYear}
                        </p>
                      </>
                    ) : paymentMethod.type === "AmazonPay" ? (
                      <p className="font-medium">Amazon Pay</p>
                    ) : paymentMethod.type === "OTHER" ? (
                      <>
                        <p className="font-medium">その他の支払い方法</p>
                        <p className="text-sm text-gray-700">
                          アイテム到着後にお支払い
                        </p>
                      </>
                    ) : (
                      <p className="font-medium">不明な支払い方法</p>
                    )}

                    {paymentMethod.isDefault && (
                      <span className="inline-block mt-1 text-xs bg-gray-200 rounded px-2 py-1">
                        デフォルト
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "この支払い方法を削除してもよろしいですか？"
                        )
                      ) {
                        onDelete(paymentMethod.id);
                      }
                    }}
                    disabled={isProcessing}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-4 text-gray-700 border-red-300 bg-red-50">
          <p>お支払い方法を追加してください（必須）</p>
          <button
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
            onClick={onAddNew}
            disabled={isProcessing}
          >
            支払い方法を追加
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSection;
