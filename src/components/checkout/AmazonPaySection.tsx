import React, { useState } from 'react';

type AmazonPaySectionProps = {
  onAmazonPay: (amazonOrderReferenceId: string, billingAgreementId?: string) => void;
  isProcessing: boolean;
};

const AmazonPaySection: React.FC<AmazonPaySectionProps> = ({ 
  onAmazonPay, 
  isProcessing 
}) => {
  // Amazon Pay処理を手動で開始するハンドラー
  const handleManualAmazonPay = () => {
    // 開発環境用のモック処理
    // 実際の実装では、AmazonのLoginとPayのSDK呼び出しを行います
    const mockOrderReferenceId = `manual-amazon-order-ref-${Date.now()}`;
    onAmazonPay(mockOrderReferenceId);
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">
        amazonアカウントでお支払い
      </h2>
      <div className="flex flex-col">
        {/* シンプルなボタン実装 - Reactのレンダリングサイクルに従う */}
        <div className="mb-4">
          <button 
            className="bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 rounded-lg py-3 px-6 w-56"
            onClick={handleManualAmazonPay}
            disabled={isProcessing}
          >
            <div className="flex items-center justify-center">
              <span className="text-lg font-semibold">amazon pay</span>
              {isProcessing && (
                <span className="ml-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
            </div>
          </button>
        </div>
        <p className="text-sm text-gray-600">
          ※amazonアカウントに登録されているお届け先とお支払い方法の情報を引き継ぎます
        </p>
        
        {/* 本番環境では以下のスクリプトを有効化 */}
        {/* 
        <script
          async
          src="https://static-fe.payments-amazon.com/OffAmazonPayments/jp/sandbox/lpa/js/Widgets.js"
        ></script>
        */}
      </div>
    </div>
  );
};

export default AmazonPaySection;