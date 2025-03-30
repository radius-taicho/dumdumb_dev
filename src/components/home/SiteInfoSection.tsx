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
        const response = await fetch('/api/site-info');
        
        if (!response.ok) {
          throw new Error('サイト情報の取得に失敗しました');
        }
        
        const data = await response.json();
        setSiteInfoItems(data);
      } catch (err) {
        console.error('サイト情報取得エラー:', err);
        setError('サイト情報の読み込みに失敗しました');
        
        // エラーが発生した場合はダミーデータを使用
        setSiteInfoItems([
          {
            id: "1",
            title: "このサイトについて",
            description: "コンセプト説明",
            subDescription: "サイト説明",
            slideIndex: 0,
            columnIndex: 0,
            displayOrder: 1,
          },
          {
            id: "2",
            title: "関連サイト",
            description: "link",
            subDescription: "サイト説明",
            url: "https://example.com",
            slideIndex: 0,
            columnIndex: 1,
            displayOrder: 2,
          },
          {
            id: "3",
            title: "関連サイト",
            description: "link",
            subDescription: "サイト説明",
            url: "https://example.com",
            slideIndex: 1,
            columnIndex: 0,
            displayOrder: 3,
          },
          {
            id: "4",
            title: "関連サイト",
            description: "link",
            subDescription: "サイト説明",
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

  // スライドごとにアイテムをグループ化する
  const groupedSiteInfo = React.useMemo(() => {
    const groupedData: SiteInfoItem[][] = [];
    
    // スライドインデックスの最大値を取得
    const maxSlideIndex = Math.max(...siteInfoItems.map(item => item.slideIndex), 0);
    
    // 各スライドのデータを準備
    for (let i = 0; i <= maxSlideIndex; i++) {
      const slideItems = siteInfoItems
        .filter(item => item.slideIndex === i)
        .sort((a, b) => a.displayOrder - b.displayOrder); // 表示順でソート
      
      groupedData.push(slideItems);
    }
    
    return groupedData;
  }, [siteInfoItems]);

  return { siteInfoItems, groupedSiteInfo, isLoading, error };
};

// SiteInfoItemカードコンポーネント
const SiteInfoCard: React.FC<{ item: SiteInfoItem }> = ({ item }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">{item.title}</h2>
      <div className="flex items-center mb-2">
        <div
          className="w-12 h-12 bg-gray-300 rounded-full mr-3 overflow-hidden"
          aria-label={`${item.title}のアイコン`}
        >
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : null}
        </div>
        <div>
          {item.url ? (
            <Link 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium hover:underline flex items-center"
            >
              {item.description}
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          ) : (
            <p className="font-medium">{item.description}</p>
          )}
          {item.subDescription && (
            <p className="text-sm text-gray-600">{item.subDescription}</p>
          )}
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
  return (
    <div className="flex justify-center space-x-2 mt-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative">
          <button
            className={`w-4 h-4 rounded-full ${
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

    // 自動スライドタイマー（グループ情報がない場合は何もしない）
    if (!groupedSiteInfo.length) return;

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
  const handleSlideChange = useCallback((index: number) => {
    // インデックスが範囲外の場合は調整
    if (!groupedSiteInfo.length) return;
    
    const validIndex = Math.max(0, Math.min(index, groupedSiteInfo.length - 1));
    setActiveSlideIndex(validIndex);
    
    if (apiRef.current) {
      apiRef.current.scrollTo(validIndex);
    }
    
    // タイマーをリセットして再開
    resetTimer();
    startTimers();
  }, [groupedSiteInfo.length, resetTimer, startTimers]);

  // Carouselのイベントハンドラ
  const handleCarouselChange = useCallback((index: number) => {
    setActiveSlideIndex(index);
    // タイマーをリセットして再開
    resetTimer();
    startTimers();
  }, [resetTimer, startTimers]);

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
      <div className="container mx-auto px-4 mb-12 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[0, 1].map((i) => (
              <div key={i} className="mb-6">
                <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
                  <div className="w-full">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 mb-12 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (groupedSiteInfo.length === 0) {
    return null;
  }

  return (
    <div ref={sectionRef} className="container mx-auto px-4 mb-12">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {slide.map((item) => (
                  <SiteInfoCard key={item.id} item={item} />
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {groupedSiteInfo.length > 1 && (
          <>
            <CarouselPrevious 
              onClick={() => handleSlideChange(activeSlideIndex > 0 ? activeSlideIndex - 1 : groupedSiteInfo.length - 1)}
              className={`absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-700 text-white transition-opacity duration-300 ${showControls ? 'opacity-70 hover:opacity-100' : 'opacity-0'}` }
            >
              <ChevronLeft className="h-5 w-5" />
            </CarouselPrevious>
            <CarouselNext 
              onClick={() => handleSlideChange(activeSlideIndex < groupedSiteInfo.length - 1 ? activeSlideIndex + 1 : 0)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-700 text-white transition-opacity duration-300 ${showControls ? 'opacity-70 hover:opacity-100' : 'opacity-0'}` }
            >
              <ChevronRight className="h-5 w-5" />
            </CarouselNext>
          </>
        )}
      </Carousel>

      {/* ナビゲーションドット */}
      {groupedSiteInfo.length > 1 && (
        <DotsNavigation
          count={groupedSiteInfo.length}
          activeIndex={activeSlideIndex}
          onChange={handleSlideChange}
          progress={progress}
        />
      )}
    </div>
  );
};

export default SiteInfoSection;
