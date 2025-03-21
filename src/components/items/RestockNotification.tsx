import React, { useState } from 'react';

type RestockNotificationProps = {
  isVisible: boolean;
};

const RestockNotification: React.FC<RestockNotificationProps> = ({ isVisible }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute -top-2 -right-2 z-10">
      <div className="relative">
        <button
          onClick={handleSubscribe}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            isSubscribed ? "bg-gray-200" : "bg-white border border-gray-300"
          }`}
          aria-label={isSubscribed ? "再入荷通知を解除" : "再入荷通知を設定"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 10C24 7.87827 23.1571 5.84344 21.6569 4.34315C20.1566 2.84285 18.1217 2 16 2C13.8783 2 11.8434 2.84285 10.3431 4.34315C8.84285 5.84344 8 7.87827 8 10C8 17 5 19 5 19H27C27 19 24 17 24 10Z"
              stroke={isSubscribed ? "#f97316" : "black"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.3 23C18.1111 23.3031 17.8428 23.5547 17.5215 23.7295C17.2002 23.9044 16.8383 23.9965 16.47 24C16.1017 23.9965 15.7399 23.9044 15.4185 23.7295C15.0972 23.5547 14.8289 23.3031 14.64 23"
              stroke={isSubscribed ? "#f97316" : "black"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        {/* ツールチップ */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            {isSubscribed 
              ? "再入荷通知を解除するにはクリック" 
              : "再入荷した際に通知を受け取る場合はクリック"}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestockNotification;