import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// ユーザーアイコンの型定義
type UserIcon = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  isDefault?: boolean;
};

type ProfileImageModalProps = {
  currentImage: string | null;
  onClose: () => void;
  onSubmit: (imageUrl: string | null) => void;
  isProcessing: boolean;
};

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({
  currentImage,
  onClose,
  onSubmit,
  isProcessing
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);
  const [icons, setIcons] = useState<UserIcon[]>([]);
  const [defaultIconUrl, setDefaultIconUrl] = useState<string | null>(null);
  const [loadingIcons, setLoadingIcons] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // アイコン一覧を取得
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        setLoadingIcons(true);
        const response = await fetch('/api/user/icons');
        if (!response.ok) {
          throw new Error('アイコンの取得に失敗しました');
        }
        const data = await response.json();
        setIcons(data.icons || []);
        setDefaultIconUrl(data.defaultIconUrl || null);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch icons:', error);
        setError('アイコンの読み込みに失敗しました。後でもう一度お試しください。');
      } finally {
        setLoadingIcons(false);
      }
    };

    fetchIcons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedImage);
  };

  // 現在表示するアイコンURL（選択されたもの、またはデフォルト）
  const displayImageUrl = selectedImage || defaultIconUrl;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">プロフィール画像の変更</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロフィール画像
              </label>
              
              <div className="mb-3">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-gray-300 mx-auto">
                  {displayImageUrl ? (
                    <Image
                      src={displayImageUrl}
                      alt="プロフィール画像"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {selectedImage === null && defaultIconUrl && (
                  <p className="text-xs text-center mt-1 text-gray-500">
                    デフォルトアイコンが使用されます
                  </p>
                )}
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2 text-center">
                  以下から選択してください
                </p>
                
                {loadingIcons ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
                    <p className="text-gray-500 mt-2">アイコンを読み込み中...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {icons.map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => setSelectedImage(icon.url)}
                        className={`relative h-16 w-16 overflow-hidden rounded-full border ${
                          selectedImage === icon.url 
                            ? 'border-orange-500 ring-2 ring-orange-300' 
                            : 'border-gray-200 hover:border-gray-300'
                        } mx-auto`}
                      >
                        <Image
                          src={icon.url}
                          alt={icon.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        {icon.isDefault && (
                          <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs px-1 text-center">
                            デフォルト
                          </div>
                        )}
                      </button>
                    ))}
                    
                    {/* デフォルトアイコンを使用するオプション */}
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className={`relative h-16 w-16 overflow-hidden rounded-full border ${
                        selectedImage === null 
                          ? 'border-orange-500 ring-2 ring-orange-300' 
                          : 'border-gray-200 hover:border-gray-300'
                      } mx-auto flex items-center justify-center bg-gray-100`}
                    >
                      {defaultIconUrl ? (
                        <>
                          <Image
                            src={defaultIconUrl}
                            alt="デフォルトアイコン"
                            fill
                            sizes="64px"
                            className="object-cover opacity-70"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                            <span className="text-xs text-white font-medium px-1 py-0.5 bg-orange-500 rounded">デフォルト</span>
                          </div>
                        </>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
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

export default ProfileImageModal;
