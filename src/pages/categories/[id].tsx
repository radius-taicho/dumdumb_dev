import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PrismaClient } from "@prisma/client";
import { FiHeart } from "react-icons/fi";

// 型定義
type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
  description: string;
  price: number;
  inventory: number;
  images: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
};

type CategoryPageProps = {
  category: Category | null;
  items: Item[];
  allCategories: Category[];
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};
  const prisma = new PrismaClient();

  try {
    // 全てのカテゴリーを取得
    const allCategories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        media: {
          select: {
            url: true
          }
        }
      }
    });

    // 選択されたカテゴリーと関連するアイテムを取得
    let category = null;
    let items: Item[] = [];

    if (id && typeof id === "string") {
      category = await prisma.category.findUnique({
        where: { id },
        include: {
          media: {
            select: {
              url: true
            }
          }
        }
      });

      if (category) {
        items = await prisma.item.findMany({
          where: { categoryId: id },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    // カテゴリーのアイテム数を追加
    const categoriesWithCounts = await Promise.all(
      allCategories.map(async (cat) => {
        const itemCount = await prisma.item.count({
          where: { categoryId: cat.id },
        });
        return {
          ...cat,
          itemCount,
        };
      })
    );

    return {
      props: {
        category: category ? JSON.parse(JSON.stringify(category)) : null,
        items: JSON.parse(JSON.stringify(items)),
        allCategories: JSON.parse(JSON.stringify(categoriesWithCounts)),
      },
    };
  } catch (error) {
    console.error("データ取得エラー:", error);
    return {
      props: {
        category: null,
        items: [],
        allCategories: [],
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};

const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  items,
  allCategories,
}) => {
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState("newest");

  // 並び替え処理
  const sortedItems = [...items].sort((a, b) => {
    switch (selectedSort) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "priceLow":
        return a.price - b.price;
      case "priceHigh":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // 画像URL処理（カンマ区切りの場合は最初の画像を使用）
  const getImageUrl = (images: string) => {
    if (!images) return "/images/placeholder.jpg";
    const imageArray = images.split(",");
    return imageArray[0].trim();
  };

  // カテゴリーの画像URLを取得
  const getCategoryImageUrl = (cat: Category) => {
    if (cat.media?.url) return cat.media.url;
    if (cat.image) return cat.image;
    return null;
  };

  if (!category && router.query.id !== "all") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-6">カテゴリーが見つかりません</h1>
        <p className="mb-8">
          お探しのカテゴリーは存在しないか、削除された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-black text-white rounded-md"
        >
          トップページに戻る
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {category
            ? `${category.name} | dumdumb`
            : "すべてのアイテム | dumdumb"}
        </title>
        <meta
          name="description"
          content={
            category
              ? `${category.name}のアイテム一覧 - dumdumbでカワイイを身につけよう`
              : "すべてのアイテム一覧 - dumdumbでカワイイを身につけよう"
          }
        />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* パンくずリスト */}
        <div className="mb-8">
          <ul className="flex text-sm text-gray-500">
            <li className="after:content-['>'] after:mx-2">
              <Link href="/" className="hover:text-black">
                ホーム
              </Link>
            </li>
            <li>
              <span className="text-black">
                {category ? category.name : "すべてのアイテム"}
              </span>
            </li>
          </ul>
        </div>

        {/* カテゴリータイトル */}
        <div className="flex items-center mb-6">
          {category && getCategoryImageUrl(category) && (
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
              <img 
                src={getCategoryImageUrl(category)} 
                alt={category.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold">
            {category ? category.name : "すべてのアイテム"}
          </h1>
        </div>

        {/* カテゴリーナビゲーション */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            <Link
              href="/categories/all"
              className={`whitespace-nowrap px-4 py-2 rounded-full ${
                router.query.id === "all"
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              すべてのアイテム
            </Link>
            {allCategories.map((cat) => {
              const categoryImage = getCategoryImageUrl(cat);
              
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className={`whitespace-nowrap px-4 py-2 rounded-full ${
                    router.query.id === cat.id
                      ? "bg-black text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  } flex items-center`}
                >
                  {categoryImage && (
                    <span className="w-6 h-6 rounded-full overflow-hidden mr-2">
                      <img 
                        src={categoryImage} 
                        alt={cat.name} 
                        className="w-full h-full object-cover"
                      />
                    </span>
                  )}
                  {cat.name} ({cat.itemCount})
                </Link>
              );
            })}
          </div>
        </div>

        {/* 並び替えとフィルター */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{sortedItems.length}件のアイテム</p>
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-sm text-gray-600">
              並び替え:
            </label>
            <select
              id="sort"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="p-2 border rounded-md text-sm"
            >
              <option value="newest">新着順</option>
              <option value="oldest">古い順</option>
              <option value="priceLow">価格の安い順</option>
              <option value="priceHigh">価格の高い順</option>
            </select>
          </div>
        </div>

        {/* アイテムリスト */}
        {sortedItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 mb-4">アイテムがありません</p>
            <Link href="/" className="text-primary-600 hover:underline">
              トップページに戻る
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {sortedItems.map((item) => (
              <div key={item.id} className="group">
                <Link href={`/items/${item.id}`} className="block">
                  <div className="aspect-square bg-gray-100 mb-3 relative overflow-hidden">
                    {/* 画像表示 */}
                    <img
                      src={getImageUrl(item.images)}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="お気に入りに追加"
                      onClick={(e) => {
                        e.preventDefault();
                        // お気に入り機能実装予定
                      }}
                    >
                      <FiHeart className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-medium mb-1">{item.name}</h3>
                  <p className="text-base font-bold">
                    ¥{item.price.toLocaleString()}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;