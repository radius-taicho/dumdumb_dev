import React, { useState } from "react";
import { useRouter } from "next/router";
import { Size } from "@prisma/client";
import { useSession, signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import ActionButtons from "./ActionButtons";
import SizeChart from "./SizeChart"; // 新しいコンポーネントをインポート

// キャラクターの型定義
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

type ItemInfoProps = {
  item: ItemData;
  onAddToCart: (size: Size | null, quantity: number) => Promise<void>;
};

const ItemInfo: React.FC<ItemInfoProps> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // 選択されたサイズの在庫を取得
  const getSelectedSizeInventory = (): number => {
    if (!item.hasSizes) return item.inventory;
    if (!selectedSize) return 0;

    const sizeData = item.itemSizes.find((s) => s.size === selectedSize);
    return sizeData ? sizeData.inventory : 0;
  };

  // 現在選択されているサイズの在庫数
  const currentInventory = getSelectedSizeInventory();

  // 在庫切れかどうか
  const isOutOfStock = item.hasSizes
    ? selectedSize && currentInventory <= 0 // サイズは選択されているが在庫がない
    : item.inventory <= 0;

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleSizeSelect = (size: Size | null) => {
    setSelectedSize(size);

    // サイズを変更した時に、在庫がある場合のみ数量を調整
    const sizeData = item.itemSizes.find((s) => s.size === size);
    const newInventory = sizeData ? sizeData.inventory : 0;

    if (newInventory > 0) {
      // 在庫を超えないように数量を調整
      if (quantity > newInventory) {
        setQuantity(newInventory);
      }
    } else {
      // 在庫がない場合でも、数量を1に設定（通知用）
      setQuantity(1);
    }
  };

  // ログイン状態確認と未ログイン時の処理
  const checkAuth = () => {
    // 認証状態を詳細にチェック
    console.log("認証状態確認:", { status, session });

    if (status === "loading") {
      console.log("認証情報読み込み中");
      return false;
    }

    if (status !== "authenticated") {
      console.log("非認証状態:", status);
      toast.error("ログインが必要です");
      signIn(undefined, { callbackUrl: router.asPath });
      return false;
    }

    if (!session) {
      console.log("セッションなしエラー");
      toast.error("セッションが存在しません。再ログインしてください");
      signIn(undefined, { callbackUrl: router.asPath });
      return false;
    }

    if (!session.user?.id) {
      console.log("ユーザーIDなしエラー:", session);
      toast.error("ユーザー情報が不完全です。再ログインしてください");
      signIn(undefined, { callbackUrl: router.asPath });
      return false;
    }

    console.log("認証成功:", session.user);
    return true;
  };

  const handleAddToCart = async () => {
    if (isLoading) {
      console.log("すでに処理中のため処理をスキップ");
      return;
    }

    // 現在の状態を詳細にログ出力
    console.log("カート追加処理開始:", {
      isOutOfStock,
      hasSizes: item.hasSizes,
      selectedSize,
      currentInventory,
      quantity,
    });

    // 在庫がある場合のみカートに追加できる
    if (
      !isOutOfStock &&
      (item.hasSizes ? selectedSize : true) &&
      currentInventory > 0
    ) {
      try {
        setIsLoading(true);
        console.log("カート追加処理: 認証確認開始");

        // ログイン確認
        if (!checkAuth()) {
          console.log("認証確認失敗");
          setIsLoading(false);
          return;
        }

        console.log("カート追加処理: API呼び出し開始", {
          selectedSize,
          quantity,
        });

        try {
          await onAddToCart(selectedSize, quantity);
          toast.success("カートに追加しました");
          console.log("カート追加処理成功");
        } catch (error) {
          console.error("カート追加APIエラー:", error);
          // ここではエラーメッセージを表示しない（親コンポーネントから投げられたエラーをそのまま続ける）
          throw error;
        }
      } catch (error) {
        console.error("カート追加全体エラー:", error);

        // 詳細なエラーメッセージを生成
        let errorMessage;
        if (error instanceof Error) {
          errorMessage = `カート追加エラー: ${error.message}`;
        } else {
          errorMessage = "予期せぬエラーが発生しました。再試行してください。";
        }

        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else if (item.hasSizes && !selectedSize) {
      console.log("サイズ未選択エラー");
      toast.error("サイズを選択してください");
    } else {
      console.log("在庫なしまたは他の条件エラー", {
        isOutOfStock,
        hasSizes: item.hasSizes,
        selectedSize,
        currentInventory,
      });
      toast.error("現在の選択では購入できません");
    }
  };

  const handleBuyNow = async () => {
    if (isLoading) {
      console.log("すでに処理中のため処理をスキップ");
      return;
    }

    // 現在の状態を詳細にログ出力
    console.log("今すぐ買う処理開始:", {
      isOutOfStock,
      hasSizes: item.hasSizes,
      selectedSize,
      currentInventory,
      quantity,
    });

    // 在庫がある場合のみ購入できる
    if (
      !isOutOfStock &&
      (item.hasSizes ? selectedSize : true) &&
      currentInventory > 0
    ) {
      try {
        setIsLoading(true);
        console.log("今すぐ買う: 認証確認開始");

        // ログイン確認
        if (!checkAuth()) {
          console.log("認証確認失敗");
          setIsLoading(false);
          return;
        }

        console.log("今すぐ買う: カート追加API呼び出し", {
          selectedSize,
          quantity,
        });

        try {
          // カートに追加してからチェックアウトページに遷移
          await onAddToCart(selectedSize, quantity);
          console.log("カート追加成功、チェックアウトページに遷移します");
          router.push("/checkout");
        } catch (error) {
          console.error("カート追加APIエラー:", error);
          // エラーを再スローして詳細なエラーハンドリングを行う
          throw error;
        }
      } catch (error) {
        console.error("購入処理全体エラー:", error);

        // 詳細なエラーメッセージを生成
        let errorMessage;
        if (error instanceof Error) {
          errorMessage = `購入処理エラー: ${error.message}`;
        } else if (error instanceof Response) {
          errorMessage = `ネットワークエラー: ${error.status} ${error.statusText}`;
        } else {
          errorMessage =
            "予期せぬエラーが発生しました。もう一度お試しください。";
        }

        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else if (item.hasSizes && !selectedSize) {
      console.log("サイズ未選択エラー");
      toast.error("サイズを選択してください");
    } else {
      console.log("在庫なしまたは他の条件エラー", {
        isOutOfStock,
        hasSizes: item.hasSizes,
        selectedSize,
        currentInventory,
      });
      toast.error("現在の選択では購入できません");
    }
  };

  // 表示用の在庫状況テキスト
  const getInventoryStatusText = () => {
    if (!selectedSize && item.hasSizes) return "";

    if (currentInventory > 10) {
      return "在庫あり";
    } else if (currentInventory > 0) {
      return `残り${currentInventory}点`;
    } else {
      return "在庫切れ";
    }
  };

  return (
    <article className="flex flex-col p-4 w-full max-w-[500px] space-y-6">
      {/* アイテム基本情報 */}
      <div>
        {/* キャラクターアイコン（複数の場合は横並びに） */}
        {item.characters && item.characters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {item.characters.map((character) => (
              <span
                key={character.id}
                className="inline-block px-4 py-1 text-base bg-zinc-300 rounded-[40px] text-neutral-400"
              >
                {character.name}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-medium text-black mb-2">{item.name}</h1>
        <p className="text-xl font-bold text-black">
          ¥{Math.floor(Number(item.price)).toLocaleString()}
        </p>
      </div>

      {/* サイズ選択 */}
      {item.hasSizes && (
        <div className="space-y-3">
          <h2 className="text-xl font-medium text-black">サイズ</h2>
          <SizeSelector
            onSizeSelect={handleSizeSelect}
            selectedSize={selectedSize}
            hasSizes={item.hasSizes}
            itemSizes={item.itemSizes}
          />

          {selectedSize && (
            <div className="text-sm">
              <span
                className={
                  currentInventory > 10
                    ? "text-green-600"
                    : currentInventory > 0
                    ? "text-orange-500"
                    : "text-red-500"
                }
              >
                {getInventoryStatusText()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 数量選択 - 在庫がある場合のみ表示 */}
      {((item.hasSizes && selectedSize && currentInventory > 0) ||
        (!item.hasSizes && item.inventory > 0)) && (
        <div className="space-y-3">
          <h2 className="text-xl font-medium text-black">数量</h2>
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            maxQuantity={currentInventory}
          />
        </div>
      )}

      {/* アクションボタン */}
      <div className="py-2">
        <ActionButtons
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isOutOfStock={isOutOfStock}
          hasSizes={item.hasSizes}
          selectedSize={selectedSize}
          isLoading={isLoading || status === "loading"}
        />
      </div>

      {/* アイテム説明 */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-xl font-medium text-black">このアイテムについて</h3>
        <p className="text-base text-black whitespace-pre-line">
          {item.description}
        </p>
      </div>

      {/* サイズ規格表 - 新しいコンポーネントを使用 */}
      {item.hasSizes && (
        <SizeChart gender={item.gender} categoryId={item.categoryId} />
      )}
    </article>
  );
};

export default ItemInfo;
