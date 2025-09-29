import React, { useState, useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useSession, signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { PrismaClient } from "@prisma/client";
import { useAnonymousSession } from "@/contexts/anonymous-session";

// コンポーネントのインポート
import MainVisualSlider from "@/components/home/MainVisualSlider";
import CategorySection from "@/components/home/CategorySection";
import ItemsSection from "@/components/home/ItemsSection";
import CharacterSeriesSection from "@/components/home/CharacterSeriesSection";
import SiteInfoSection from "@/components/home/SiteInfoSection";

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
  gender?: "MEN" | "WOMEN" | "KIDS" | null;
  createdAt?: string;
};

type Gender = "ALL" | "MEN" | "WOMEN" | "KIDS";

// キャラクターシリーズの型定義
type CharacterSeries = {
  id: string;
  name: string;
  image?: string | null;
  media?: {
    url: string;
  } | null;
  subMediaId?: string | null;
  subMedia?: {
    url: string;
  } | null;
  isActive: boolean;
  displayOrder: number;
};

// HomePagePropsにキャラクターシリーズを追加
type HomePageProps = {
  categories: Category[];
  items: Item[];
  characterSeries: CharacterSeries[];
};

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
            url: true,
          },
        },
      },
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

    // キャラクターシリーズの取得（表示状態がtrueかつ表示順でソート）
    const characterSeries = await prisma.characterSeries.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        media: {
          select: {
            url: true,
          },
        },
        subMedia: {
          select: {
            url: true,
          },
        },
      },
    });

    return {
      props: {
        categories: JSON.parse(JSON.stringify(categoriesWithCounts)),
        items: JSON.parse(JSON.stringify(items)),
        characterSeries: JSON.parse(JSON.stringify(characterSeries)),
      },
    };
  } catch (error) {
    console.error("データ取得エラー:", error);
    return {
      props: {
        categories: [],
        items: [],
        characterSeries: [],
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};

const HomePage: NextPage<HomePageProps> = ({
  categories,
  items,
  characterSeries,
}) => {
  const { data: session, status } = useSession();
  const { anonymousSessionToken, updateFavoritesCount } = useAnonymousSession();
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
  const [loadingFavorites, setLoadingFavorites] = useState<
    Record<string, boolean>
  >({});

  // カテゴリーと性別でアイテムをフィルタリング
  useEffect(() => {
    let result = [...items];

    // カテゴリーでフィルタリング
    if (selectedCategoryId) {
      result = result.filter((item) => item.categoryId === selectedCategoryId);
    }

    // 性別でフィルタリング
    if (selectedGender !== "ALL") {
      result = result.filter((item) => {
        // UNISEXアイテムはMENとWOMENの両方に表示
        if (
          (item.gender === "UNISEX" || item.gender === null) &&
          (selectedGender === "MEN" || selectedGender === "WOMEN")
        ) {
          return true;
        }
        // 通常のフィルタリング
        return item.gender === selectedGender;
      });
    }

    // 並び順で並び替え
    switch (sortOrder) {
      case "newest":
        // @ts-ignore - createdAtが存在しない可能性を無視
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

  // お気に入り状態の取得
  useEffect(() => {
    // すべてのアイテムのお気に入り状態をリセット
    const initialFavorites: Record<string, boolean> = {};

    const fetchFavoritesStatus = async () => {
      try {
        // 認証状態に応じて、異なるAPIを呼び出す
        if (status === "authenticated" && session?.user) {
          // ログイン状態の場合
          for (const item of items) {
            const response = await fetch(
              `/api/favorites/check?itemId=${item.id}`
            );
            if (response.ok) {
              const data = await response.json();
              initialFavorites[item.id] = data.isFavorite;
            }
          }
        } else if (anonymousSessionToken) {
          // 匿名セッションを使用している場合
          for (const item of items) {
            const response = await fetch(
              `/api/favorites/anonymous-check?token=${anonymousSessionToken}&itemId=${item.id}`
            );
            if (response.ok) {
              const data = await response.json();
              initialFavorites[item.id] = data.isFavorite;
            }
          }
        }

        setFavorites(initialFavorites);
      } catch (error) {
        console.error("Error fetching favorites status:", error);
      }
    };

    fetchFavoritesStatus();
  }, [status, session, items, anonymousSessionToken]);

  // お気に入りボタンクリックハンドラー
  const handleFavoriteClick = async (
    itemId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // すでに処理中なら何もしない
    if (loadingFavorites[itemId]) return;

    // 処理中フラグを設定
    setLoadingFavorites((prev) => ({ ...prev, [itemId]: true }));

    try {
      // 認証状態チェック
      if (status === "authenticated" && session?.user) {
        // ログイン済みの場合
        await handleAuthenticatedFavorites(itemId);
      } else if (anonymousSessionToken) {
        // 匿名セッションを使用している場合
        await handleAnonymousFavorites(itemId);
      } else {
        // ログインも匿名セッションもない場合はログインを促す
        toast.error("お気に入り機能を使用するにはログインが必要です");
        
        // 現在のページに戻るように指定してログインページに遷移
        signIn(undefined, { callbackUrl: window.location.pathname });
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
      toast.error("お気に入りの操作中にエラーが発生しました");
    } finally {
      // 処理中フラグを解除
      setLoadingFavorites((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // ログインしている場合のお気に入り処理
  const handleAuthenticatedFavorites = async (itemId: string) => {
    if (favorites[itemId]) {
      // お気に入りから削除
      const response = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        setFavorites((prev) => ({ ...prev, [itemId]: false }));
        toast.success("お気に入りから削除しました");
        // お気に入り数更新が必要な場合はここに追加
      } else {
        toast.error("お気に入りの削除に失敗しました");
      }
    } else {
      // お気に入りに追加
      const response = await fetch("/api/favorites/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        setFavorites((prev) => ({ ...prev, [itemId]: true }));
        toast.success("お気に入りに追加しました");
        // お気に入り数更新が必要な場合はここに追加
      } else {
        toast.error("お気に入りの追加に失敗しました");
      }
    }
  };

  // 匿名セッションを使用している場合のお気に入り処理
  const handleAnonymousFavorites = async (itemId: string) => {
    if (favorites[itemId]) {
      // お気に入りから削除
      const response = await fetch("/api/favorites/anonymous-remove", {
        method: "DELETE", // 匿名お気に入りAPIはDELETEメソッドを使用
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anonymousSessionToken,
          itemId,
        }),
      });

      if (response.ok) {
        setFavorites((prev) => ({ ...prev, [itemId]: false }));
        toast.success("お気に入りから削除しました");
        // ヘッダーなどのお気に入り数を更新
        updateFavoritesCount(Object.values(favorites).filter(Boolean).length - 1);
      } else {
        toast.error("お気に入りの削除に失敗しました");
      }
    } else {
      // お気に入りに追加
      const response = await fetch("/api/favorites/anonymous-add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anonymousSessionToken,
          itemId,
        }),
      });

      if (response.ok) {
        setFavorites((prev) => ({ ...prev, [itemId]: true }));
        toast.success("お気に入りに追加しました");
        // ヘッダーなどのお気に入り数を更新
        updateFavoritesCount(Object.values(favorites).filter(Boolean).length + 1);
      } else {
        toast.error("お気に入りの追加に失敗しました");
      }
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
      <CategorySection
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        handleCategorySelect={handleCategorySelect}
      />

      {/* すべてのアイテム */}
      <ItemsSection
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        filteredItems={filteredItems}
        selectedGender={selectedGender}
        sortOrder={sortOrder}
        handleGenderSelect={handleGenderSelect}
        handleSortChange={handleSortChange}
        favorites={favorites}
        loadingFavorites={loadingFavorites}
        handleFavoriteClick={handleFavoriteClick}
      />

      {/* キャラクターイメージ(上部) */}
      <div className="flex justify-end w-full h-[160px] px-20 mb-4">
        <div className="w-20 h-20 md:w-40 md:h-40 border-2 border-gray-300 rounded-full flex items-center justify-center"></div>
      </div>

      {/* キャラクターシリーズ */}
      <CharacterSeriesSection characterSeries={characterSeries} />

      {/* このサイトについて＆関連サイト */}
      <SiteInfoSection />

      {/* キャラクターイメージ(下部) */}
      <div className="flex justify-end w-full h-[160px] px-20 mb-4">
        <div className="w-20 h-20 md:w-40 md:h-40 border-2 border-gray-300 rounded-full flex items-center justify-center"></div>
      </div>
    </>
  );
};

export default HomePage;
