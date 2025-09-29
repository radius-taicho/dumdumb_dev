import React, { useState, useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { Order, OrderItem, Item, User } from "@prisma/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatDate, calculateDeliveryDate } from "@/utils/date-formatter";
import {
  orderDetailTranslations,
  getTranslation,
  getBrowserLanguage,
} from "@/utils/translations";

// コンポーネントのインポート
import ErrorLoadingState from "@/components/orders/ErrorLoadingState";
import OrderInfo, { parseAddress } from "@/components/orders/OrderInfo";
import OrderItems from "@/components/orders/OrderItems";
import RecommendedItems from "@/components/orders/RecommendedItems";

// 型定義
type OrderWithItemsAndUser = Order & {
  items: (OrderItem & {
    item: Item;
  })[];
  user: User;
};

interface OrderDetailPageProps {
  order?: OrderWithItemsAndUser;
  recommendedItems: Item[];
  error?: string;
}

const OrderDetailPage: NextPage<OrderDetailPageProps> = ({
  order,
  recommendedItems,
  error,
}) => {
  const [language, setLanguage] = useState<string>("ja");

  useEffect(() => {
    setLanguage(getBrowserLanguage());
  }, []);

  const t = getTranslation(orderDetailTranslations, language);

  // ページの読み込み中またはエラーの場合
  if (!order) {
    return (
      <ProtectedRoute>
        <ErrorLoadingState
          isLoading={!error}
          error={error}
          backToOrdersText={t.backToOrders}
          loadingText={t.loading}
        />
      </ProtectedRoute>
    );
  }

  // 注文日と配送日の計算
  const orderDate = formatDate(order.createdAt, language);
  const deliveryDate = calculateDeliveryDate(order.createdAt, language);

  // 住所の解析
  const addressDetails = parseAddress(order.address);

  // 支払い方法の判定（paymentReferenceIdから推測）
  let paymentMethod = t.creditCard;
  let maskedCardNumber = "**** **** **** ****";

  if (order.paymentReferenceId) {
    if (order.paymentReferenceId.startsWith("amazon_pay_")) {
      paymentMethod = t.amazonPay;
      maskedCardNumber = "";
    } else if (order.paymentReferenceId.startsWith("other_payment_")) {
      paymentMethod = t.otherPayment;
      maskedCardNumber = "";
    } else if (order.paymentReferenceId.startsWith("pi_")) {
      // Stripe Payment Intent ID (pi_から始まる)
      paymentMethod = t.creditCard;
      maskedCardNumber = "**** **** **** ****";
    }
  }

  // 合計金額の計算
  const itemSubtotal = order.items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  // 送料と税金の計算（仮の実装）
  const tax = Math.floor(itemSubtotal * 0.1); // 10%の消費税
  const shippingFee = 980; // 固定送料
  const orderTotal = Number(order.totalAmount);

  return (
    <ProtectedRoute>
      <Head>
        <title>{t.pageTitle} | DumDumb</title>
        <meta
          name="description"
          content={t.pageDescription.replace("{orderId}", order.id)}
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t.pageTitle}</h1>

        {/* 注文情報エリア */}
        <OrderInfo
          addressDetails={addressDetails}
          paymentMethod={paymentMethod}
          maskedCardNumber={maskedCardNumber}
          orderId={order.id}
          itemSubtotal={itemSubtotal}
          tax={tax}
          shippingFee={shippingFee}
          orderTotal={orderTotal}
          translations={{
            deliveryAddress: t.deliveryAddress,
            paymentInfo: t.paymentInfo,
            paymentMethod: t.paymentMethod,
            cardNumber: t.cardNumber,
            orderId: t.orderId,
            purchaseSummary: t.purchaseSummary,
            subtotal: t.subtotal,
            tax: t.tax,
            shippingFee: t.shippingFee,
            totalAmount: t.totalAmount,
            printPage: t.printPage,
          }}
        />

        {/* アイテム詳細エリア */}
        <OrderItems
          items={order.items}
          orderDate={orderDate}
          deliveryDate={deliveryDate}
          translations={{
            purchasedItems: t.purchasedItems,
            orderDate: t.orderDate,
            deliveryDate: t.deliveryDate,
            sizeLabel: t.sizeLabel,
          }}
        />

        {/* おすすめアイテムセクション */}
        <RecommendedItems items={recommendedItems} title={t.recommendations} />

        {/* ナビゲーションボタン */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/mypage/orders"
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
          >
            {t.backToOrderList}
          </Link>
        </div>
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

  // 注文IDを取得
  const { id } = context.params || {};

  if (!id || typeof id !== "string") {
    return {
      props: {
        error: "有効な注文IDが指定されていません。",
        recommendedItems: [],
      },
    };
  }

  try {
    // 注文データを取得（ユーザーとアイテムを含む）
    const order = await prisma.order.findUnique({
      where: {
        id: id,
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 注文がない、または他のユーザーの注文の場合
    if (!order || order.userId !== session.user.id) {
      return {
        props: {
          error: "注文が見つからないか、アクセス権限がありません。",
          recommendedItems: [],
        },
      };
    }

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
    const serializedOrder = {
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
    };

    const serializedRecommendedItems = recommendedItems.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      price: Number(item.price),
    }));

    return {
      props: {
        order: serializedOrder,
        recommendedItems: serializedRecommendedItems,
      },
    };
  } catch (error) {
    console.error("Error fetching order details:", error);
    return {
      props: {
        error: "データの取得中にエラーが発生しました。",
        recommendedItems: [],
      },
    };
  }
};

export default OrderDetailPage;
