import React, { useState, useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { toast } from "react-hot-toast";
import { prisma } from "@/lib/prisma";
import { Size } from "@prisma/client";

// キャラクターデータ型
type CharacterType = {
  id: string;
  name: string;
};

// カートアイテムデータ型
type CartItemType = {
  id: string;
  itemId: string;
  quantity: number;
  size: Size | null;
  item: {
    id: string;
    name: string;
    price: number;
    images: string;
    hasSizes: boolean;
    characters: CharacterType[]; // 複数キャラクター対応
  };
};

// お気に入りアイテムデータ型
type FavoriteItemType = {
  id: string;
  itemId: string;
  item: {
    id: string;
    name: string;
    price: number;
    images: string;
    characters: CharacterType[]; // 複数キャラクター対応
  };
};

// ページのprops型
type CartAndFavoritesPageProps = {
  cartItems: CartItemType[];
  favoriteItems: FavoriteItemType[];
  error?: string;
};

// おすすめアイテムデータ
// 実限では、APIから取得したリアルデータを使用する
// 現段階ではダミーデータを使用
const recommendedItems = [
  { id: "7", name: "アイテム名", price: 4800, images: "https://placehold.co/400x400/orange/white?text=Item+1" },
  { id: "8", name: "アイテム名", price: 4800, images: "https://placehold.co/400x400/orange/white?text=Item+2" },
  { id: "9", name: "アイテム名", price: 4800, images: "https://placehold.co/400x400/orange/white?text=Item+3" },
  { id: "10", name: "アイテム名", price: 4800, images: "https://placehold.co/400x400/orange/white?text=Item+4" },
  { id: "11", name: "アイテム名", price: 4800, images: "https://placehold.co/400x400/orange/white?text=Item+5" },
];

const CartAndFavoritesPage: NextPage<CartAndFavoritesPageProps> = ({
  cartItems: initialCartItems,
  favoriteItems: initialFavoriteItems,
  error,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItemType[]>(
    initialCartItems || []
  );
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItemType[]>(
    initialFavoriteItems || []
  );

  // 各カート項目ごとの数量を管理するstate
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    (initialCartItems || []).reduce(
      (acc, item) => ({ ...acc, [item.id]: item.quantity }),
      {}
    )
  );

  // スクロール位置の追跡
  const [isScrolled, setIsScrolled] = useState(false);

  // カート合計の計算
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.item.price) * (quantities[item.id] || 1),
    0
  );

  // カート内のアイテム総数を計算
  const totalItemCount = Object.values(quantities).reduce(
    (sum, qty) => sum + qty,
    0
  );

  // スクロールイベントハンドラ
  useEffect(() => {
    const handleScroll = () => {
      const cartSection = document.getElementById("cart-section");
      if (cartSection) {
        const rect = cartSection.getBoundingClientRect();
        // カートセクションが画面上部から出始めたらスクロール状態に
        setIsScrolled(rect.top < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ページ初期表示時、ハートボタンからの遷移時にお気に入りセクションにスクロール
  useEffect(() => {
    // ルートクエリの確認
    if (router.query.section === "favorites") {
      const favoritesSection = document.getElementById("favorites-section");
      if (favoritesSection) {
        // ヘッダー分の高さを考慮してスクロール位置を調整
        const yOffset = -72; // ヘッダー高さ + 余白
        const y =
          favoritesSection.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;

        window.scrollTo({ top: y, behavior: "auto" });
      }
    }
  }, [router.query]);

  // 数量減少ハンドラ
  const handleQuantityDecrease = async (id: string) => {
    if (quantities[id] > 1) {
      try {
        const newQuantity = quantities[id] - 1;

        // APIを呼び出して数量を更新
        const response = await fetch("/api/cart/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cartItemId: id,
            quantity: newQuantity,
          }),
        });

        if (response.ok) {
          setQuantities({
            ...quantities,
            [id]: newQuantity,
          });
        } else {
          toast.error("数量の更新に失敗しました");
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast.error("数量の更新中にエラーが発生しました");
      }
    }
  };

  // 数量増加ハンドラ
  const handleQuantityIncrease = async (id: string) => {
    try {
      const cartItem = cartItems.find((item) => item.id === id);
      if (!cartItem) return;

      const newQuantity = quantities[id] + 1;

      // 在庫チェック
      const itemResponse = await fetch(`/api/items/${cartItem.itemId}`);
      if (!itemResponse.ok) {
        toast.error("アイテム情報の取得に失敗しました");
        return;
      }

      const itemData = await itemResponse.json();

      // サイズ別在庫チェック
      let hasEnoughInventory = false;
      if (itemData.hasSizes && cartItem.size) {
        const sizeInventory =
          itemData.itemSizes.find((s: any) => s.size === cartItem.size)
            ?.inventory || 0;
        hasEnoughInventory = sizeInventory >= newQuantity;
      } else {
        hasEnoughInventory = itemData.inventory >= newQuantity;
      }

      if (!hasEnoughInventory) {
        toast.error("在庫が不足しています");
        return;
      }

      // APIを呼び出して数量を更新
      const response = await fetch("/api/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId: id,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        setQuantities({
          ...quantities,
          [id]: newQuantity,
        });
      } else {
        toast.error("数量の更新に失敗しました");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("数量の更新中にエラーが発生しました");
    }
  };

  // カートアイテム削除ハンドラ
  const handleRemoveItem = async (id: string) => {
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId: id,
        }),
      });

      if (response.ok) {
        // 成功したらカートアイテムリストから削除
        setCartItems(cartItems.filter((item) => item.id !== id));
        // 数量も削除
        const newQuantities = { ...quantities };
        delete newQuantities[id];
        setQuantities(newQuantities);

        toast.success("アイテムをカートから削除しました");
      } else {
        toast.error("アイテムの削除に失敗しました");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("アイテムの削除中にエラーが発生しました");
    }
  };

  // お気に入りから削除するハンドラ
  const handleRemoveFavorite = async (id: string) => {
    try {
      const response = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favoriteId: id,
        }),
      });

      if (response.ok) {
        // 成功したらお気に入りリストから削除
        setFavoriteItems(favoriteItems.filter((item) => item.id !== id));
        toast.success("お気に入りから削除しました");
      } else {
        toast.error("お気に入りから削除できませんでした");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("お気に入りの削除中にエラーが発生しました");
    }
  };

  // 画像を取得する関数
  const getItemImageUrl = (images: string): string => {
    if (!images) return "/images/placeholder.jpg";
    
    // カンマ区切りの最初の画像を取得
    const imageArray = images.split(",");
    const firstImage = imageArray[0].trim();
    return firstImage;
  };

  // サイズを表示用にフォーマット
  const formatSize = (size: Size | null, hasSizes: boolean): string => {
    if (!hasSizes) return "";
    if (!size) return "サイズなし";
    return size;
  };

  // キャラクターを表示するためのヘルパー関数
  const renderCharacters = (characters: CharacterType[]): JSX.Element => {
    if (!characters || characters.length === 0) {
      return <></>;
    }
    
    // 最初のキャラクターのみ表示（または複数のキャラクターをカンマ区切りで表示）
    if (characters.length === 1) {
      return <p className="text-sm text-gray-600 mb-1">{characters[0].name}</p>;
    } else {
      return (
        <div className="mb-2">
          {characters.map((character, index) => (
            <span 
              key={character.id} 
              className="inline-block bg-gray-100 text-xs text-gray-600 px-2 py-1 rounded-full mr-1 mb-1"
            >
              {character.name}
            </span>
          ))}
        </div>
      );
    }
  };

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

  return (
    <>
      <Head>
        <title>カートとお気に入り | DumDumb</title>
        <meta
          name="description"
          content="DumDumbのカートとお気に入りアイテム"
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        {/* カートアイテムセクション */}
        <h1 className="text-2xl font-bold mb-6">カートアイテム</h1>

        <div id="cart-section" className="mb-12 relative">
          {cartItems.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-4">
              {/* 左側フレーム：アイテム情報と数量調整 */}
              <div className="border rounded-lg p-6 flex-grow">
                <div className="space-y-8">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row gap-6 border-b pb-6 last:border-0 last:pb-0"
                    >
                      {/* アイテム画像 */}
                      <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        {item.item.images ? (
                          <img
                            src={getItemImageUrl(item.item.images)}
                            alt={item.item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                              <div className="flex">
                                <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* アイテム詳細と数量調整 */}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{item.item.name}</h3>
                          {/* 削除ボタン */}
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        {item.item.hasSizes && (
                          <p className="text-sm text-gray-600">
                            {formatSize(item.size, item.item.hasSizes)}
                          </p>
                        )}
                        <p className="font-medium mt-2">
                          ¥
                          {Math.floor(Number(item.item.price)).toLocaleString()}
                        </p>
                        
                        {/* キャラクター表示 - 修正済み */}
                        {renderCharacters(item.item.characters)}

                        {/* 数量調整 - アイテム情報の下に配置 */}
                        <div className="flex items-center border rounded-full overflow-hidden w-fit">
                          <button
                            onClick={() => handleQuantityDecrease(item.id)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="px-4 py-1">
                            {quantities[item.id] || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityIncrease(item.id)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右側フレーム：小計と購入ボタン - 固定サイズで追従 */}
              <div className="md:w-64 md:flex-shrink-0">
                <div
                  className={`border rounded-lg p-6 flex flex-col justify-between ${
                    isScrolled ? "md:sticky md:top-20" : ""
                  }`}
                >
                  {/* テキストを右寄せに変更 */}
                  <div className="mb-4">
                    <p className="text-sm text-right">
                      小計({totalItemCount}点のアイテム)
                    </p>
                    <p className="font-medium text-right">
                      ¥{cartTotal.toLocaleString()}(税込)
                    </p>
                  </div>

                  {/* ボタンを中央配置 */}
                  <div className="text-center">
                    <Link href="/checkout">
                      <button className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full transition-colors">
                        レジに進む
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-gray-500 mb-4">カートにアイテムはありません</p>
              <Link
                href="/"
                className="text-orange-500 hover:text-orange-600 underline"
              >
                ショッピングを始める
              </Link>
            </div>
          )}
        </div>

        {/* お気に入りセクション */}
        <div id="favorites-section" className="mt-16 mb-12">
          <h2 className="text-2xl font-bold mb-6">お気に入り</h2>
          
          {favoriteItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favoriteItems.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <Link href={`/items/${item.item.id}`}>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {/* 画像表示 */}
                      {item.item.images ? (
                        <img
                          src={getItemImageUrl(item.item.images)}
                          alt={item.item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                            <div className="flex">
                              <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* お気に入り削除ボタン */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveFavorite(item.id);
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </Link>
                  
                  <div className="p-3">
                    <Link href={`/items/${item.item.id}`}>
                      <h3 className="font-medium mb-1 hover:text-orange-500">
                        {item.item.name}
                      </h3>
                    </Link>
                    <p className="text-gray-800 mb-1">
                      ¥{Math.floor(Number(item.item.price)).toLocaleString()}
                    </p>
                    
                    {/* キャラクター表示 - 修正済み */}
                    {renderCharacters(item.item.characters)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-gray-500 mb-4">お気に入りはありません</p>
              <Link
                href="/"
                className="text-orange-500 hover:text-orange-600 underline"
              >
                ショッピングを始める
              </Link>
            </div>
          )}
        </div>

        {/* おすすめアイテムセクション */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">dumdumbからのおすすめ</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {recommendedItems.map((item) => (
              <div key={item.id} className="border">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {item.images ? (
                    <img
                      src={item.images}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="flex items-center justify-center h-full text-sm text-gray-500">アイテム画像</p>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-sm mb-1">{item.name}</h3>
                  <p className="text-sm">¥{item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// サーバーサイドでカートデータとお気に入りデータを取得
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      props: {
        cartItems: [],
        favoriteItems: [],
      },
    };
  }

  try {
    const userId = session.user.id;

    // ユーザーのカートを取得
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            item: {
              include: {
                // 1対多関係の代わりに多対多関係を使用
                characters: {
                  include: {
                    character: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                },
              },
            },
          },
        },
      },
    });

    // ユーザーのお気に入りを取得
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        item: {
          include: {
            // 1対多関係の代わりに多対多関係を使用
            characters: {
              include: {
                character: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
          },
        },
      },
    });

    // BigInt型をJSON化するために文字列に変換
    const serializedCartItems = cart?.items 
      ? JSON.parse(
          JSON.stringify(cart.items, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        )
      : [];

    const serializedFavorites = JSON.parse(
      JSON.stringify(favorites, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    // キャラクター情報を変換して正しい形式にする
    const cartItemsWithFormattedCharacters = serializedCartItems.map(item => {
      const formattedCharacters = item.item.characters.map(ic => ({
        id: ic.character.id,
        name: ic.character.name
      }));
      
      return {
        ...item,
        item: {
          ...item.item,
          characters: formattedCharacters
        }
      };
    });

    const favoriteItemsWithFormattedCharacters = serializedFavorites.map(favorite => {
      const formattedCharacters = favorite.item.characters.map(ic => ({
        id: ic.character.id,
        name: ic.character.name
      }));
      
      return {
        ...favorite,
        item: {
          ...favorite.item,
          characters: formattedCharacters
        }
      };
    });

    return {
      props: {
        cartItems: cartItemsWithFormattedCharacters,
        favoriteItems: favoriteItemsWithFormattedCharacters,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        cartItems: [],
        favoriteItems: [],
        error: "データの取得中にエラーが発生しました",
      },
    };
  }
};

export default CartAndFavoritesPage;