import React, { useState } from 'react';

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
  const [paymentForm, setPaymentForm] = useState({
    type: "CREDIT_CARD",
    cardNumber: "",
    cardHolderName: "",
    expiryMonth: "",
    expiryYear: "",
    securityCode: "",
    isDefault: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setPaymentForm({
      ...paymentForm,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 実際のアプリではここでクレジットカード情報のバリデーションを行い、
    // セキュリティのために決済代行サービスに送信してトークン化するべき
    
    // セキュリティコードは送信しない（保存しない）
    const { securityCode, ...submissionData } = paymentForm;
    
    onSubmit(submissionData);
  };

  // 現在の年から10年分の選択肢を生成
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">お支払い方法の追加</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                カード番号
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={paymentForm.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
                カード名義人
              </label>
              <input
                type="text"
                id="cardHolderName"
                name="cardHolderName"
                value={paymentForm.cardHolderName}
                onChange={handleChange}
                placeholder="TARO YAMADA"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  有効期限
                </label>
                <div className="flex space-x-2">
                  <select
                    name="expiryMonth"
                    value={paymentForm.expiryMonth}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">月</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    name="expiryYear"
                    value={paymentForm.expiryYear}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">年</option>
                    {years.map(year => (
                      <option key={year} value={year.toString().slice(-2)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="securityCode" className="block text-sm font-medium text-gray-700 mb-1">
                  セキュリティコード
                </label>
                <input
                  type="password"
                  id="securityCode"
                  name="securityCode"
                  value={paymentForm.securityCode}
                  onChange={handleChange}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={paymentForm.isDefault}
                onChange={handleChange}
                className="mr-2 accent-orange-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                デフォルトの支払い方法として設定する
              </label>
            </div>
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
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-md"
            >
              {isProcessing ? '処理中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
