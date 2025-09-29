import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

// スライダーの設定（定数）
const SLIDER_CONFIG = {
  // アスペクト比設定（1366:768 = 16:9）
  aspectRatio: 16 / 9, // 画像の元のアスペクト比
  objectFit: "contain", // 画像のフィット方法（アスペクト比を保持）

  // スライド設定
  autoplayInterval: 8000, // 自動スライドの間隔 (ミリ秒)
  progressAnimation: true, // 経過時間を表示する

  // ナビゲーションボタン設定
  navButtonSize: 12, // ナビゲーションボタンのサイズ
  navButtonOpacity: 0.4, // ナビゲーションボタンの不透明度
  navButtonHoverOpacity: 0.6, // ホバー時の不透明度
};

// スライダー画像の型定義
type SliderImage = {
  id: string;
  title: string;
  alt: string | null;
  url: string;
  link: string | null;
};

// デフォルトスライドデータ
const DEFAULT_SLIDES: SliderImage[] = [
  {
    id: "default-1",
    title: "メインビジュアル",
    alt: "メインビジュアル画像",
    url: "/images/mainvisual1.png",
    link: null,
  },
];

export default function MainVisualSlider(): JSX.Element {
  const [slides, setSlides] = useState<SliderImage[]>(DEFAULT_SLIDES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // refs
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // API からスライダー画像を取得
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/slider-images");

        if (!response.ok) {
          throw new Error("スライダー画像の取得に失敗しました");
        }

        const data = await response.json();
        console.log("Fetched slider images:", data);
        
        // APIからデータが取得できた場合は、デフォルトスライドと合わせて表示
        // もしくはAPIデータのみを表示したい場合は、setSlides(data);
        if (data && data.length > 0) {
          setSlides(data);
        }
        // APIデータがない場合は、デフォルトスライドを維持
      } catch (err) {
        console.error("Error fetching slider images:", err);
        setError("スライダー画像の読み込みに失敗しました");
        // エラーが発生した場合もデフォルトスライドを維持
      } finally {
        setLoading(false);
      }
    };

    fetchSliderImages();
  }, []);

  // 表示するスライドはAPIから取得したデータまたはデフォルトスライド
  const displaySlides = slides;

  // タイマーの開始
  const startTimers = useCallback(() => {
    // 既存のタイマーをクリアしてから開始
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }

    // 進捗状態をリセット
    setProgress(0);

    // 自動スライドタイマー
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displaySlides.length);
      setProgress(0); // 進行状況をリセット
    }, SLIDER_CONFIG.autoplayInterval);

    // 進行状況の更新タイマー
    const updateInterval = 50; // 50msごとに更新
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress =
          prev + (updateInterval / SLIDER_CONFIG.autoplayInterval) * 100;
        return Math.min(newProgress, 100);
      });
    }, updateInterval);
  }, [displaySlides.length]);

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

    // 表示中の場合のみ再開
    if (isVisible && displaySlides.length > 1) {
      startTimers();
    }
  }, [isVisible, startTimers, displaySlides.length]);

  // スライドインデックスの変更時に自動再生タイマーをリセット
  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  // Intersection Observer の設定
  useEffect(() => {
    if (!sliderRef.current) return;

    // 画面内表示の監視
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 } // 50%以上表示されている場合
    );

    observerRef.current.observe(sliderRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // 表示状態に基づいてタイマーを制御
  useEffect(() => {
    // スライドがある場合はタイマーを開始（ロードが完了してから）
    if (isVisible && displaySlides.length > 1 && !loading) {
      startTimers();
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [isVisible, startTimers, displaySlides.length, loading]);

  // スライドを特定のインデックスに移動させる関数
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // 前のスライドに移動
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? displaySlides.length - 1 : prev - 1
    );
  }, [displaySlides.length]);

  // 次のスライドに移動
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === displaySlides.length - 1 ? 0 : prev + 1
    );
  }, [displaySlides.length]);

  return (
    <div
      ref={sliderRef}
      className="relative bg-gray-50 p-4 md:p-6 lg:p-8"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        {/* メインスライダー - アスペクト比16:9で固定 */}
        <div className="w-full relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: SLIDER_CONFIG.aspectRatio }}>
          {/* スライド表示 - デフォルトスライドがあるので常に表示 */}
          <div className="absolute inset-0 overflow-hidden">
            {displaySlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {/* 画像コンテナ */}
                <div className="w-full h-full overflow-hidden bg-gray-100">
                  {slide.link ? (
                    <Link href={slide.link} className="block w-full h-full">
                      <img
                        src={slide.url}
                        alt={slide.alt || slide.title}
                        className="w-full h-full"
                        style={{ objectFit: SLIDER_CONFIG.objectFit as any }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/placeholder.jpg";
                        }}
                      />
                    </Link>
                  ) : (
                    <img
                      src={slide.url}
                      alt={slide.alt || slide.title}
                      className="w-full h-full"
                      style={{ objectFit: SLIDER_CONFIG.objectFit as any }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder.jpg";
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 前へボタン - 複数スライドがある場合のみ表示 */}
          {displaySlides.length > 1 && (
            <button
              onClick={prevSlide}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white z-20 flex items-center justify-center transition-all duration-300 ${
                !showControls && "opacity-0"
              }`}
              style={{
                width: `${SLIDER_CONFIG.navButtonSize * 3}px`,
                height: `${SLIDER_CONFIG.navButtonSize * 3}px`,
                opacity: showControls ? SLIDER_CONFIG.navButtonOpacity : 0,
              }}
              aria-label="前のスライド"
            >
              <FiChevronRight
                style={{
                  height: `${SLIDER_CONFIG.navButtonSize}px`,
                  width: `${SLIDER_CONFIG.navButtonSize}px`,
                  transform: "rotate(180deg)",
                }}
              />
            </button>
          )}

          {/* 次へボタン - 複数スライドがある場合のみ表示 */}
          {displaySlides.length > 1 && (
            <button
              onClick={nextSlide}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white z-20 flex items-center justify-center transition-all duration-300 ${
                !showControls && "opacity-0"
              }`}
              style={{
                width: `${SLIDER_CONFIG.navButtonSize * 3}px`,
                height: `${SLIDER_CONFIG.navButtonSize * 3}px`,
                opacity: showControls ? SLIDER_CONFIG.navButtonOpacity : 0,
              }}
              aria-label="次のスライド"
            >
              <FiChevronRight
                style={{
                  height: `${SLIDER_CONFIG.navButtonSize}px`,
                  width: `${SLIDER_CONFIG.navButtonSize}px`,
                }}
              />
            </button>
          )}
        </div>

        {/* ページネーションドット - 画像の下部に表示 */}
        {displaySlides.length > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-[10px] items-center bg-white/80 rounded-full px-4 py-2 shadow-sm">
              {displaySlides.map((dot, dotIndex) => (
                <div key={dot.id} className="relative">
                  <button
                    onClick={() => goToSlide(dotIndex)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      dotIndex === currentIndex
                        ? "bg-[#595959]"
                        : "bg-[#d9d9d9]"
                    }`}
                    aria-label={`スライド${dotIndex + 1}に移動`}
                  />

                  {SLIDER_CONFIG.progressAnimation &&
                    dotIndex === currentIndex && (
                      <svg
                        className="absolute top-0 left-0 w-5 h-5 -rotate-90"
                        viewBox="0 0 20 20"
                        style={{
                          transform: "translate(-2px, -2px) rotate(-90deg)",
                        }}
                      >
                        {/* 背景円（透明） */}
                        <circle
                          className="text-transparent"
                          cx="10"
                          cy="10"
                          r="8"
                          strokeWidth="2"
                          fill="none"
                          stroke="currentColor"
                        />
                        {/* 進行インジケーター */}
                        <circle
                          className="text-black"
                          cx="10"
                          cy="10"
                          r="8"
                          strokeWidth="2"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray={`${2 * Math.PI * 8}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 8 * (1 - progress / 100)
                          }`}
                        />
                      </svg>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}