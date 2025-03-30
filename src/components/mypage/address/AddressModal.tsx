import React, { useState, useEffect } from 'react';

// 都道府県リスト
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

type Address = {
  id?: string;
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  line1: string;
  line2?: string | null;
  phoneNumber: string;
  isDefault: boolean;
};

type AddressModalProps = {
  address?: Address | null;
  onClose: () => void;
  onSubmit: (addressData: Address) => void;
  isProcessing: boolean;
  mode: 'add' | 'edit';
};

const AddressModal: React.FC<AddressModalProps> = ({
  address,
  onClose,
  onSubmit,
  isProcessing,
  mode
}) => {
  const [addressForm, setAddressForm] = useState<Address>({
    name: "",
    postalCode: "",
    prefecture: "",
    city: "",
    line1: "",
    line2: "",
    phoneNumber: "",
    isDefault: false,
  });

  useEffect(() => {
    if (address && mode === 'edit') {
      setAddressForm(address);
    }
  }, [address, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setAddressForm({
      ...addressForm,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const formatPostalCode = (code: string): string => {
    // ハイフンを除去し、数字のみを取得
    const digits = code.replace(/[^\d]/g, '');
    
    // 7桁以上の場合は、3桁目と4桁目の間にハイフンを挿入
    if (digits.length >= 7) {
      return `${digits.substring(0, 3)}-${digits.substring(3, 7)}`;
    }
    
    // 3桁以上の場合は、3桁目までとそれ以降を分離
    if (digits.length > 3) {
      return `${digits.substring(0, 3)}-${digits.substring(3)}`;
    }
    
    return digits;
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPostalCode(e.target.value);
    setAddressForm({
      ...addressForm,
      postalCode: formattedValue
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(addressForm);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {mode === 'add' ? 'お届け先の追加' : 'お届け先の編集'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                お名前
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={addressForm.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={addressForm.postalCode}
                onChange={handlePostalCodeChange}
                placeholder="123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-1">
                都道府県
              </label>
              <select
                id="prefecture"
                name="prefecture"
                value={addressForm.prefecture}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">選択してください</option>
                {PREFECTURES.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                市区町村
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={addressForm.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">
                番地
              </label>
              <input
                type="text"
                id="line1"
                name="line1"
                value={addressForm.line1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="line2" className="block text-sm font-medium text-gray-700 mb-1">
                建物名・部屋番号 (任意)
              </label>
              <input
                type="text"
                id="line2"
                name="line2"
                value={addressForm.line2 || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={addressForm.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleChange}
                className="mr-2 accent-orange-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                デフォルトの住所として設定する
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

export default AddressModal;
