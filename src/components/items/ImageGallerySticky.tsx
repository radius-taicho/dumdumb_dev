import React, { useState, useEffect, useRef } from "react";
import ThumbnailImage from "./ThumbnailImage";

type ImageGalleryStickyProps = {
  images: string;
  containerRef: React.RefObject<HTMLElement>;
};

const ImageGallerySticky: React.FC<ImageGalleryStickyProps> = ({
  images,
  containerRef,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const imageArray = images ? images.split(",").map((img) => img.trim()) : [];

  // スクロール位置に基づくスタイルの計算
  useEffect(() => {
    if (!containerRef.current || !galleryRef.current) return;

    const handleScroll = () => {
      if (!containerRef.current || !galleryRef.current) return;

      // セクションとギャラリーの情報を取得
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top;
      const containerHeight = containerRect.height;

      const galleryRect = galleryRef.current.getBoundingClientRect();
      const galleryHeight = galleryRect.height;

      // コンテンツが画面の上端より上にスクロールされた場合のみ追従
      if (containerTop < 0) {
        // 追従可能な最大量を計算
        // 全体の高さからギャラリーの高さを引いた分だけ動かせる
        const maxOffset = containerHeight - galleryHeight;

        // スクロール量が最大量を超えないようにする
        const scrollOffset = Math.min(Math.abs(containerTop), maxOffset);

        // 負の値にならないようにする
        const offset = Math.max(0, scrollOffset);

        // 最大値がマイナスの場合はコンテナがギャラリーより小さいので追従しない
        if (maxOffset < 0) {
          galleryRef.current.style.transform = "translateY(0)";
        } else {
          galleryRef.current.style.transform = `translateY(${offset}px)`;
        }
      } else {
        // コンテナが画面の上端より下にある場合は固定位置
        galleryRef.current.style.transform = "translateY(0)";
      }
    };

    window.addEventListener("scroll", handleScroll);
    // 初期ロード時にも一度実行
    handleScroll();

    // ウィンドウサイズが変わったときにも再計算
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [containerRef]);

  const handleThumbnailHover = (index: number) => {
    setCurrentImageIndex(index);
  };

  // 画像がない場合はプレースホルダーを使用
  if (imageArray.length === 0) {
    return (
      <div
        ref={galleryRef}
        className="z-10 w-full md:w-[650px] mr-8 pb-4 md:h-full md:flex md:items-center md:overflow-visible overflow-y-auto"
      >
        <div className="flex flex-col md:flex-row gap-5 md:items-center md:justify-center">
          <div className="flex-shrink-0 w-auto md:w-[120px] flex md:flex-col gap-3 md:max-h-[520px] py-2 items-center justify-center">
          <div className="flex md:flex-col items-center justify-center gap-3 md:overflow-y-auto">
            <figure className="flex-shrink-0 w-[100px] h-[100px] rounded-full bg-zinc-300" />
            <figure className="flex-shrink-0 w-[100px] h-[100px] rounded-full bg-zinc-300" />
            <figure className="flex-shrink-0 w-[100px] h-[100px] rounded-full bg-zinc-300" />
          </div>
          </div>
          <div className="w-full md:flex-1 flex items-center justify-center">
            <figure className="w-[420px] h-[420px] md:w-[520px] md:h-[calc(100vh-180px)] max-h-[520px] bg-zinc-300 border border-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={galleryRef}
      className="z-10 w-full md:w-[650px] mr-8 pb-4 md:h-full md:flex md:items-center md:overflow-visible overflow-y-auto"
    >
      <div className="flex flex-col md:flex-row gap-5 md:items-center md:justify-center">
        <div className="flex-shrink-0 w-auto md:w-[120px] flex md:flex-col gap-3 md:max-h-[520px] py-2 items-center justify-center">
          <div className="flex md:flex-col items-center justify-center gap-3 md:overflow-y-auto">
          {imageArray.map((image, index) => (
            <ThumbnailImage
              key={index}
              image={image}
              isActive={currentImageIndex === index}
              onClick={() => setCurrentImageIndex(index)}
              onMouseEnter={() => handleThumbnailHover(index)}
            />
          ))}
          </div>
        </div>
        <div className="w-full md:flex-1 flex items-center justify-center">
          <div className="relative w-[420px] h-[420px] md:w-[520px] md:h-[calc(100vh-180px)] max-h-[520px] border border-gray-200 overflow-hidden bg-white">
            <img
              src={imageArray[currentImageIndex]}
              alt="アイテム画像"
              className="absolute w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallerySticky;
