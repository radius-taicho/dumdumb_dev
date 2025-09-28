import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import { ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

type SiteInfoItem = {
  id: string;
  title: string;
  description: string;
  subDescription?: string;
  url?: string; // 関連サイトへのリンク
  imageUrl?: string; // ロゴ画像URL
  slideIndex: number;
  columnIndex: number;
  displayOrder: number;
};

// サイト情報を取得する関数
const useSiteInfo = () => {
  const [siteInfoItems, setSiteInfoItems] = useState<SiteInfoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        setIsLoading(true);
        // ここでAPIからデータを取得
        const response = await fetch("/api/site-info");

        if (!response.ok) {
          throw new Error("サイト情報の取得に失敗しました");
        }

        const data = await response.json();
        setSiteInfoItems(data);
      } catch (err) {
        console.error("サイト情報取得エラー:", err);
        setError("サイト情報の読み込みに失敗しました");

        // エラーが発生した場合はダミーデータを使用（関連サイトのみ）
        setSiteInfoItems([
          {
            id: "2",
            title: "関連サイト",
            description: "Example Site 1",
            subDescription: "サイト説明1",
            url: "https://example.com",
            slideIndex: 0,
            columnIndex: 0,
            displayOrder: 1,
          },
          {
            id: "3",
            title: "関連サイト",
            description: "Example Site 2",
            subDescription: "サイト説明2",
            url: "https://example.com",
            slideIndex: 0,
            columnIndex: 1,
            displayOrder: 2,
          },
          {
            id: "4",
            title: "関連サイト",
            description: "Example Site 3",
            subDescription: "サイト説明3",
            url: "https://example.com",
            slideIndex: 1,
            columnIndex: 0,
            displayOrder: 3,
          },
          {
            id: "5",
            title: "関連サイト",
            description: "Example Site 4",
            subDescription: "サイト説明4",
            url: "https://example.com",
            slideIndex: 1,
            columnIndex: 1,
            displayOrder: 4,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteInfo();
  }, []);

  // スライドごとにアイテムをグループ化する（関連サイトのみ）
  const groupedSiteInfo = React.useMemo(() => {
    // 関連サイトのみを抽出してグループ化
    const relatedSites = siteInfoItems.filter(
      (item) => item.title === "関連サイト" || item.url // URLがあるものを関連サイトとして扱う
    );

    const groupedData: SiteInfoItem[][] = [];

    if (relatedSites.length === 0) return groupedData;

    // スライドインデックスの最大値を取得
    const maxSlideIndex = Math.max(
      ...relatedSites.map((item) => item.slideIndex),
      0
    );

    // 各スライドのデータを準備
    for (let i = 0; i <= maxSlideIndex; i++) {
      const slideItems = relatedSites
        .filter((item) => item.slideIndex === i)
        .sort((a, b) => a.displayOrder - b.displayOrder); // 表示順でソート

      if (slideItems.length > 0) {
        groupedData.push(slideItems);
      }
    }

    return groupedData;
  }, [siteInfoItems]);

  return { siteInfoItems, groupedSiteInfo, isLoading, error };
};

// 関連サイトカードコンポーネント
const RelatedSiteCard: React.FC<{ item: SiteInfoItem }> = ({ item }) => {
  return (
    <div className="mb-4">
      <div className="flex items-center">
        <div
          className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex-shrink-0 overflow-hidden"
          aria-label={`${item.description}のアイコン`}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.description}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          {item.url ? (
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline flex items-center text-sm"
            >
              <span className="truncate">{item.description}</span>
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
            </Link>
          ) : (
            <p className="font-medium text-sm truncate">{item.description}</p>
          )}
          {item.subDescription && (
            <p className="text-xs text-gray-600 truncate">
              {item.subDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// dumdumbについてセクション（固定）
const AboutDumdumbSection: React.FC = () => {
  return (
    <div className="h-full">
      <h2 className="text-xl font-bold mb-4">dumdumbについて</h2>
      <div className="flex items-start mb-4">
        <div
          className="w-20 h-20 rounded-full mr-4 flex-shrink-0 overflow-hidden"
          aria-label="dumdumbのロゴ"
        >
          <img
            src="/images/logo_info.webp"
            alt="dumdumb logo"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
        <div className="text-gray-700 leading-relaxed flex-1">
          <p className="mb-4">
            <span className="font-medium">「"カワイイ"を身につけよう」</span>
            というコンセプトをもとに、 可愛らしいアイテムを作成しています。
          </p>
          <p className="mb-4">
            アイテムを使って、あなたの人生に
            <span className="font-medium">カワイイ</span>を付けてみませんか？
          </p>
        </div>
      </div>
    </div>
  );
};

// コントロールボタンを含むドットナビゲーションコンポーネント
const DotsNavigation: React.FC<{
  count: number;
  activeIndex: number;
  onChange: (index: number) => void;
  progress?: number;
}> = ({ count, activeIndex, onChange, progress = 0 }) => {
  if (count <= 1) return null;

  return (
    <div className="flex justify-center space-x-2 mt-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative">
          <button
            className={`w-4 h-4 rounded-full transition-colors ${
              index === activeIndex ? "bg-[#595959]" : "bg-[#d9d9d9]"
            }`}
            onClick={() => onChange(index)}
            aria-label={`スライド ${index + 1} へ移動`}
          />

          {/* 進行状況インジケーター（アクティブなドットのみ） */}
          {index === activeIndex && (
            <svg
              className="absolute top-0 left-0 w-6 h-6 -rotate-90"
              viewBox="0 0 24 24"
              style={{
                transform: "translate(-4px, -2.5px) rotate(-90deg)",
              }}
            >
              {/* 透明な背景円 */}
              <circle
                className="text-transparent"
                cx="12"
                cy="12"
                r="10"
                strokeWidth="3"
                fill="none"
                stroke="currentColor"
              />
              {/* 進行インジケーター */}
              <circle
                className="text-black"
                cx="12"
                cy="12"
                r="10"
                strokeWidth="3"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${2 * Math.PI * 10}`}
                strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

// メインコンポーネント
const SiteInfoSection: React.FC = () => {
  const { groupedSiteInfo, isLoading, error } = useSiteInfo();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // 自動スライドのタイマー開始
  const startTimers = useCallback(() => {
    // 既存のタイマーをクリア
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }

    // 進行状態をリセット
    setProgress(0);

    // 関連サイトが複数スライドある場合のみ自動再生
    if (groupedSiteInfo.length <= 1) return;

    const autoplayInterval = 8000; // 8秒間隔
    autoPlayRef.current = setInterval(() => {
      setActiveSlideIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % groupedSiteInfo.length;
        return nextIndex;
      });
      setProgress(0); // 進行状況をリセット
    }, autoplayInterval);

    // 進行状況の更新タイマー
    const updateInterval = 50; // 50msごとに更新
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (updateInterval / autoplayInterval) * 100;
        return Math.min(newProgress, 100);
      });
    }, updateInterval);
  }, [groupedSiteInfo.length]);

  // タイマーのリセット
  const resetTimer = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }

    setProgress(0);
  }, []);

  // スライドが変更されたときの処理
  const handleSlideChange = useCallback(
    (index: number) => {
      // インデックスが範囲外の場合は調整
      if (!groupedSiteInfo.length) return;

      const validIndex = Math.max(
        0,
        Math.min(index, groupedSiteInfo.length - 1)
      );
      setActiveSlideIndex(validIndex);

      if (apiRef.current) {
        apiRef.current.scrollTo(validIndex);
      }

      // タイマーをリセットして再開
      resetTimer();
      startTimers();
    },
    [groupedSiteInfo.length, resetTimer, startTimers]
  );

  // Carouselのイベントハンドラ
  const handleCarouselChange = useCallback(
    (index: number) => {
      setActiveSlideIndex(index);
      // タイマーをリセットして再開
      resetTimer();
      startTimers();
    },
    [resetTimer, startTimers]
  );

  // 初期化時と依存変数変更時にタイマーを開始
  useEffect(() => {
    if (groupedSiteInfo.length > 1 && !isLoading) {
      startTimers();
    }

    // クリーンアップ関数
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [groupedSiteInfo.length, isLoading, startTimers]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 mb-12 py-16">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側 - dumdumbについて（デスクトップ） */}
            <div className="order-1">
              <div className="h-8 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>

            {/* 右側 - 関連サイト */}
            <div className="order-2 lg:order-2">
              <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 mb-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側 - dumdumbについて（常に表示） */}
          <div className="order-1">
            <AboutDumdumbSection />
          </div>
          
          {/* 右側 - エラーメッセージ */}
          <div className="order-2">
            <h2 className="text-xl font-bold mb-4">関連サイト</h2>
            <p className="text-red-500 text-center py-8">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="container mx-auto px-4 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側 - dumdumbについて（固定コンテンツ） */}
        <div className="order-1">
          <AboutDumdumbSection />
        </div>
        
        {/* 右側 - 関連サイト（管理者登録データ） */}
        <div className="order-2">
          <h2 className="text-xl font-bold mb-4">関連サイト</h2>

          {groupedSiteInfo.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              関連サイトの情報がありません
            </div>
          ) : (
            <div className="relative">
              <Carousel
                className="relative w-full"
                setApi={(api) => (apiRef.current = api)}
                onSelect={handleCarouselChange}
                index={activeSlideIndex}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                <CarouselContent>
                  {groupedSiteInfo.map((slide, slideIndex) => (
                    <CarouselItem
                      key={slideIndex}
                      className="w-full"
                      onSelect={() => handleSlideChange(slideIndex)}
                    >
                      <div className="space-y-2">
                        {slide.map((item) => (
                          <RelatedSiteCard key={item.id} item={item} />
                        ))}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {groupedSiteInfo.length > 1 && (
                  <>
                    <CarouselPrevious
                      onClick={() =>
                        handleSlideChange(
                          activeSlideIndex > 0
                            ? activeSlideIndex - 1
                            : groupedSiteInfo.length - 1
                        )
                      }
                      className={`absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-700 text-white transition-opacity duration-300 ${
                        showControls
                          ? "opacity-70 hover:opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </CarouselPrevious>
                    <CarouselNext
                      onClick={() =>
                        handleSlideChange(
                          activeSlideIndex < groupedSiteInfo.length - 1
                            ? activeSlideIndex + 1
                            : 0
                        )
                      }
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-700 text-white transition-opacity duration-300 ${
                        showControls
                          ? "opacity-70 hover:opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </CarouselNext>
                  </>
                )}
              </Carousel>

              {/* ナビゲーションドット */}
              <DotsNavigation
                count={groupedSiteInfo.length}
                activeIndex={activeSlideIndex}
                onChange={handleSlideChange}
                progress={progress}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteInfoSection;
