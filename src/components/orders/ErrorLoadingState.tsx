import React from 'react';
import { useRouter } from 'next/router';

interface ErrorLoadingStateProps {
  isLoading: boolean;
  error?: string;
  backToOrdersText: string;
  loadingText: string;
}

/**
 * 注文詳細の読み込み中またはエラー状態を表示するコンポーネント
 */
const ErrorLoadingState: React.FC<ErrorLoadingStateProps> = ({
  isLoading,
  error,
  backToOrdersText,
  loadingText
}) => {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      {error ? (
        <div className="py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/mypage/orders")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            {backToOrdersText}
          </button>
        </div>
      ) : (
        <div className="py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>{loadingText}</p>
        </div>
      )}
    </div>
  );
};

export default ErrorLoadingState;
