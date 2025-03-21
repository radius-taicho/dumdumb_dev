import React, { useState, useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { Size } from "@prisma/client";

// コンポーネントのインポート
import AmazonPaySection from "@/components/checkout/AmazonPaySection";
import AddressSection from "@/components/checkout/AddressSection";
import PaymentMethodSection from "@/components/checkout/PaymentMethodSection";
import DeliveryDateTimeSection from "@/components/checkout/DeliveryDateTimeSection";
import CartItemsSection from "@/components/checkout/CartItemsSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import AddressModal from "@/components/checkout/AddressModal";
import PaymentMethodModal from "@/components/checkout/PaymentMethodModal";

// 型定義
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
    inventory: number;
    character: {
      id: string;
      name: string;
    } | null;
  };
};

type AddressType = {
  id: string;
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  line1: string;
  line2: string | null;
  phoneNumber: string;
  isDefault: boolean;
};

type PaymentMethodType = {
  id: string;
  type: string;
  cardNumber?: string | null;
  cardHolderName?: string | null;
  expiryMonth?: string | null;
  expiryYear?: string | null;
  amazonPayId?: string | null;
  isDefault: boolean;
};

type CheckoutPageProps = {
  cartItems: CartItemType[];
  addresses: AddressType[];
  paymentMethods: PaymentMethodType[];
  error?: string;
};

