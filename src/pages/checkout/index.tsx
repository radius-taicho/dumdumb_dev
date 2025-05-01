import React, { useState, useEffect } from "react";
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/client';
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma-client";
import { Size } from "@prisma/client";
import axios from "axios";

// コンポーネントのインポート
import AmazonPaySection from "@/components/checkout/AmazonPaySection";
import AddressSection from "@/components/checkout/AddressSection";
import PaymentMethodSection from "@/components/checkout/PaymentMethodSection";
import DeliveryDateTimeSection from "@/components/checkout/DeliveryDateTimeSection";
import CartItemsSection from "@/components/checkout/CartItemsSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import AddressModal from "@/components/checkout/AddressModal";
import PaymentMethodModal from "@/components/checkout/PaymentMethodModal";
import PointsSection from "@/components/checkout/PointsSection";
import CouponSection from "@/components/checkout/CouponSection";

// 型定義
// キャラクターデータ型
type CharacterType = {
  id: string;
  name: string;
};

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
    characters: CharacterType[]; // 複数キャラクター対応
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
  const [validationErrors, setValidationErrors] = useState<{
    address?: string;
    paymentMethod?: string;
  }>({});

  // ポイントとクーポン関連の状態
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string>("");

  // Stripe関連の状態
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState(() => getStripe());

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

  // 最終的な合計金額（ポイントとクーポン適用後）
  const finalTotal = Math.max(0, total - pointsToUse - couponDiscount);

  // 注文ボタンが有効かどうか確認
  const isOrderButtonEnabled =
    cartItems.length > 0 &&
    selectedAddressId !== "" &&
    selectedPaymentMethodId !== "";

  // ポイント使用の処理
  const handlePointsUse = (amount: number) => {
    setPointsToUse(amount);
  };

  // クーポン適用の処理
  const handleCouponApply = (discountAmount: number, couponId: string) => {
    setCouponDiscount(discountAmount);
    setAppliedCouponId(couponId);
  };

  // Stripe追加認証処理
  const handleStripePaymentConfirmation = async (clientSecret: string) => {
    const stripe = await stripePromise;
    if (!stripe) {
      toast.error("決済処理の初期化に失敗しました");
      return false;
    }

    const { error, paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

    if (error) {
      toast.error(error.message || "決済確認に失敗しました");
      return false;
    }

    if (paymentIntent?.status === "succeeded") {
      return true;
    } else {
      toast.error(`決済状態が不正です: ${paymentIntent?.status}`);
      return false;
    }
  };

  // Amazon Pay処理
  const handleAmazonPay = async (amazonOrderReferenceId: string, billingAgreementId?: string) => {
    setIsProcessing(true);
    setError(undefined);
    setValidationErrors({});

    try {
      console.log('Amazon Pay処理開始:', { amazonOrderReferenceId, billingAgreementId });
      
      // APIリクエストを送信
      const response = await fetch("/api/payment-methods/amazon-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amazonOrderReferenceId,
          billingAgreementId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Amazon Payの処理中にエラーが発生しました"
        );
      }

      const result = await response.json();
      console.log('Amazon Pay情報取得成功:', result);

      // 住所と支払い方法を更新
      setAddresses([...addresses, result.address]);
      setPaymentMethods([...paymentMethods, result.paymentMethod]);
      setSelectedAddressId(result.address.id);
      setSelectedPaymentMethodId(result.paymentMethod.id);

      toast.success("Amazon Payの情報を取得しました");
    } catch (error) {
      console.error("Amazon Pay処理エラー:", error);
      setError("Amazon Payの処理中にエラーが発生しました");
      toast.error("Amazon Payの処理に失敗しました。別の支払い方法をお試しください。");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 住所を削除
  const handleDeleteAddress = async (addressId: string) => {
    setIsProcessing(true);
    setValidationErrors({});

    try {
      const response = await fetch("/api/addresses/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addressId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "お届け先の削除に失敗しました");
      }

      // 削除した住所をリストから削除
      const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);
      setAddresses(updatedAddresses);

      // 削除した住所が選択されていた場合は別のものを選択
      if (selectedAddressId === addressId && updatedAddresses.length > 0) {
        setSelectedAddressId(updatedAddresses[0].id);
      } else if (updatedAddresses.length === 0) {
        setSelectedAddressId("");
      }

      toast.success("お届け先を削除しました");
    } catch (error) {
      console.error("住所削除エラー:", error);
      toast.error(error instanceof Error ? error.message : "お届け先の削除に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  // 支払い方法を削除
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    setIsProcessing(true);
    setValidationErrors({});

    try {
      const response = await fetch("/api/payment-methods/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('支払い方法削除失敗:', errorData);
        throw new Error(errorData.message || "お支払い方法の削除に失敗しました");
      }

      // 削除した支払い方法をリストから削除
      const updatedPaymentMethods = paymentMethods.filter((pm) => pm.id !== paymentMethodId);
      setPaymentMethods(updatedPaymentMethods);

      // 削除した支払い方法が選択されていた場合は別のものを選択
      if (selectedPaymentMethodId === paymentMethodId && updatedPaymentMethods.length > 0) {
        setSelectedPaymentMethodId(updatedPaymentMethods[0].id);
      } else if (updatedPaymentMethods.length === 0) {
        setSelectedPaymentMethodId("");
      }

      toast.success("お支払い方法を削除しました");
    } catch (error) {
      console.error("支払い方法削除エラー:", error);
      toast.error(error instanceof Error ? error.message : "お支払い方法の削除に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  // 新しい住所を追加
  const handleAddAddress = async (addressData: any) => {
    setIsProcessing(true);
    setValidationErrors({});

    try {
      console.log('Submitting address data:', addressData);
      
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Address creation failed:', responseData);
        throw new Error(responseData.error || "住所の追加に失敗しました");
      }

      console.log('New address created:', responseData);

      // 住所リストを更新
      const updatedAddresses = addressData.isDefault
        ? addresses
            .map((addr) => ({ ...addr, isDefault: false }))
            .concat(responseData)
        : [...addresses, responseData];

      setAddresses(updatedAddresses);

      // 新しい住所を選択状態に
      setSelectedAddressId(responseData.id);

      // モーダルを閉じる
      setShowAddressModal(false);

      toast.success("お届け先を追加しました");
    } catch (error) {
      console.error("Address error:", error);
      toast.error(error instanceof Error ? error.message : "お届け先の追加に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  // 新しい支払い方法を追加
  const handleAddPaymentMethod = async (paymentData: any) => {
    setIsProcessing(true);
    setValidationErrors({});

    try {
      console.log('送信する支払い方法データ:', paymentData);
      
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

      const result = await response.json();
      console.log('新しい支払い方法が追加されました:', result);

      // 支払い方法リストを明示的に再取得する
      const updatedMethodsResponse = await fetch("/api/payment-methods/list");
      if (updatedMethodsResponse.ok) {
        const updatedMethodsData = await updatedMethodsResponse.json();
        console.log('最新の支払い方法一覧:', updatedMethodsData);
        
        // 支払い方法リストを更新
        setPaymentMethods(updatedMethodsData.paymentMethods || []);
        
        // 新しい支払い方法があれば自動的に選択
        if (updatedMethodsData.paymentMethods?.length > 0) {
          const newMethod = updatedMethodsData.paymentMethods.find(
            (pm: any) => pm.id === result.paymentMethod?.id
          );
          if (newMethod) {
            setSelectedPaymentMethodId(newMethod.id);
          }
        }
      } else {
        // APIから最新データが取得できない場合は、通常の方法でUIを更新
        const newPaymentMethod = result.paymentMethod;
        
        // 支払い方法リストを更新
        const updatedPaymentMethods = paymentData.isDefault
          ? paymentMethods
              .map((pm) => ({ ...pm, isDefault: false }))
              .concat(newPaymentMethod)
          : [...paymentMethods, newPaymentMethod];

        setPaymentMethods(updatedPaymentMethods);

        // 新しい支払い方法を選択状態に
        setSelectedPaymentMethodId(newPaymentMethod.id);
      }

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
    // 入力検証
    const errors: {
      address?: string;
      paymentMethod?: string;
    } = {};

    if (!selectedAddressId) {
      errors.address = "お届け先を選択してください";
    }

    if (!selectedPaymentMethodId) {
      errors.paymentMethod = "お支払い方法を選択してください";
    }

    // エラーがある場合は処理を中止
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // エラーメッセージをトースト表示
      if (errors.address) toast.error(errors.address);
      if (errors.paymentMethod) toast.error(errors.paymentMethod);
      
      return;
    }

    setIsProcessing(true);
    setError(undefined);
    setValidationErrors({});

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

      console.log("注文処理開始: ", {
        addressId: selectedAddressId,
        paymentMethodId: selectedPaymentMethodId,
        deliveryDate,
        deliveryTimeSlot: selectedTime !== "希望時間帯なし" ? selectedTime : null,
        items: orderItems.length,
        usedPoints: pointsToUse,
        appliedCouponId: appliedCouponId || undefined,
        subtotal,
        shippingFee,
        tax,
        total,
        finalTotal
      });

      const response = await axios.post("/api/orders", {
        addressId: selectedAddressId,
        paymentMethodId: selectedPaymentMethodId,
        deliveryDate: deliveryDate,
        deliveryTimeSlot: selectedTime !== "希望時間帯なし" ? selectedTime : null,
        items: orderItems,
        usedPoints: pointsToUse,
        appliedCouponId: appliedCouponId || undefined,
        subtotal: subtotal,
        shippingFee: shippingFee,
        tax: tax,
        total: total,
      });

      // 3Dセキュア認証など追加認証が必要な場合の処理
      if (response.data.requiresAction && response.data.clientSecret) {
        toast.info("カード認証を完了してください");
        
        // 追加認証処理を実行
        const confirmResult = await handleStripePaymentConfirmation(response.data.clientSecret);
        
        if (!confirmResult) {
          throw new Error("カード認証に失敗しました");
        }
      }

      // 購入処理成功
      router.push(`/checkout/thanks`);
      toast.success("ご注文ありがとうございます！");
      
    } catch (error) {
      console.error("Order error:", error);
      setError(error instanceof Error ? error.message : "注文処理中にエラーが発生しました");
      toast.error(error instanceof Error ? error.message : "注文の確定に失敗しました");
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
              onDelete={handleDeleteAddress}
              isProcessing={isProcessing}
            />

            {/* お支払い方法セクション */}
            <PaymentMethodSection
              paymentMethods={paymentMethods}
              selectedPaymentMethodId={selectedPaymentMethodId}
              onPaymentMethodSelect={setSelectedPaymentMethodId}
              onAddNew={() => setShowPaymentMethodModal(true)}
              onDelete={handleDeletePaymentMethod}
              isProcessing={isProcessing}
            />

            {/* ポイント使用セクション */}
            <PointsSection
              totalAmount={total}
              onPointsUse={handlePointsUse}
            />

            {/* クーポン適用セクション */}
            <CouponSection
              subtotal={subtotal}
              onCouponApply={handleCouponApply}
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
              pointsDiscount={pointsToUse}
              couponDiscount={couponDiscount}
              finalTotal={finalTotal}
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
          <Elements stripe={getStripe()}>
              <PaymentMethodModal
                onClose={() => setShowPaymentMethodModal(false)}
                onSubmit={handleAddPaymentMethod}
                  isProcessing={isProcessing}
                />
              </Elements>
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

    return {
      props: {
        cartItems: cartItemsWithFormattedCharacters,
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
