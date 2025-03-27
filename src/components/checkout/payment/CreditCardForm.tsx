import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

type CreditCardFormProps = {
  onComplete: (paymentMethodData: any) => void;
  onCancel: () => void;
  isDefault: boolean;
  setIsDefault: (value: boolean) => void;
};

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  onComplete,
  onCancel,
  isDefault,
  setIsDefault
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardHolderName, setCardHolderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripeの読み込みに失敗しました。ページを再読み込みしてください。');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('カード情報の入力欄が見つかりません。');
      return;
    }

    if (!cardHolderName.trim()) {
      setError('カード名義人を入力してください。');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // カード情報からPaymentMethodを作成
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardHolderName,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error('支払い方法の作成に失敗しました。');
      }

      // カード情報の一部を取得（最後の4桁など）
      const card = paymentMethod.card;
      
      // 親コンポーネントに必要な情報を渡す
      onComplete({
        type: 'CREDIT_CARD',
        cardNumber: `**** **** **** ${card?.last4}`,
        cardHolderName,
        expiryMonth: card?.exp_month.toString().padStart(2, '0'),
        expiryYear: card?.exp_year.toString().slice(-2),
        brand: card?.brand,
        isDefault,
        stripePaymentMethodId: paymentMethod.id,
      });
      
      toast.success('クレジットカード情報が正常に登録されました');
    } catch (err) {
      console.error('カード登録エラー:', err);
      setError(err instanceof Error ? err.message : '支払い情報の処理中にエラーが発生しました');
      toast.error('クレジットカードの登録に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          カード名義人 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={cardHolderName}
          onChange={(e) => setCardHolderName(e.target.value)}
          placeholder="TARO YAMADA"
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          カード情報 <span className="text-red-500">*</span>
        </label>
        <div className="p-2 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="default-card"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="default-card" className="ml-2 block text-sm text-gray-700">
          デフォルトの支払い方法として設定する
        </label>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <div className="flex justify-end space-x-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
          disabled={isProcessing}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md hover:bg-orange-600 focus:outline-none"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              処理中...
            </span>
          ) : '保存する'}
        </button>
      </div>
    </form>
  );
};

export default CreditCardForm;
