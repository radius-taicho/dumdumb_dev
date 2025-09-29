import React, { useState } from 'react';

type AccountEditModalProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  onClose: () => void;
  onSubmit: (userData: { name: string; image: string | null }) => void;
  isProcessing: boolean;
};

const AccountEditModal: React.FC<AccountEditModalProps> = ({
  user,
  onClose,
  onSubmit,
  isProcessing
}) => {
  // 空文字列をデフォルトにして、nullやundefinedに変換されないようにする
  const [name, setName] = useState(user.name || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ニックネームは空でも送信できるよう、特別な処理は行わない
    const trimmedName = name.trim();
    console.log('Submitting name value:', trimmedName);
    console.log('Current user image:', user.image);
    
    // 元々nullの場合や、undefinedの場合も正しく処理する
    const userImage = user.image === undefined ? null : user.image;
    
    // onSubmitに現在の画像URLをそのまま渡す（変更なし）
    onSubmit({
      name: trimmedName, // trimを適用して余分な空白を削除
      image: userImage
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">アカウント情報の編集</h3>
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
                ニックネーム
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                他のユーザーに表示される名前です（任意）
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                メールアドレスは変更できません
              </p>
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

export default AccountEditModal;
