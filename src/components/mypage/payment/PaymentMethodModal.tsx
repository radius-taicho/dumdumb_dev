import React, { useState } from "react";
import StripeProvider from "../../checkout/payment/StripeProvider";
import CreditCardForm from "../../checkout/payment/CreditCardForm";

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
  const [paymentType, setPaymentType] = useState<"CREDIT_CARD" | "AMAZON_PAY" | "OTHER">("CREDIT_CARD");
  const [isDefault, setIsDefault] = useState(false);

  // クレジットカード完了時のハンドラー
  const handleCreditCardComplete = (paymentMethodData: any) => {
    onSubmit(paymentMethodData);
  };

  // Amazon Pay連携ハンドラー
  const handleAmazonPaySubmit = () => {
    // Amazon Pay連携
    onSubmit({
      type: "AMAZON_PAY",
      isDefault,
      // Amazon Pay固有の情報はここに追加
    });
  };

  // 代金引換ハンドラー
  const handleOtherPaymentSubmit = () => {
    onSubmit({
      type: "OTHER",
      isDefault,
    });
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
          <div className="flex flex-wrap gap-2 mb-4">
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
                paymentType === "AMAZON_PAY"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setPaymentType("AMAZON_PAY")}
            >
              Amazon Pay
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
              代金引換
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

          {paymentType === "AMAZON_PAY" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700 mb-2">
                  Amazon Payを利用すると、Amazonアカウントに登録されている情報を使用して、簡単に支払いができます。
                </p>
                <div className="flex justify-center">
                  <div className="bg-[#FF9900] text-white py-2 px-4 rounded-md font-semibold inline-flex items-center">
                    <span className="mr-2">Amazon Payで支払う</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="default-amazon"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="mr-2 accent-orange-500"
                />
                <label htmlFor="default-amazon" className="text-sm text-gray-700">
                  デフォルトの支払い方法として設定する
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md mr-2"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleAmazonPaySubmit}
                  disabled={isProcessing}
                  className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-md"
                >
                  {isProcessing ? '処理中...' : '連携して保存'}
                </button>
              </div>
            </div>
          )}

          {paymentType === "OTHER" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                代金引換でのお支払いになります。商品到着時に配達員にお支払いください。
              </p>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="default-other"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="mr-2 accent-orange-500"
                />
                <label htmlFor="default-other" className="text-sm text-gray-700">
                  デフォルトの支払い方法として設定する
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md mr-2"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleOtherPaymentSubmit}
                  disabled={isProcessing}
                  className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-md"
                >
                  {isProcessing ? '処理中...' : '保存'}
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
