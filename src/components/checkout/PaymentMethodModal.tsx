import React, { useState } from "react";
import StripeProvider from "./payment/StripeProvider";
import CreditCardForm from "./payment/CreditCardForm";

type PaymentMethodModalProps = {
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
  isProcessing: boolean;
};

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  onClose,
  onSubmit,
  isProcessing,
}) => {
  const [isDefault, setIsDefault] = useState(false);
  const [paymentType, setPaymentType] = useState<"CREDIT_CARD" | "OTHER">(
    "CREDIT_CARD"
  );
  const [isLoading, setIsLoading] = useState(false);

  // クレジットカード完了時のハンドラー
  const handleCreditCardComplete = (paymentMethodData: any) => {
    // タイプを確実に大文字にして部品一貫性を維持
    const normalizedData = {
      ...paymentMethodData,
      type: 'CREDIT_CARD'
    };
    onSubmit(normalizedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">お支払い方法の追加</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-md ${
                paymentType === "CREDIT_CARD"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setPaymentType("CREDIT_CARD")}
            >
              クレジットカード
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md ${
                paymentType === "OTHER"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setPaymentType("OTHER")}
            >
              その他のお支払い方法
            </button>
          </div>

          {paymentType === "CREDIT_CARD" && (
            <StripeProvider>
              <CreditCardForm
                onComplete={handleCreditCardComplete}
                onCancel={onClose}
                isDefault={isDefault}
                setIsDefault={setIsDefault}
              />
            </StripeProvider>
          )}

          {paymentType === "OTHER" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                お支払いはアイテム到着後にご対応いただきます。
              </p>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="default-other"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="default-other"
                  className="ml-2 block text-sm text-gray-700"
                >
                  デフォルトの支払い方法として設定する
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSubmit({
                      type: 'OTHER', // 大文字で統一
                      isDefault,
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md hover:bg-orange-600 focus:outline-none"
                >
                  保存する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
