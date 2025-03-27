import React from "react";
import { FiBell } from "react-icons/fi";
import { toast } from "react-hot-toast";

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
  // 通知登録ボタンのハンドラ
  const handleNotificationSubscribe = () => {
    // ここに通知登録のロジックを実装
    toast.success(`${series.name}の新着通知を登録しました`);
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
    <div className="w-full flex flex-col">
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
          <div className="w-full max-w-[280px] rounded-md p-3 shadow-md relative transform rotate-[-1deg] max-h-[22%] flex-shrink-0">
            {/* 切り取り線 */}
            <div className="absolute left-0 top-0 h-full w-2 flex flex-col justify-around">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 bg-white rounded-full border border-gray-300"
                />
              ))}
            </div>

            <div className="pl-4">
              <div className="flex justify-between border-t border-dashed border-gray-300 pt-1 mb-1">
                <span className="text-[9px] font-semibold text-gray-700">
                  タイトル
                </span>
                <span className="text-[9px] text-gray-800 truncate max-w-[150px]">
                  {series.name}
                </span>
              </div>

              <div className="flex justify-between text-[9px] text-gray-700 mb-1">
                <span className="font-semibold">キャラクター数</span>
                <span>8</span>
              </div>

              <div className="flex justify-between text-[9px] text-gray-700">
                <span className="font-semibold">制作</span>
                <span>dumdumb studios</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* シリーズ情報 */}
      <div className="w-full bg-gray-100">
        <div className="container mx-auto py-4 px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{series.name}</h1>
            <p className="text-sm">
              {series.description && series.description.length > 100
                ? `${series.description.slice(0, 100)}...`
                : series.description || "シリーズの説明はありません"}
            </p>
          </div>
          <div>
            <button
              onClick={handleNotificationSubscribe}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <FiBell className="h-5 w-5" />
              <span className="text-sm">新着通知を受け取る</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesHeader;
