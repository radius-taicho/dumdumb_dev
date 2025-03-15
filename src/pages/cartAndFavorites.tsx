import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

// カートアイテムデータ
const cartItems = [
  {
    id: "1",
    name: "アイテム名",
    size: "サイズA",
    price: 4800,
    quantity: 1,
    characterName: "キャラクター名A",
    imageUrl: "/path/to/blue-character.jpg", // 実際の画像パスに置き換える
    color: "blue-700",
  },
  {
    id: "2",
    name: "アイテム名",
    size: "サイズB",
    price: 3600,
    quantity: 1,
    characterName: "キャラクター名B",
    imageUrl: "/path/to/black-character.jpg", // 実際の画像パスに置き換える
    color: "black",
  },
  {
    id: "3",
    name: "アイテム名",
    size: "サイズC",
    price: 5200,
    quantity: 1,
    characterName: "キャラクター名C",
    imageUrl: "/path/to/green-character.jpg", // 実際の画像パスに置き換える
    color: "green-600",
  },
];

// お気に入りアイテムデータ
const favoriteItems = [
  {
    id: "4",
    name: "商品名",
    size: "サイズ",
    price: 4800,
    characterName: "キャラクター名",
    imageUrl: "/path/to/black-character.jpg", // 実際の画像パスに置き換える
  },
  {
    id: "5",
    name: "商品名",
    size: "サイズ",
    price: 4800,
    characterName: "キャラクター名",
    imageUrl: "/path/to/black-character.jpg", // 実際の画像パスに置き換える
  },
  {
    id: "6",
    name: "商品名",
    size: "サイズ",
    price: 4800,
    characterName: "キャラクター名",
    imageUrl: "/path/to/black-character.jpg", // 実際の画像パスに置き換える
  },
];

// おすすめ商品データ
const recommendedItems = [
  { id: "7", name: "商品名", price: 4800, imageUrl: "/path/to/rec1.jpg" },
  { id: "8", name: "商品名", price: 4800, imageUrl: "/path/to/rec2.jpg" },
  { id: "9", name: "商品名", price: 4800, imageUrl: "/path/to/rec3.jpg" },
  { id: "10", name: "商品名", price: 4800, imageUrl: "/path/to/rec4.jpg" },
  { id: "11", name: "商品名", price: 4800, imageUrl: "/path/to/rec5.jpg" },
];

const CartAndFavoritesPage: NextPage = () => {
  const router = useRouter();
  // 各カート項目ごとの数量を管理するstate
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    cartItems.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
  );

  // スクロール位置の追跡
  const [isScrolled, setIsScrolled] = useState(false);

  // カート合計の計算
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * (quantities[item.id] || 1),
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

  const handleQuantityDecrease = (id: string) => {
    if (quantities[id] > 1) {
      setQuantities({
        ...quantities,
        [id]: quantities[id] - 1,
      });
    }
  };

  const handleQuantityIncrease = (id: string) => {
    setQuantities({
      ...quantities,
      [id]: (quantities[id] || 1) + 1,
    });
  };

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
              {/* 左側フレーム：商品情報と数量調整 */}
              <div className="border rounded-lg p-6 flex-grow">
                <div className="space-y-8">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex flex-col md:flex-row gap-6 border-b pb-6 last:border-0 last:pb-0"
                    >
                      {/* 商品画像 */}
                      <div className="w-28 h-28 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                        {/* 画像 */}
                        <div
                          className={`w-20 h-20 bg-${item.color} rounded-full flex items-center justify-center`}
                        >
                          <div className="flex">
                            <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* 商品詳細と数量調整 */}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{item.name}</h3>
                          {/* 削除ボタン */}
                          <button className="text-gray-500 hover:text-gray-700">
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
                        <p className="text-sm text-gray-600">{item.size}</p>
                        <p className="font-medium mt-2">
                          ¥{item.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          {item.characterName}
                        </p>

                        {/* 数量調整 - 商品情報の下に配置 */}
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

        {/* お気に入りアイテムセクション */}
        <div id="favorites-section">
          <h2 className="text-2xl font-bold mb-6">お気に入りアイテム</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {favoriteItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  {/* 商品画像 */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                    {/* 画像 */}
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                      <div className="flex">
                        <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* 削除ボタン */}
                  <button className="text-gray-500 hover:text-gray-700">
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

                {/* 商品情報 */}
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.size}</p>
                  <p className="font-medium mt-1 mb-4">
                    ¥{item.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {item.characterName}
                  </p>

                  {/* カートに追加ボタン */}
                  <button className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full transition-colors">
                    カートに追加
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* おすすめ商品セクション */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">dumdumbからのおすすめ</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {recommendedItems.map((item) => (
              <div key={item.id} className="border">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <p className="text-sm text-gray-500">アイテム画像</p>
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

export default CartAndFavoritesPage;
