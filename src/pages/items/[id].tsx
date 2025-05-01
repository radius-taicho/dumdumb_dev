import React, { useState, useRef, useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { prisma } from "@/lib/prisma-client";
import { Size } from "@prisma/client";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useAnonymousSession } from "@/contexts/anonymous-session";
import { recordItemView } from "@/lib/recordItemView";

// インポートを追加
import ImageGallerySticky from "@/components/items/ImageGallerySticky";
import ItemInfo from "@/components/items/ItemInfo";
import RestockNotification from "@/components/items/RestockNotification";
import CharacterSection from "@/components/items/CharacterSection";
import RelatedItems from "@/components/items/RelatedItems";
import ViewedTogetherItems from "@/components/items/ViewedTogetherItems";

// 型定義
type CharacterData = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  characterSeries: {
    id: string;
    name: string;
  } | null;
};

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
  characters: CharacterData[]; // 変更: characterId, character -> characters（複数）
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
  const { anonymousSessionToken } = useAnonymousSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const productSectionRef = useRef<HTMLElement>(null);

  // アイテム詳細ページにアクセスしたときに視聴履歴を記録
  useEffect(() => {
    // 有効なアイテムがある場合のみ記録
    if (item && item.id) {
      recordItemView(item.id, anonymousSessionToken);
    }
  }, [item, anonymousSessionToken]);

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
        throw new Error(
          "ログインセッションが存在しません。再ログインしてください。"
        );
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
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("APIエラーレスポンス:", data);
        throw new Error(
          data.message || `APIエラー: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.json();
      console.log("API成功レスポンス:", responseData);

      // 追加したアイテムの情報をログ出力
      console.log("カート追加結果:", {
        itemId: item.id,
        itemName: item.name,
        size,
        quantity,
        cartId: responseData.cart?.id,
      });
    } catch (error) {
      console.error("カート追加エラーの詳細:", error);
      let errorMessage;

      if (error instanceof Error) {
        errorMessage = `エラー: ${error.message}`;
        // スタックトレースもログに記録（開発時のみ）
        if (process.env.NODE_ENV !== "production") {
          console.error("エラースタック:", error.stack);
        }
      } else if (error instanceof Response) {
        errorMessage = `ネットワークエラー: ${error.status} ${error.statusText}`;
      } else {
        errorMessage =
          "予期せぬエラーが発生しました。ネットワーク接続を確認してください。";
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // 最初のキャラクターか、すべてのキャラクターIDを連結したものを表示
  const characterIdForRelated = item.characters.length > 0 ? item.characters[0].id : null;

  return (
    <>
      <Head>
        <title>{item.name} | dumdumb</title>
        <meta name="description" content={item.description.substring(0, 160)} />
      </Head>

      <section
        ref={productSectionRef}
        className="flex relative gap-10 items-start px-8 pt-12  max-md:px-5 overflow-hidden"
      >
        <ImageGallerySticky
          images={item.images}
          containerRef={productSectionRef}
        />
        <ItemInfo 
          item={item} 
          onAddToCart={handleAddToCart} 
          onSizeChange={(size) => setSelectedSize(size)}
        />
        {/* 在庫がない場合、または選択されたサイズの在庫がない場合のみ表示 */}
        {item.hasSizes && selectedSize && 
          item.itemSizes.find(s => s.size === selectedSize)?.inventory === 0 && (
          <RestockNotification 
            itemId={item.id} 
            size={selectedSize.toString()} 
            isVisible={true} 
          />
        )}
        {/* サイズなしアイテムで在庫がない場合 */}
        {!item.hasSizes && item.inventory === 0 && (
          <RestockNotification 
            itemId={item.id} 
            size="NONE" 
            isVisible={true} 
          />
        )}
      </section>

      {/* 複数キャラクターを全て表示するように変更 */}
      {item.characters.length > 0 && (
        <CharacterSection characters={item.characters} />
      )}
      
      {/* 関連アイテム（最初のキャラクターに基づく） */}
      <RelatedItems characterId={characterIdForRelated} currentItemId={item.id} />
      
      {/* このアイテムを見た人はこれも見ています */}
      <ViewedTogetherItems itemId={item.id} />
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
    characters: { // 変更: character -> characters
    include: {
    character: { // キャラクター情報を取得
    include: {
    characterSeries: {
    select: {
    id: true,
    name: true,
    },
    },
    },
    },
    },
      orderBy: {
        displayOrder: 'asc', // 表示順でソート（小さい数字が先）
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

    // キャラクター情報を整形 (ItemCharacter -> Character へ変換)
    const characters = item.characters.map(ic => ({
      id: ic.character.id,
      name: ic.character.name,
      description: ic.character.description,
      image: ic.character.image,
      characterSeries: ic.character.characterSeries,
    }));

    // 整形したデータを含む新しいアイテムオブジェクト
    const formattedItem = {
      ...item,
      characters,
    };

    // BigInt型をJSON化するために文字列に変換
    const serializedItem = JSON.parse(
      JSON.stringify(formattedItem, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    // character関連プロパティを削除
    delete serializedItem.characters;

    return {
      props: {
        item: {
          ...serializedItem,
          characters, // 整形したキャラクターデータを設定
        },
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