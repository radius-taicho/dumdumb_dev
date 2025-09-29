import React, { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

type SeriesHeaderProps = {
  series: {
    id: string;
    name: string;
    description: string | null;

    // メインメディア
    image: string | null;
    media?: {
      url: string;
      fileType?: string;
    } | null;
    isMainVideo: boolean;

    // サブメディア
    subMedia?: {
      url: string;
    } | null;
  };
};

const SeriesHeader: React.FC<SeriesHeaderProps> = ({ series }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 初期状態を取得
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!session?.user?.id || !series.id) return;

      try {
        const response = await fetch(`/api/notifications/check-subscription?seriesId=${series.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.isSubscribed);
        }
      } catch (error) {
        console.error('シリーズ通知登録状態の確認に失敗しました:', error);
      }
    };

    checkSubscriptionStatus();
  }, [session, series.id]);

  // 通知登録ボタンのハンドラ
  const handleNotificationSubscribe = async () => {
    if (isLoading) return;
    
    if (!session?.user) {
      toast.error('通知を受け取るにはログインが必要です');
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (!series.id) {
      toast.error('シリーズ情報が正しく設定されていません');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/notifications/series-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seriesId: series.id }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsSubscribed(data.isSubscribed);
        toast.success(data.message);
      } else {
        toast.error(data.message || '通知登録に失敗しました');
      }
    } catch (error) {
      console.error('シリーズ通知登録エラー:', error);
      toast.error('通知の登録中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // メインメディアURLを取得 (メディアURLかimageURLか)
  const getMainMediaUrl = () => {
    if (series.media?.url) return series.media.url;
    if (series.image) return series.image;
    return "/images/placeholder.jpg";
  };

  // サブ画像URLを取得
  const getSubMediaUrl = () => {
    if (series.subMedia?.url) return series.subMedia.url;
    return "/images/placeholder.jpg";
  };

  // メインメディアが動画かどうかを判定
  const isVideo =
    series.isMainVideo && getMainMediaUrl().match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="w-full flex flex-col bg-[#141414] text-[#f8f8f8]">
      <div className="container mx-auto flex flex-col md:flex-row py-12 w-full gap-4">
        {/* 左側：メイン画像または動画（シネマスコープ風） */}
        <div className="w-full md:w-9/12 bg-black rounded-md h-56 md:h-[532px] relative overflow-hidden flex items-center">
          {/* シネマスコープアスペクト比（2.35:1）の内部コンテナ */}
          <div className="w-full bg-black py-8 md:py-16">
            {isVideo ? (
              <video
                src={getMainMediaUrl()}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                controls
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  target.poster = "/images/placeholder.jpg";
                }}
              >
                <source src={getMainMediaUrl()} type="video/mp4" />
                お使いのブラウザは動画再生をサポートしていません
              </video>
            ) : (
              <img
                src={getMainMediaUrl()}
                alt={series.name}
                className="w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder.jpg";
                }}
              />
            )}
          </div>
        </div>

        {/* 右側：サブ画像（ポスター比率）と映画チケット */}
        <div className="w-full md:w-3/12 flex flex-col justify-between items-center h-56 md:h-[532px]">
          {/* ポスター画像 */}
          <div className="aspect-[1/1.414] w-full max-w-[280px] border border-black-300 shadow-xl rounded relative overflow-hidden flex-shrink-0 h-auto max-h-[75%]">
            {/* メインイメージ */}
            <img
              src={getSubMediaUrl()}
              alt={`${series.name} サブ画像`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder.jpg";
              }}
            />
          </div>

          {/* 映画チケット風の情報カード */}
          <div className="w-full max-w-[280px] bg-[#222222] rounded-md p-3 shadow-md relative transform rotate-[-1deg] h-[130px] flex-shrink-0 overflow-hidden">
            {/* 左側の切り取り線（パンチ空け） */}
            <div className="absolute left-0 top-0 h-full w-2 flex flex-col justify-around">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-2 w-2 bg-[#141414] rounded-full" />
              ))}
            </div>

            <div className="pl-4 text-[#f8f8f8] flex flex-col justify-between h-full">
              {/* 上部情報 */}
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="font-semibold">タイトル</span>
                  <span>{series.name}</span>
                </div>

                <div className="flex justify-between text-[12px] mb-1">
                  <span className="font-semibold">キャラクター数</span>
                  <span>8</span>
                </div>

                <div className="flex justify-between text-[12px]">
                  <span className="font-semibold">制作</span>
                  <span>dumdumb studios</span>
                </div>
              </div>

              {/* 下部のリンクエリア */}
              <div className="mt-2 pt-1 border-t border-dashed border-gray-300">
                <div className="flex items-center justify-end">
                  <span className="text-[12px] text-right hover:underline text-[#f8f8f8]/90">
                    <Link href={`/characters`}>
                      {series.name}のキャラクター一覧へ
                    </Link>
                  </span>
                </div>
              </div>
            </div>

            {/* 右側の切り取り線 */}
            <div className="absolute right-0 top-0 h-full w-2 flex flex-col justify-around">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-2 w-2 bg-[#141414] rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* シリーズ情報 */}
      <div className="w-full bg-[#222222]">
        <div className="container mx-auto py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-md">
              {series.description && series.description.length > 100
                ? `${series.description.slice(0, 100)}...`
                : series.description || "シリーズの説明はありません"}
            </p>
          </div>
          <div>
            <button
              onClick={handleNotificationSubscribe}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 ${isSubscribed ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-800 hover:bg-gray-700'} text-white rounded-md transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiBell className="h-5 w-5" />
              <span className="text-sm">このシリーズの新着通知を受け取る</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesHeader;