const CheckoutPage: NextPage<CheckoutPageProps> = ({
  cartItems: initialCartItems,
  addresses: initialAddresses,
  paymentMethods: initialPaymentMethods,
  error: initialError,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | undefined>(initialError);
  const [cartItems, setCartItems] = useState<CartItemType[]>(
    initialCartItems || []
  );
  const [addresses, setAddresses] = useState<AddressType[]>(
    initialAddresses || []
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>(
    initialPaymentMethods || []
  );

  // 選択状態
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("希望日なし");
  const [selectedTime, setSelectedTime] = useState<string>("希望時間帯なし");
  const [isProcessing, setIsProcessing] = useState(false);

  // モーダル表示状態
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  // 初期選択状態の設定
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      setSelectedAddressId(
        defaultAddress ? defaultAddress.id : addresses[0].id
      );
    }

    if (paymentMethods.length > 0) {
      const defaultPayment = paymentMethods.find((pm) => pm.isDefault);
      setSelectedPaymentMethodId(
        defaultPayment ? defaultPayment.id : paymentMethods[0].id
      );
    }
  }, [addresses, paymentMethods]);

  // カート合計金額計算
  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.item.price) * item.quantity,
    0
  );
  const shippingFee = 760;
  const tax = Math.floor(subtotal * 0.1); // 10%の消費税（切り捨て）
  const total = subtotal + shippingFee;

  // 注文ボタンが有効かどうか確認
  const isOrderButtonEnabled =
    cartItems.length > 0 &&
    selectedAddressId !== "" &&
    selectedPaymentMethodId !== "";

  // Amazon Pay処理
  const handleAmazonPay = async () => {
    setIsProcessing(true);
    setError(undefined);

    try {
      // 実際にはここでAmazon PayのJavaScriptライブラリを使用して
      // 認証とユーザー情報の取得を行います
      const amazonOrderReferenceId =
        "test-amazon-order-reference-" + Date.now();

      const response = await fetch("/api/payment-methods/amazon-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amazonOrderReferenceId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Amazon Payの処理中にエラーが発生しました"
        );
      }

      const result = await response.json();

      // 住所と支払い方法を更新
      setAddresses([...addresses, result.address]);
      setPaymentMethods([...paymentMethods, result.paymentMethod]);
      setSelectedAddressId(result.address.id);
      setSelectedPaymentMethodId(result.paymentMethod.id);

      toast.success("Amazon Payの情報を取得しました");
    } catch (error) {
      console.error("Amazon Pay error:", error);
      setError("Amazon Payの処理中にエラーが発生しました");
      toast.error("Amazon Payの処理に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  // 新しい住所を追加
  const handleAddAddress = async (addressData: any) => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "住所の追加に失敗しました");
      }

      const newAddress = await response.json();

      // 住所リストを更新
      const updatedAddresses = addressData.isDefault
        ? addresses
            .map((addr) => ({ ...addr, isDefault: false }))
            .concat(newAddress)
        : [...addresses, newAddress];

      setAddresses(updatedAddresses);

      // 新しい住所を選択状態に
      setSelectedAddressId(newAddress.id);

      // モーダルを閉じる
      setShowAddressModal(false);

      toast.success("お届け先を追加しました");
    } catch (error) {
      console.error("Address error:", error);
      toast.error("お届け先の追加に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  // 新しい支払い方法を追加
  const handleAddPaymentMethod = async (paymentData: any) => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "支払い方法の追加に失敗しました");
      }

      const newPaymentMethod = await response.json();

      // 支払い方法リストを更新
      const updatedPaymentMethods = paymentData.isDefault
        ? paymentMethods
            .map((pm) => ({ ...pm, isDefault: false }))
            .concat(newPaymentMethod)
        : [...paymentMethods, newPaymentMethod];

      setPaymentMethods(updatedPaymentMethods);

      // 新しい支払い方法を選択状態に
      setSelectedPaymentMethodId(newPaymentMethod.id);

      // モーダルを閉じる
      setShowPaymentMethodModal(false);

      toast.success("お支払い方法を追加しました");
    } catch (error) {
      console.error("Payment method error:", error);
      toast.error("お支払い方法の追加に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  // 注文処理
  const handlePlaceOrder = async () => {
    if (!isOrderButtonEnabled) {
      return;
    }

    setIsProcessing(true);
    setError(undefined);

    try {
      // 注文日に変換
      let deliveryDate = null;
      if (selectedDate !== "希望日なし") {
        const dateParts = selectedDate.match(/(\d+)年(\d+)月(\d+)日/);
        if (dateParts) {
          deliveryDate = new Date(
            parseInt(dateParts[1]),
            parseInt(dateParts[2]) - 1,
            parseInt(dateParts[3])
          ).toISOString();
        }
      }

      // 注文アイテムデータを準備
      const orderItems = cartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        price: Number(item.item.price),
        size: item.size,
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethodId: selectedPaymentMethodId,
          deliveryDate: deliveryDate,
          deliveryTimeSlot:
            selectedTime !== "希望時間帯なし" ? selectedTime : null,
          items: orderItems,
          subtotal: subtotal,
          shippingFee: shippingFee,
          tax: tax,
          total: total,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "注文処理中にエラーが発生しました");
      }

      const orderData = await response.json();

      // 注文成功後、完了ページへリダイレクト
      router.push(`/checkout/complete?orderId=${orderData.order.id}`);
    } catch (error) {
      console.error("Order error:", error);
      setError("注文処理中にエラーが発生しました");
      toast.error("注文の確定に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
        <p className="text-gray-600 mb-2">{error}</p>
        <p className="text-gray-500 mb-6 text-sm">
          この問題が繰り返し発生する場合は、一度ログアウトしてから再度お試しください。
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/cartAndFavorites" className="text-orange-500 hover:underline">
            カートに戻る
          </Link>
          <Link href="/" className="text-orange-500 hover:underline">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">カートが空です</h1>
        <p className="text-gray-600 mb-6">お買い物をしてからご利用ください</p>
        <Link href="/" className="text-orange-500 hover:underline">
          ショッピングを始める
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>購入手続き | DumDumb</title>
        <meta name="description" content="DumDumbでの購入手続き" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">購入手続き</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* Amazon支払いセクション */}
            <AmazonPaySection
              onAmazonPay={handleAmazonPay}
              isProcessing={isProcessing}
            />

            {/* お届け先セクション */}
            <AddressSection
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onAddressSelect={setSelectedAddressId}
              onAddNew={() => setShowAddressModal(true)}
            />

            {/* お支払い方法セクション */}
            <PaymentMethodSection
              paymentMethods={paymentMethods}
              selectedPaymentMethodId={selectedPaymentMethodId}
              onPaymentMethodSelect={setSelectedPaymentMethodId}
              onAddNew={() => setShowPaymentMethodModal(true)}
            />

            {/* 希望配送日時セクション */}
            <DeliveryDateTimeSection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
            />

            {/* お届けアイテムセクション */}
            <CartItemsSection cartItems={cartItems} />
          </div>

          {/* 注文内容サマリー */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={subtotal}
              shippingFee={shippingFee}
              tax={tax}
              total={total}
              isOrderButtonEnabled={isOrderButtonEnabled}
              isProcessing={isProcessing}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>

        {/* 住所追加モーダル */}
        {showAddressModal && (
          <AddressModal
            onClose={() => setShowAddressModal(false)}
            onSubmit={handleAddAddress}
            isProcessing={isProcessing}
          />
        )}

        {/* 支払い方法追加モーダル */}
        {showPaymentMethodModal && (
          <PaymentMethodModal
            onClose={() => setShowPaymentMethodModal(false)}
            onSubmit={handleAddPaymentMethod}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login?redirect=/checkout",
        permanent: false,
      },
    };
  }

  try {
    const userId = session.user.id;
    console.log(`チェックアウトデータ取得開始 - userId: ${userId}`);

    // カート情報を取得
    let cart;
    try {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              item: {
                include: {
                  character: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      console.log(`カート取得結果:`, { 
        cartFound: !!cart, 
        itemsCount: cart?.items?.length || 0 
      });
    } catch (cartError) {
      console.error(`カート取得エラー:`, cartError);
      throw new Error(`カート情報の取得に失敗しました: ${cartError.message}`);
    }

    // 住所情報を取得
    let addresses;
    try {
      addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: "desc" },
      });
      console.log(`住所情報取得結果: 件数=${addresses.length}`);
    } catch (addressError) {
      console.error(`住所情報取得エラー:`, addressError);
      throw new Error(`お届け先情報の取得に失敗しました: ${addressError.message}`);
    }

    // 支払い方法情報を取得
    let paymentMethods;
    try {
      paymentMethods = await prisma.paymentMethod.findMany({
        where: { userId },
        orderBy: { isDefault: "desc" },
      });
      console.log(`支払い方法情報取得結果: 件数=${paymentMethods.length}`);
    } catch (paymentError) {
      console.error(`支払い方法取得エラー:`, paymentError);
      throw new Error(`お支払い方法の取得に失敗しました: ${paymentError.message}`);
    }

    // BigInt型をJSON化するために文字列に変換
    const serializedCartItems = cart?.items
      ? JSON.parse(
          JSON.stringify(cart.items, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        )
      : [];

    const serializedAddresses = JSON.parse(
      JSON.stringify(addresses, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    const serializedPaymentMethods = JSON.parse(
      JSON.stringify(paymentMethods, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return {
      props: {
        cartItems: serializedCartItems,
        addresses: serializedAddresses,
        paymentMethods: serializedPaymentMethods,
      },
    };
  } catch (error) {
    console.error("Error fetching checkout data:", error);
    
    // より詳細なエラーメッセージを生成
    let errorMessage = "購入データの取得中にエラーが発生しました";
    
    if (error instanceof Error) {
      // 開発環境では詳細なエラーメッセージを表示
      if (process.env.NODE_ENV === 'development') {
        errorMessage = `エラー: ${error.message}`;
      }
    }
    
    return {
      props: {
        cartItems: [],
        addresses: [],
        paymentMethods: [],
        error: errorMessage,
      },
    };
  }
};

export default CheckoutPage;