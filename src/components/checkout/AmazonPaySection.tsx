import React from 'react';

type AmazonPaySectionProps = {
  onAmazonPay: () => void;
  isProcessing: boolean;
};

const AmazonPaySection: React.FC<AmazonPaySectionProps> = ({ 
  onAmazonPay, 
  isProcessing 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">
        amazonアカウントでお支払い
      </h2>
      <div className="flex flex-col">
        <button 
          className="bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 rounded-lg py-3 px-6 w-56 mb-4"
          onClick={onAmazonPay}
          disabled={isProcessing}
        >
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold">amazon pay</span>
          </div>
        </button>
        <p className="text-sm text-gray-600">
          ※amazonアカウントに登録されているお届け先とお支払い方法の情報を引き継ぎます
        </p>
      </div>
    </div>
  );
};

export default AmazonPaySection;
