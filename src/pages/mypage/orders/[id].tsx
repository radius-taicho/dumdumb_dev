import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

const OrderDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // 注文詳細データ
  const orderDetails = {
    delivery: {
      name: "山田 太郎",
      zipCode: "〒123-4567",
      address: "東京都渋谷区渋谷1-1-1",
      building: "サンプルマンション101号室",
    },
    payment: {
      method: "支払い方法: クレジットカード",
      cardNumber: "カード番号: **** **** **** 1234",
    },
    purchase: {
      itemSubtotal: 4800,
      shippingFee: 980,
      orderTotal: 5780,
      billAmount: 5780,
    },
    item: {
      name: "アイテム名",
      size: "サイズ",
      price: 4800,
      orderDate: "2025/2/22",
      deliveryDate: "2025/2/27",
      quantity: 1,
      imageUrl: "/path/to/image.jpg",
    },
  };

  // おすすめ商品データ
  const recommendedItems = [
    { id: "1", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec1.jpg" },
    { id: "2", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec2.jpg" },
    { id: "3", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec3.jpg" },
    { id: "4", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec4.jpg" },
    { id: "5", name: "アイテム名", price: 4800, imageUrl: "/path/to/rec5.jpg" },
  ];

  return (
    <>
      <Head>
        <title>お買い物履歴詳細 | DumDumb</title>
        <meta name="description" content={`注文番号 #${id} の詳細情報`} />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">お買い物履歴詳細</h1>

        {/* 注文情報エリア */}
        <div className="border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* お届け先 */}
            <div>
              <h2 className="font-semibold mb-4">お届け先</h2>
              <p>{orderDetails.delivery.name}</p>
              <p>{orderDetails.delivery.zipCode}</p>
              <p>{orderDetails.delivery.address}</p>
              <p>{orderDetails.delivery.building}</p>
            </div>

            {/* お支払い情報 */}
            <div>
              <h2 className="font-semibold mb-4">お支払い情報</h2>
              <p>{orderDetails.payment.method}</p>
              <p>{orderDetails.payment.cardNumber}</p>
            </div>

            {/* 購入明細 */}
            <div>
              <h2 className="font-semibold mb-4">購入明細</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>アイテムの小計</p>
                  <p>¥{orderDetails.purchase.itemSubtotal.toLocaleString()}</p>
                </div>
                <div className="flex justify-between">
                  <p>送料</p>
                  <p>¥{orderDetails.purchase.shippingFee.toLocaleString()}</p>
                </div>
                <div className="flex justify-between">
                  <p>注文合計</p>
                  <p>¥{orderDetails.purchase.orderTotal.toLocaleString()}</p>
                </div>
                <div className="flex justify-between font-semibold">
                  <p>ご請求額</p>
                  <p>¥{orderDetails.purchase.billAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* 領収書リンク */}
              <div className="mt-4 text-right">
                <Link
                  href="#"
                  className="text-orange-500 hover:text-orange-600"
                >
                  領収書
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 商品詳細エリア */}
        <div className="border rounded-lg p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 商品画像 */}
            <div className="w-28 h-28 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
              {/* 実際の画像を使用する場合はこちらを使用 */}
              {/* <Image 
                src={orderDetails.item.imageUrl} 
                alt={orderDetails.item.name} 
                width={112} 
                height={112} 
                className="object-cover"
              /> */}

              {/* サンプル画像（青いモンスター） */}
              <div className="w-20 h-20 bg-blue-700 rounded-full flex flex-col items-center justify-center">
                <div className="flex mb-1">
                  <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="w-6 h-1 bg-white rounded-full"></div>
              </div>
            </div>

            {/* 商品情報 */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <h3 className="font-medium underline">
                  {orderDetails.item.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {orderDetails.item.size}
                </p>
                <p className="font-medium mt-2">
                  ¥{orderDetails.item.price.toLocaleString()}
                </p>
              </div>

              <div className="md:text-right">
                <div className="mb-4">
                  <p className="text-sm">
                    <span className="text-gray-600 mr-2">注文日</span>
                    <span>{orderDetails.item.orderDate}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600 mr-2">お届け日</span>
                    <span>{orderDetails.item.deliveryDate}</span>
                  </p>
                </div>

                <div className="flex items-center justify-end">
                  <p>
                    <span className="text-gray-600 mr-1">×</span>
                    <span>{orderDetails.item.quantity}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* おすすめ商品セクション */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">dumdumbからのオススメ</h2>

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
    </>
  );
};

export default OrderDetailPage;
