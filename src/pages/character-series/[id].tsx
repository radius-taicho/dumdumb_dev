import React, { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { FiHeart, FiBell } from "react-icons/fi";
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

const CharacterSeriesPage: NextPage = () => {
  // タブの状態管理
  const [activeTab, setActiveTab] = useState("all");

  return (
    <>
      <Head>
        <title>シリーズタイトル | DumDumb</title>
        <meta
          name="description"
          content="DumDumbで扱っているキャラクターシリーズの詳細"
        />
      </Head>

      {/* シリーズ情報ヘッダー */}
      <div className="w-full flex flex-col">
        <div className=" container mx-auto flex py-12 md:flex-row w-full">
          {/* 左側：メイン画像 */}
          <div className="w-full md:w-1/2 bg-gray-200 h-56 md:h-[400px]">
            {/* シリーズメイン画像 */}
          </div>

          {/* 右側：サブ画像 */}
          <div className="w-full md:w-1/2 border border-gray-300 h-56 md:h-[400px]">
            {/* シリーズサブ画像・動画など */}
          </div>
        </div>
        {/* シリーズ情報 */}
        <div className="w-full bg-gray-100">
          <div className="container mx-auto  py-4 px-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">シリーズタイトル</h1>
              <p className="text-sm">シリーズ説明</p>
              <p className="text-sm">シリーズ説明</p>
            </div>
            <div className="flex items-center">
              <button className="flex items-center">
                <FiBell className="h-5 w-5" />
              </button>
              <span className="text-xs">
                このシリーズの新着アイテムの通知を受け取る
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* シリーズアイテムセクション */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          シリーズアイテム
        </h2>

        {/* タブナビゲーション */}
        <div className="border-b mb-6">
          <div className="flex justify-center">
            <button
              className={`px-6 py-2 ${
                activeTab === "all" ? "font-bold border-b-2 border-black" : ""
              }`}
              onClick={() => setActiveTab("all")}
            >
              ALL
            </button>
            <button
              className={`px-6 py-2 ${
                activeTab === "men" ? "font-bold border-b-2 border-black" : ""
              }`}
              onClick={() => setActiveTab("men")}
            >
              MEN
            </button>
            <button
              className={`px-6 py-2 ${
                activeTab === "women" ? "font-bold border-b-2 border-black" : ""
              }`}
              onClick={() => setActiveTab("women")}
            >
              WOMEN
            </button>
            <button
              className={`px-6 py-2 ${
                activeTab === "kids" ? "font-bold border-b-2 border-black" : ""
              }`}
              onClick={() => setActiveTab("kids")}
            >
              KIDS
            </button>
          </div>
        </div>

        {/* ソートとフィルター */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center">
            <button className="ml-2 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full flex items-center">
              <span>新着順</span>
              <span className="ml-1">🔍</span>
            </button>
          </div>
        </div>

        {/* アイテムグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {dummyItems.map((item) => (
            <div key={item.id} className="relative">
              <Link href={`/items/${item.id}`}>
                <div className="h-60 bg-gray-500 mb-2 relative">
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

        {/* スクロールボタン */}
        <div className="fixed bottom-20 right-8">
          <button className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white">
            {/* スクロールアイコン */}
          </button>
        </div>
      </div>

      {/* キャラクターイメージ（上部） */}
      <div className="flex justify-end w-full h-[160px] px-20 mb-4">
        <div className="w-20 h-20 md:w-40 md:h-40 border-2 border-gray-300 rounded-full flex items-center justify-center"></div>
      </div>

      {/* キャラクターシリーズ */}
      <div className="container mx-auto mb-12">
        <div className="px-4">
          <h2 className="text-xl font-bold mb-6">他のキャラクターシリーズ</h2>

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

      {/* キャラクターイメージ（下部） */}
      <div className="flex justify-end w-full h-[160px] px-20 mb-4">
        <div className="w-20 h-20 md:w-40 md:h-40 border-2 border-gray-300 rounded-full flex items-center justify-center"></div>
      </div>
    </>
  );
};

export default CharacterSeriesPage;
