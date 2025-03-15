import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

// 最近見たアイテムデータ
const recentlyViewedItems = [
  { id: "1", name: "アイテム名", price: 4800, imageUrl: "/path/to/item1.jpg" },
  { id: "2", name: "アイテム名", price: 4800, imageUrl: "/path/to/item2.jpg" },
  { id: "3", name: "アイテム名", price: 4800, imageUrl: "/path/to/item3.jpg" },
  { id: "4", name: "アイテム名", price: 4800, imageUrl: "/path/to/item4.jpg" },
  { id: "5", name: "アイテム名", price: 4800, imageUrl: "/path/to/item5.jpg" },
  { id: "6", name: "アイテム名", price: 4800, imageUrl: "/path/to/item6.jpg" },
  { id: "7", name: "アイテム名", price: 4800, imageUrl: "/path/to/item7.jpg" },
];

// よく見ているアイテムデータ
const frequentlyViewedItems = [
  { id: "8", name: "アイテム名", price: 4800, imageUrl: "/path/to/freq1.jpg" },
  { id: "9", name: "アイテム名", price: 4800, imageUrl: "/path/to/freq2.jpg" },
  { id: "10", name: "アイテム名", price: 4800, imageUrl: "/path/to/freq3.jpg" },
  { id: "11", name: "アイテム名", price: 4800, imageUrl: "/path/to/freq4.jpg" },
  { id: "12", name: "アイテム名", price: 4800, imageUrl: "/path/to/freq5.jpg" },
];

// おすすめ商品データ
const recommendedItems = [
  { id: "13", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec1.jpg" },
  { id: "14", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec2.jpg" },
  { id: "15", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec3.jpg" },
  { id: "16", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec4.jpg" },
  { id: "17", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec5.jpg" },
];

const InterestedItemsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>気になっているアイテム | DumDumb</title>
        <meta
          name="description"
          content="DumDumbで気になっているアイテム一覧"
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">気になっているアイテム</h1>

        {/* 最近見たアイテム */}
        <div className="mt-20">
          <h2 className="text-xl font-bold mb-4">最近見たアイテム</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {recentlyViewedItems.map((item) => (
              <Link
                href={`/items/${item.id}`}
                key={item.id}
                className="block border hover:border-gray-400 transition-colors"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">アイテム画像</span>
                </div>
                <div className="p-2">
                  <h3 className="text-sm">{item.name}</h3>
                  <p className="text-sm mt-1">¥{item.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* よく見ているアイテム */}
        <div className="mt-20">
          <h2 className="text-xl font-bold mb-4">よく見ているアイテム</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {frequentlyViewedItems.map((item) => (
              <Link
                href={`/items/${item.id}`}
                key={item.id}
                className="block border hover:border-gray-400 transition-colors"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">アイテム画像</span>
                </div>
                <div className="p-2">
                  <h3 className="text-sm">{item.name}</h3>
                  <p className="text-sm mt-1">¥{item.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* おすすめ商品セクション */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">dumdumbからのおすすめ</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommendedItems.map((item) => (
              <Link
                href={`/items/${item.id}`}
                key={item.id}
                className="block border hover:border-gray-400 transition-colors"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">アイテム画像</span>
                </div>
                <div className="p-2">
                  <h3 className="text-sm">{item.name}</h3>
                  <p className="text-sm mt-1">¥{item.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default InterestedItemsPage;
