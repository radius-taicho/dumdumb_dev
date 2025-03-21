import React from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import ProtectedRoute from "@/components/ProtectedRoute";

// 仮の注文データ
const dummyOrders = [
  {
    id: "12345",
    orderDate: "2025/2/22",
    deliveryDate: "2025/2/27",
    itemName: "アイテム名",
    size: "サイズ",
    price: 4800,
    quantity: 1,
    imageUrl: "/path/to/image1.jpg", // 実際の画像パスに置き換えてください
  },
  {
    id: "12344",
    orderDate: "2025/2/22",
    deliveryDate: "2025/2/27",
    itemName: "アイテム名",
    size: "サイズ",
    price: 4800,
    quantity: 1,
    imageUrl: "/path/to/image2.jpg", // 実際の画像パスに置き換えてください
  },
];

// おすすめアイテムデータ
const recommendedItems = [
  { id: "1", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec1.jpg" },
  { id: "2", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec2.jpg" },
  { id: "3", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec3.jpg" },
  { id: "4", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec4.jpg" },
  { id: "5", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec5.jpg" },
];

const OrderHistoryPage: NextPage = () => {
  return (
    <ProtectedRoute>
      <Head>
        <title>お買い物履歴 | DumDumb</title>
        <meta name="description" content="DumDumbでのお買い物履歴" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">お買い物履歴</h1>

        {/* 注文リスト */}
        <div className="space-y-4 mb-12">
          {dummyOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* アイテム画像 */}
                <div className="w-28 h-28 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                  {/* 画像がある場合は以下のコメントを解除して使用してください */}
                  {/* <Image 
                    src={order.imageUrl} 
                    alt={order.itemName} 
                    width={112} 
                    height={112} 
                    className="object-cover"
                  /> */}
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                    <div className="w-4 h-1 bg-white rounded-full mr-1"></div>
                    <div className="w-4 h-1 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* アイテム情報 */}
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <h3 className="font-medium">アイテム名</h3>
                    <p className="text-sm text-gray-600">サイズ</p>
                    <p className="font-medium mt-2">
                      ¥{order.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <div className="mb-4">
                      <p className="text-sm">
                        <span className="text-gray-600 mr-2">注文日</span>
                        <span>{order.orderDate}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600 mr-2">お届け日</span>
                        <span>{order.deliveryDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end">
                      <p className="md:mr-6">
                        <span className="text-gray-600 mr-1">×</span>
                        <span>{order.quantity}</span>
                      </p>
                      <Link
                        href={`/mypage/orders/${order.id}`}
                        className="text-sm text-gray-600 hover:text-indigo-600 underline"
                      >
                        注文詳細を見る
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* おすすめアイテムセクション */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">dumdumbからのおすすめ</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {recommendedItems.map((item) => (
              <div key={item.id} className="border p-2">
                <div className="aspect-square bg-gray-100 mb-3 flex items-center justify-center">
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
    </ProtectedRoute>
  );
};

// サーバーサイドでの認証チェック
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login?redirect=/mypage/orders',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default OrderHistoryPage;