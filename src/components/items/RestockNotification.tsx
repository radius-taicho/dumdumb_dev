import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

type RestockNotificationProps = {
  isVisible?: boolean;
  itemId?: string;
  size?: string;
};

const RestockNotification: React.FC<RestockNotificationProps> = ({ 
  isVisible = true, 
  itemId,
  size 
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // 初期状態を取得
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!session?.user?.id || !itemId || !size) return;

      try {
        const response = await fetch(`/api/notifications/check-subscription?itemId=${itemId}&size=${size}`);
        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.isSubscribed);
        }
      } catch (error) {
        console.error('登録状態の確認に失敗しました:', error);
      }
    };

    checkSubscriptionStatus();
  }, [session, itemId, size]);

  const handleSubscribe = async () => {
    if (isLoading) return;
    
    if (!session?.user) {
      toast.error('通知を受け取るにはログインが必要です');
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (!itemId || !size) {
      toast.error('商品情報が正しく設定されていません');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/notifications/restock-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, size }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsSubscribed(data.isSubscribed);
        toast.success(data.message);
      } else {
        toast.error(data.message || '通知登録に失敗しました');
      }
    } catch (error) {
      console.error('通知登録エラー:', error);
      toast.error('通知の登録中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute -top-2 -right-2 z-10">
      <div className="relative">
        <button
          onClick={handleSubscribe}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={isLoading}
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            isSubscribed ? "bg-gray-200" : "bg-white border border-gray-300"
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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