import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "@/components/ui/carousel";
import { FiChevronRight } from "react-icons/fi";
import React from "react";

export default function MainVisualSlider(): JSX.Element {
  // スライド用画像データ
  const slides = [
    {
      id: 1,
      imageUrl: "/images/slide1.jpg", // 実際の画像パスに置き換えてください
      alt: "スライド1",
    },
    {
      id: 2,
      imageUrl: "/images/slide2.jpg", // 実際の画像パスに置き換えてください
      alt: "スライド2",
    },
    {
      id: 3,
      imageUrl: "/images/slide3.jpg", // 実際の画像パスに置き換えてください
      alt: "スライド3",
    },
  ];

  return (
    <div className="relative h-[608px] bg-white overflow-hidden">
      <Carousel className="w-full h-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id}>
              <div className="h-[560px] bg-white">
                {/* 画像全体を表示するコンテナ */}
                <div className="w-full h-full overflow-hidden">
                  {/* 実際の画像パスを使用する場合 */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 画像がない場合のプレースホルダー (開発用) */}
                  {/*
                  <div className={`w-full h-full bg-gray-${500 + (index * 100)} flex items-center justify-center`}>
                    <span className="text-white text-2xl">画像 {index + 1}</span>
                  </div>
                  */}
                </div>
                
                {/* ページネーションドット */}
                <div className="absolute bottom-0 w-full h-12 bg-white flex items-center justify-center">
                  <div className="flex gap-[10px]">
                    {slides.map((dot, dotIndex) => (
                      <div
                        key={dot.id}
                        className={`w-4 h-4 rounded-lg ${
                          dotIndex === index ? "bg-[#595959]" : "bg-[#d9d9d9]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* ナビゲーションボタン */}
        <CarouselNext className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-[#d9d9d9] opacity-70 z-10 flex items-center justify-center">
          <FiChevronRight className="h-4 w-4" />
        </CarouselNext>
      </Carousel>
    </div>
  );
}
