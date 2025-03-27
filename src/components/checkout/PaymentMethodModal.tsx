import React, { useState } from 'react';
import StripeProvider from './payment/StripeProvider';
import CreditCardForm from './payment/CreditCardForm';

type PaymentMethodModalProps = {
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
  isProcessing: boolean;
};

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  onClose,
  onSubmit,
  isProcessing
}) => {
  const [isDefault, setIsDefault] = useState(false);
  const [paymentType, setPaymentType] = useState<'CREDIT_CARD' | 'OTHER'>('CREDIT_CARD');

  // クレジットカード完了時のハンドラー
  const handleCreditCardComplete = (paymentMethodData: any) => {
    onSubmit(paymentMethodData);
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
                paymentType === 'CREDIT_CARD'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setPaymentType('CREDIT_CARD')}
            >
              クレジットカード
            </button>
            {/* 将来的に他の支払い方法を追加できる余地を残しておく */}
          </div>

          {paymentType === 'CREDIT_CARD' && (
            <StripeProvider>
              <CreditCardForm
                onComplete={handleCreditCardComplete}
                onCancel={onClose}
                isDefault={isDefault}
                setIsDefault={setIsDefault}
              />
            </StripeProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
