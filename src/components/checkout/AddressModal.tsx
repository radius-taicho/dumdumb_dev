import React, { useState } from 'react';

type AddressModalProps = {
  onClose: () => void;
  onSubmit: (addressData: any) => void;
  isProcessing: boolean;
};

const AddressModal: React.FC<AddressModalProps> = ({
  onClose,
  onSubmit,
  isProcessing
}) => {
  const [addressForm, setAddressForm] = useState({
    name: "",
    postalCode: "",
    prefecture: "",
    city: "",
    line1: "",
    line2: "",
    phoneNumber: "",
    isDefault: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setAddressForm({
      ...addressForm,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (value === "" && name === "line2" ? null : value),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(addressForm);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">お届け先の追加</h3>
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
                onChange={handleChange}
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
                <option value="北海道">北海道</option>
                <option value="東京都">東京都</option>
                <option value="大阪府">大阪府</option>
                {/* 他の都道府県も追加 */}
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
                value={addressForm.line2}
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
