import React, { useState, useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import MainVisualSlider from "@/components/MainVisualSlider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PrismaClient } from "@prisma/client";

// 型定義
type Category = {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  itemCount: number;
  image?: string | null;
  mediaId?: string | null;
  media?: {
    url: string;
  } | null;
};

type Item = {
  id: string;
  name: string;
  price: number;
  images: string;
  categoryId: string;
  // 性別属性を追加（実際のデータベースにこのフィールドがない場合は対応が必要）
  gender?: "MEN" | "WOMEN" | "KIDS" | null;
};

type Gender = "ALL" | "MEN" | "WOMEN" | "KIDS";

type HomePageProps = {
  categories: Category[];
  items: Item[];
};

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

// サーバーサイドでデータを取得
export const getServerSideProps: GetServerSideProps = async () => {
  const prisma = new PrismaClient();

  try {
    // カテゴリーの取得（表示状態がtrueかつ表示順でソート）
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        media: {
          select: {
            url: true
          }
        }
      }
    });

    // 各カテゴリーのアイテム数を取得
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const itemCount = await prisma.item.count({
          where: { categoryId: category.id },
        });
        return {
          ...category,
          itemCount,
        };
      })
    );

    // 全アイテムの取得
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      props: {
        categories: JSON.parse(JSON.stringify(categoriesWithCounts)),
        items: JSON.parse(JSON.stringify(items)),
      },
    };
  } catch (error) {
    console.error("データ取得エラー:", error);
    return {
      props: {
        categories: [],
        items: [],
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};

const HomePage: NextPage<HomePageProps> = ({ categories, items }) => {
  const { data: session, status } = useSession();
  const [activeInfoIndex, setActiveInfoIndex] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedGender, setSelectedGender] = useState<Gender>("ALL");
  const [filteredItems, setFilteredItems] = useState<Item[]>(items);
  const [sortOrder, setSortOrder] = useState<
    "newest" | "priceHigh" | "priceLow"
  >("newest");
  
  // お気に入り状態を管理するステート
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loadingFavorites, setLoadingFavorites] = useState<Record<string, boolean>>({});

  // カテゴリーと性別でアイテムをフィルタリング
  useEffect(() => {
    let result = [...items];

    // カテゴリーでフィルタリング
    if (selectedCategoryId) {
      result = result.filter((item) => item.categoryId === selectedCategoryId);
    }

    // 性別でフィルタリング
    if (selectedGender !== "ALL") {
      result = result.filter((item) => item.gender === selectedGender);
    }

    // 並び順で並び替え
    switch (sortOrder) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );
        break;
      case "priceHigh":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "priceLow":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
    }

    setFilteredItems(result);
  }, [items, selectedCategoryId, selectedGender, sortOrder]);

  // サイト情報カルーセルの切り替え処理
  const handleInfoCarouselChange = (index: number) => {
    setActiveInfoIndex(index);
  };

  // カテゴリー選択処理
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  // 性別選択処理
  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
  };

  // 並び替え処理
  const handleSortChange = (order: "newest" | "priceHigh" | "priceLow") => {
    setSortOrder(order);
  };

  // 画像URL処理（カンマ区切りの場合は最初の画像を使用）
  const getImageUrl = (images: string) => {
    if (!images) return "/images/placeholder.jpg";
    const imageArray = images.split(",");
    return imageArray[0].trim();
  };

  // カテゴリーの画像URLを取得
  const getCategoryImageUrl = (category: Category) => {
    if (category.media?.url) return category.media.url;
    if (category.image) return category.image;
    return null;
  };

  // お気に入り状態の取得
  useEffect(() => {
    // ユーザーがログインしている場合のみお気に入り状態を取得
    if (status === 'authenticated' && session?.user) {
      // すべてのアイテムのお気に入り状態をリセット
      const initialFavorites: Record<string, boolean> = {};
      
      // 各アイテムのお気に入り状態を取得
      const fetchFavoritesStatus = async () => {
        try {
          for (const item of items) {
            const response = await fetch(`/api/favorites/check?itemId=${item.id}`);
            if (response.ok) {
              const data = await response.json();
              initialFavorites[item.id] = data.isFavorite;
            }
          }
          
          setFavorites(initialFavorites);
        } catch (error) {
          console.error('Error fetching favorites status:', error);
        }
      };
      
      fetchFavoritesStatus();
    }
  }, [status, session, items]);
  
  // お気に入りボタンクリックハンドラー
  const handleFavoriteClick = async (itemId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // ログインしていない場合は、ログインを促す
    if (status !== 'authenticated' || !session?.user) {
      toast.error('お気に入り機能を使用するにはログインが必要です');
      return;
    }
    
    // すでに処理中なら何もしない
    if (loadingFavorites[itemId]) return;
    
    // 処理中フラグを設定
    setLoadingFavorites(prev => ({ ...prev, [itemId]: true }));
    
    try {
      if (favorites[itemId]) {
        // お気に入りから削除
        const response = await fetch('/api/favorites/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId }),
        });
        
        if (response.ok) {
          setFavorites(prev => ({ ...prev, [itemId]: false }));
          toast.success('お気に入りから削除しました');
        } else {
          toast.error('お気に入りの削除に失敗しました');
        }
      } else {
        // お気に入りに追加
        const response = await fetch('/api/favorites/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId }),
        });
        
        if (response.ok) {
          setFavorites(prev => ({ ...prev, [itemId]: true }));
          toast.success('お気に入りに追加しました');
        } else {
          toast.error('お気に入りの追加に失敗しました');
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      toast.error('お気に入りの操作中にエラーが発生しました');
    } finally {
      // 処理中フラグを解除
      setLoadingFavorites(prev => ({ ...prev, [itemId]: false }));
    }
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
      <div className="container mx-auto px-8 mb-16">
        <h2 className="text-xl font-bold mb-6">アイテムカテゴリー</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`flex flex-col items-center ${
              selectedCategoryId === null
                ? "opacity-100"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <div
              className={`w-16 h-16 md:w-20 md:h-20 border-2 ${
                selectedCategoryId === null ? "border-black" : "border-gray-300"
              } rounded-full flex items-center justify-center mb-2 transition-colors`}
            >
              <span className="text-lg font-bold">All</span>
            </div>
            <span className="text-xs text-center">すべてのアイテム</span>
          </button>

          {categories.map((category) => {
            const categoryImageUrl = getCategoryImageUrl(category);
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`flex flex-col items-center ${
                  selectedCategoryId === category.id
                    ? "opacity-100"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 border-2 ${
                    selectedCategoryId === category.id
                      ? "border-black"
                      : "border-gray-300"
                  } rounded-full flex items-center justify-center mb-2 transition-colors overflow-hidden`}
                >
                  {categoryImageUrl ? (
                    <img 
                      src={categoryImageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold">
                      {category.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-center">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* すべてのアイテム */}
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-xl font-bold mb-6">
          {selectedCategoryId
            ? categories.find((c) => c.id === selectedCategoryId)?.name
            : "すべてのアイテム"}
        </h2>

        {/* タブナビゲーション */}
        <div className="border-b mb-6">
          <div className="flex">
            <button
              className={`px-6 py-2 ${
                selectedGender === "ALL"
                  ? "font-bold border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => handleGenderSelect("ALL")}
            >
              ALL
            </button>
            <button
              className={`px-6 py-2 ${
                selectedGender === "MEN"
                  ? "font-bold border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => handleGenderSelect("MEN")}
            >
              MEN
            </button>
            <button
              className={`px-6 py-2 ${
                selectedGender === "WOMEN"
                  ? "font-bold border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => handleGenderSelect("WOMEN")}
            >
              WOMEN
            </button>
            <button
              className={`px-6 py-2 ${
                selectedGender === "KIDS"
                  ? "font-bold border-b-2 border-black"
                  : "text-gray-500"
              }`}
              onClick={() => handleGenderSelect("KIDS")}
            >
              KIDS
            </button>
          </div>
        </div>

        {/* ソートとフィルター */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 ${
                sortOrder === "newest"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700"
              } text-sm rounded-full`}
              onClick={() => handleSortChange("newest")}
            >
              新着順
            </button>
            <button
              className={`px-3 py-1 ${
                sortOrder === "priceHigh"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700"
              } text-sm rounded-full`}
              onClick={() => handleSortChange("priceHigh")}
            >
              価格高い順
            </button>
            <button
              className={`px-3 py-1 ${
                sortOrder === "priceLow"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700"
              } text-sm rounded-full`}
              onClick={() => handleSortChange("priceLow")}
            >
              価格安い順
            </button>
          </div>
        </div>

        {/* アイテムグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="relative group">
                <Link href={`/items/${item.id}`}>
                  <div className="h-[320px] bg-gray-100 mb-2 relative overflow-hidden">
                    {/* アイテム画像 */}
                    <img
                      src={getImageUrl(item.images)}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      onClick={(e) => handleFavoriteClick(item.id, e)}
                      className="absolute top-2 right-2 text-white p-2 bg-white bg-opacity-80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {loadingFavorites[item.id] ? (
                        <span className="block w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></span>
                      ) : favorites[item.id] ? (
                        <FaHeart size={20} className="text-red-500" />
                      ) : (
                        <FiHeart size={20} className="text-gray-800" />
                      )}
                    </button>
                  </div>
                  <h3 className="text-base">{item.name}</h3>
                  <p className="text-base font-medium">
                    ¥{Number(item.price).toLocaleString()}
                  </p>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-16 text-center">
              <p className="text-gray-500 mb-4">該当するアイテムがありません</p>
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSelectedGender("ALL");
                }}
                className="text-primary-600 hover:underline"
              >
                すべてのアイテムを表示する
              </button>
            </div>
          )}
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