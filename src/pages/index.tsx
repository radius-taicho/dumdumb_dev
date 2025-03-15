import React, { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import MainVisualSlider from "@/components/MainVisualSlider";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 仮のアイテムデータ
const dummyItems = [
  { id: "1", name: "アイテム名", price: 4500, image: "/images/dummy1.jpg" },
  { id: "2", name: "アイテム名", price: 4500, image: "/images/dummy2.jpg" },
  { id: "3", name: "アイテム名", price: 4500, image: "/images/dummy3.jpg" },
  { id: "4", name: "アイテム名", price: 4500, image: "/images/dummy4.jpg" },
  { id: "5", name: "アイテム名", price: 4500, image: "/images/dummy5.jpg" },
  { id: "6", name: "アイテム名", price: 4500, image: "/images/dummy6.jpg" },
];

// 仮のキャラクターシリーズデータ (8枚分用意)
const dummySeries = [
  { id: "1", name: "シリーズ1", image: "/images/series1.jpg" },
  { id: "2", name: "シリーズ2", image: "/images/series2.jpg" },
  { id: "3", name: "シリーズ3", image: "/images/series3.jpg" },
  { id: "4", name: "シリーズ4", image: "/images/series4.jpg" },
  { id: "5", name: "シリーズ5", image: "/images/series5.jpg" },
  { id: "6", name: "シリーズ6", image: "/images/series6.jpg" },
  { id: "7", name: "シリーズ7", image: "/images/series7.jpg" },
  { id: "8", name: "シリーズ8", image: "/images/series8.jpg" },
];

// 4枚ずつのグループに分ける
const seriesGroups = [];
for (let i = 0; i < dummySeries.length; i += 4) {
  seriesGroups.push(dummySeries.slice(i, i + 4));
}

// アイテムカテゴリー
const categories = [
  { id: "all", name: "すべてのアイテム" },
  { id: "tshirt", name: "Tシャツ" },
  { id: "hoodie", name: "パーカー" },
  { id: "bag", name: "バッグ" },
  { id: "cap", name: "帽子" },
  { id: "handkerchief", name: "ハンカチ" },
  { id: "keychain", name: "キーホルダー" },
  { id: "other", name: "その他" },
];

// サイト情報データ
const siteInfoData = [
  [
    {
      title: "このサイトについて",
      description: "コンセプト説明",
      subDescription: "サイト説明",
      imageAlt: "About this site",
    },
    {
      title: "関連サイト",
      description: "link",
      subDescription: "サイト説明",
      imageAlt: "Related site",
    },
  ],
  [
    {
      title: "関連サイト",
      description: "link",
      subDescription: "サイト説明",
      imageAlt: "Related site",
    },
    {
      title: "関連サイト",
      description: "link",
      subDescription: "サイト説明",
      imageAlt: "Related site",
    },
  ],
];

const HomePage: NextPage = () => {
  const [activeInfoIndex, setActiveInfoIndex] = useState(0);

  // サイト情報カルーセルの切り替え処理
  const handleInfoCarouselChange = (index: number) => {
    setActiveInfoIndex(index);
  };

  return (
    <>
      <Head>
        <title>dumdumb</title>
        <meta name="description" content="dumdumbでカワイイを身につけよう" />
      </Head>

      {/* メインビジュアルスライダー */}
      <MainVisualSlider />

      {/* アイテムカテゴリー */}
      <div className="container mx-auto px-8">
        <h2 className="text-xl font-bold mb-6">アイテムカテゴリー</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-gray-300 rounded-full flex items-center justify-center mb-2">
                {/* カテゴリーアイコンが入ります */}
              </div>
              <span className="text-xs text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* すべてのアイテム */}
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-xl font-bold mb-6">すべてのアイテム</h2>

        {/* タブナビゲーション */}
        <div className="border-b mb-6">
          <div className="flex">
            <button className="px-6 py-2 font-bold border-b-2 border-black">
              ALL
            </button>
            <button className="px-6 py-2 text-gray-500">MEN</button>
            <button className="px-6 py-2 text-gray-500">WOMEN</button>
            <button className="px-6 py-2 text-gray-500">KIDS</button>
          </div>
        </div>

        {/* ソートとフィルター */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
              新着順
            </button>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
              フィルター
            </button>
          </div>
        </div>

        {/* アイテムグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {dummyItems.map((item) => (
            <div key={item.id} className="relative">
              <Link href={`/items/${item.id}`}>
                <div className="h-[420px] bg-gray-500 mb-2 relative">
                  {/* 実際はここに適切な画像が入ります */}
                  <button className="absolute top-2 right-2 text-white">
                    <FiHeart size={24} />
                  </button>
                </div>
                <h3 className="text-base">{item.name}</h3>
                <p className="text-base">{item.price.toLocaleString()}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* キャラクターイメージ(上部) */}
      <div className="flex justify-end w-full h-[160px] px-20 mb-4">
        <div className="w-20 h-20 md:w-40 md:h-40 border-2 border-gray-300 rounded-full flex items-center justify-center"></div>
      </div>

      {/* キャラクターシリーズ */}
      <div className="container mx-auto mb-12">
        <div className="px-4">
          <h2 className="text-xl font-bold mb-6">キャラクターシリーズ</h2>

          <div className="relative px-4 md:px-8">
            <Carousel className="w-full">
              <CarouselContent>
                {seriesGroups.map((group, groupIndex) => (
                  <CarouselItem key={`group-${groupIndex}`} className="w-full">
                    <div className="flex justify-between gap-4">
                      {group.map((series) => (
                        <Link
                          key={series.id}
                          href={`/character-series/${series.id}`}
                          className="w-1/4"
                        >
                          <div className="aspect-[1/1.414] border-2 border-black flex items-center justify-center">
                            {/* 画像が入る場所 */}
                            <div className="text-center text-gray-500">
                              {series.name}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 border-none shadow-none bg-transparent text-black">
                <div className="absolute -left-2">
                  <ChevronLeft className="w-10 h-10" />
                </div>
              </CarouselPrevious>

              <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 border-none shadow-none bg-transparent text-black">
                <div className="absolute -right-2">
                  <ChevronRight className="w-10 h-10" />
                </div>
              </CarouselNext>
            </Carousel>
          </div>
        </div>
      </div>

      {/* このサイトについて＆関連サイト */}
      <div className="container mx-auto mb-20">
        <Carousel
          className="relative w-full"
          onSelect={handleInfoCarouselChange}
        >
          <CarouselContent>
            {siteInfoData.map((slide, slideIndex) => (
              <CarouselItem key={slideIndex} className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                  {slide.map((item, itemIndex) => (
                    <div key={itemIndex} className="mb-6">
                      <h2 className="text-xl font-bold mb-4">{item.title}</h2>
                      <div className="flex items-center mb-2">
                        <div
                          className="w-12 h-12 bg-gray-300 rounded-full mr-3"
                          aria-label={item.imageAlt}
                        ></div>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-600">
                            {item.subDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-700 text-white">
            <ChevronRight className="h-5 w-5" />
          </CarouselNext>
        </Carousel>

        {/* ナビゲーションドット */}
        <div className="flex justify-center space-x-2 mt-6">
          {siteInfoData.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === activeInfoIndex ? "bg-black" : "bg-gray-300"
              }`}
              onClick={() => handleInfoCarouselChange(index)}
              aria-label={`スライド ${index + 1} へ移動`}
            />
          ))}
        </div>
      </div>
      {/* キャラクターイメージ(下部) */}
      <div className="flex justify-end w-full h-[160px] px-20 mb-4">
        <div className="w-20 h-20 md:w-40 md:h-40 border-2 border-gray-300 rounded-full flex items-center justify-center"></div>
      </div>
    </>
  );
};

export default HomePage;
