import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

// スライダーの設定（定数）
const SLIDER_CONFIG = {
  // サイズ設定（単位: px）
  containerHeight: 608, // 全体コンテナの高さ
  contentHeight: 560, // スライド内コンテンツの高さ
  navigationHeight: 48, // ナビゲーションエリアの高さ (containerHeight - contentHeight)
  aspectRatio: "16/9", // 画像コンテナのアスペクト比（幅/高さ）
  objectFit: "fill", // 画像のフィット方法（'cover', 'contain', 'fill'）

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

export default function MainVisualSlider(): JSX.Element {
  const [slides, setSlides] = useState<SliderImage[]>([]);
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
        setSlides(data);
      } catch (err) {
        console.error("Error fetching slider images:", err);
        setError("スライダー画像の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchSliderImages();
  }, []);

  // データがない場合のデフォルト画像（開発用）
  const defaultSlides = [
    {
      id: "1",
      title: "デフォルトスライド1",
      alt: "デフォルトスライド1",
      url: "/images/slide1.jpg",
      link: null,
    },
    {
      id: "2",
      title: "デフォルトスライド2",
      alt: "デフォルトスライド2",
      url: "/images/slide2.jpg",
      link: null,
    },
    {
      id: "3",
      title: "デフォルトスライド3",
      alt: "デフォルトスライド3",
      url: "/images/slide3.jpg",
      link: null,
    },
  ];

  // 表示するスライド（APIから取得したデータがなければデフォルト表示）
  const displaySlides = slides.length > 0 ? slides : defaultSlides;

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
    if (isVisible && displaySlides.length > 1) {
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
  }, [isVisible, startTimers, displaySlides.length]);

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
      className="relative bg-white overflow-hidden"
      style={{
        height: `${SLIDER_CONFIG.containerHeight}px`,
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* メインスライダー */}
      <div className="w-full h-full relative">
        {loading ? (
          // ローディング中表示
          <div
            className="bg-white flex items-center justify-center"
            style={{ height: `${SLIDER_CONFIG.contentHeight}px` }}
          >
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
          </div>
        ) : displaySlides.length === 0 ? (
          // スライド画像がない場合
          <div
            className="bg-white flex items-center justify-center"
            style={{ height: `${SLIDER_CONFIG.contentHeight}px` }}
          >
            <p>表示するスライド画像がありません</p>
          </div>
        ) : (
          // スライド表示
          <div className="relative w-full h-full overflow-hidden">
            {displaySlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                style={{ height: `${SLIDER_CONFIG.contentHeight}px` }}
              >
                {/* 画像コンテナ */}
                <div className="w-full h-full overflow-hidden">
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
        )}

        {/* ページネーションドット */}
        <div
          className="absolute bottom-0 w-full h-12 bg-white flex items-center justify-center"
          style={{ zIndex: 20 }}
        >
          <div className="flex gap-[10px] items-center">
            {displaySlides.map((dot, dotIndex) => (
              <div key={dot.id} className="relative">
                <button
                  onClick={() => goToSlide(dotIndex)}
                  className={`w-4 h-4 rounded-lg transition-colors duration-300 ${
                    dotIndex === currentIndex ? "bg-[#595959]" : "bg-[#d9d9d9]"
                  }`}
                  aria-label={`スライド${dotIndex + 1}に移動`}
                />

                {SLIDER_CONFIG.progressAnimation &&
                  dotIndex === currentIndex && (
                    <svg
                      className="absolute top-0 left-0 w-6 h-6 -rotate-90"
                      viewBox="0 0 24 24"
                      style={{
                        transform: "translate(-4px, -2.5px) rotate(-90deg)", // 中央に配置するためのオフセット
                      }}
                    >
                      {/* 背景円（透明） */}
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
                        className="text-black" // 黒い色を使用
                        cx="12"
                        cy="12"
                        r="10"
                        strokeWidth="3"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 10 * (1 - progress / 100)
                        }`}
                      />
                    </svg>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* 前へボタン */}
        <button
          onClick={prevSlide}
          className={`absolute left-6 top-1/2 transform -translate-y-1/2 rounded-full bg-[#d9d9d9] z-20 flex items-center justify-center transition-opacity duration-300 ${
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

        {/* 次へボタン */}
        <button
          onClick={nextSlide}
          className={`absolute right-6 top-1/2 transform -translate-y-1/2 rounded-full bg-[#d9d9d9] z-20 flex items-center justify-center transition-opacity duration-300 ${
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
      </div>
    </div>
  );
}
