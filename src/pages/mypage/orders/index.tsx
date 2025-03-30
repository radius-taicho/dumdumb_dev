import React, { useState, useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import Link from "next/link";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import ProtectedRoute from "@/components/ProtectedRoute";
import { prisma } from "@/lib/prisma";
import { Order, OrderItem, Item } from "@prisma/client";
import { formatDate, calculateDeliveryDate } from "@/utils/date-formatter";
import {
  orderHistoryTranslations,
  getTranslation,
  getBrowserLanguage,
} from "@/utils/translations";

// コンポーネントのインポート
import OrderHistoryList from "@/components/orders/OrderHistoryList";
import RecommendedItems from "@/components/orders/RecommendedItems";

// 型定義
type OrderWithItems = Order & {
  items: (OrderItem & {
    item: Item;
  })[];
};

interface OrderHistoryPageProps {
  orders: OrderWithItems[];
  recommendedItems: Item[];
  error?: string;
}

const OrderHistoryPage: NextPage<OrderHistoryPageProps> = ({
  orders,
  recommendedItems,
  error,
}) => {
  const [language, setLanguage] = useState<string>("ja");

  useEffect(() => {
    setLanguage(getBrowserLanguage());
  }, []);

  const t = getTranslation(orderHistoryTranslations, language);

  // 日付フォーマット関数
  const formatOrderDate = (dateStr: string) => formatDate(dateStr, language);
  const formatDeliveryDate = (dateStr: string) =>
    calculateDeliveryDate(dateStr, language);

  return (
    <ProtectedRoute>
      <Head>
        <title>{t.pageTitle} | DumDumb</title>
        <meta name="description" content={t.pageDescription} />
      </Head>
      <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
          <Link href="/mypage" className="mr-2">
            <span className="text-gray-500 hover:text-gray-700">
              &lt; マイページに戻る
            </span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">{t.pageTitle}</h1>

        {/* 注文リスト */}
        <OrderHistoryList
          orders={orders}
          formatOrderDate={formatOrderDate}
          formatDeliveryDate={formatDeliveryDate}
          translations={{
            noOrdersMessage: t.noOrdersMessage,
            backToItems: t.backToItems,
            sizeLabel: t.sizeLabel,
            otherItems: t.otherItems,
            quantity: t.quantity,
            orderDate: t.orderDate,
            deliveryDate: t.deliveryDate,
            totalQuantity: t.totalQuantity,
            viewDetails: t.viewDetails,
          }}
        />

        {/* おすすめアイテムセクション */}
        <RecommendedItems items={recommendedItems} title={t.recommendations} />
      </div>
    </ProtectedRoute>
  );
};

// サーバーサイドでの認証チェックとデータ取得
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login?redirect=/mypage/orders",
        permanent: false,
      },
    };
  }

  try {
    // ユーザーの注文履歴を取得
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // おすすめアイテムを取得（単純に最新の5アイテムを表示）
    const recommendedItems = await prisma.item.findMany({
      where: {
        inventory: {
          gt: 0, // 在庫があるアイテムのみ
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // 日付型をシリアライズできる形式に変換
    const serializedOrders = orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        price: Number(item.price),
        item: {
          ...item.item,
          createdAt: item.item.createdAt.toISOString(),
          updatedAt: item.item.updatedAt.toISOString(),
          price: Number(item.item.price),
        },
      })),
    }));

    const serializedRecommendedItems = recommendedItems.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      price: Number(item.price),
    }));

    return {
      props: {
        orders: serializedOrders,
        recommendedItems: serializedRecommendedItems,
      },
    };
  } catch (error) {
    console.error("Error fetching order history:", error);
    return {
      props: {
        orders: [],
        recommendedItems: [],
        error: "データの取得中にエラーが発生しました。",
      },
    };
  }
};

export default OrderHistoryPage;
