import React, { useState } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Size } from "@prisma/client";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

// インポートを追加
import ImageGallery from "@/components/items/ImageGallery";
import ItemInfo from "@/components/items/ItemInfo";
import RestockNotification from "@/components/items/RestockNotification";
import CharacterSection from "@/components/items/CharacterSection";
import RelatedItems from "@/components/items/RelatedItems";

// 型定義
type ItemData = {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  images: string;
  hasSizes: boolean;
  gender: string | null;
  categoryId: string;
  characterId: string | null;
  character: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    characterSeries: {
      id: string;
      name: string;
    } | null;
  } | null;
  itemSizes: {
    id: string;
    size: Size;
    inventory: number;
  }[];
};

type ItemDetailPageProps = {
  item: ItemData | null;
  error?: string;
};

// Main ItemDetailPage Component
const ItemDetailPage: NextPage<ItemDetailPageProps> = ({ item, error }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="text-orange-500 hover:underline">
          ホームに戻る
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">アイテムが見つかりません</h1>
        <p className="text-gray-600 mb-6">
          お探しのアイテムは存在しないか、削除された可能性があります。
        </p>
        <Link href="/" className="text-orange-500 hover:underline">
          ホームに戻る
        </Link>
      </div>
    );
  }

  // カートに追加する関数
  const handleAddToCart = async (size: Size | null, quantity: number) => {
    // すでに処理中なら何もしない
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // セッション情報のデバッグ出力
      console.log("セッション情報:", session);
      
      // セッションがない場合はエラー
      if (!session?.user?.id) {
        throw new Error("ログインセッションが存在しません。再ログインしてください。");
      }

      // 在庫確認
      if (item.hasSizes && size) {
        const sizeItem = item.itemSizes.find((s) => s.size === size);
        if (!sizeItem || sizeItem.inventory < quantity) {
          toast.error("選択したサイズの在庫が不足しています");
          return;
        }
      } else if (!item.hasSizes && item.inventory < quantity) {
        toast.error("アイテムの在庫が不足しています");
        return;
      }

      // リクエストペイロードをデバッグ出力
      const payload = {
        userId: session.user.id,
        itemId: item.id,
        quantity,
        size: item.hasSizes ? size : null,
      };
      console.log("APIリクエスト内容:", payload);

      // カート追加APIを呼び出し
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // レスポンスのステータスコードとヘッダーをデバッグ出力
      console.log("APIレスポンス:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("APIエラーレスポンス:", data);
        throw new Error(data.message || `APIエラー: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("API成功レスポンス:", responseData);
      
      // 追加したアイテムの情報をログ出力
      console.log("カート追加結果:", {
        itemId: item.id,
        itemName: item.name,
        size,
        quantity,
        cartId: responseData.cart?.id
      });
    } catch (error) {
      console.error("カート追加エラーの詳細:", error);
      let errorMessage;
      
      if (error instanceof Error) {
        errorMessage = `エラー: ${error.message}`;
        // スタックトレースもログに記録（開発時のみ）
        if (process.env.NODE_ENV !== 'production') {
          console.error('エラースタック:', error.stack);
        }
      } else if (error instanceof Response) {
        errorMessage = `ネットワークエラー: ${error.status} ${error.statusText}`;
      } else {
        errorMessage = "予期せぬエラーが発生しました。ネットワーク接続を確認してください。";
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Head>
        <title>{item.name} | dumdumb</title>
        <meta name="description" content={item.description.substring(0, 160)} />
      </Head>

      <section className="flex relative gap-10 items-center px-8 pt-16 max-md:px-5">
        <ImageGallery images={item.images} />
        <ItemInfo item={item} onAddToCart={handleAddToCart} />
        <RestockNotification />
      </section>

      <CharacterSection character={item.character} />
      {/* 現在のアイテムIDを渡す */}
      <RelatedItems characterId={item.characterId} currentItemId={item.id} />
    </>
  );
};

// サーバーサイドでデータを取得
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  if (!id || typeof id !== "string") {
    return {
      props: {
        item: null,
        error: "アイテムIDが無効です",
      },
    };
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        character: {
          include: {
            characterSeries: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        itemSizes: true,
      },
    });

    if (!item) {
      return {
        props: {
          item: null,
          error: "アイテムが見つかりません",
        },
      };
    }

    // BigInt型をJSON化するために文字列に変換
    const serializedItem = JSON.parse(
      JSON.stringify(item, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return {
      props: {
        item: serializedItem,
      },
    };
  } catch (error) {
    console.error("Error fetching item:", error);
    return {
      props: {
        item: null,
        error: "データの取得中にエラーが発生しました",
      },
    };
  }
};

export default ItemDetailPage;