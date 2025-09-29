import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { toast } from "react-hot-toast";

// 通知タイプの定義
type NotificationType =
  | "new-item"
  | "price-change"
  | "announcement"
  | "sale"
  | "POINTS_EARNED"
  | "POINTS_EXPIRING"
  | "COUPON_ISSUED"
  | "COUPON_EXPIRING"
  | "PRODUCT_RESTOCK"
  | "ORDER_STATUS";

// 通知データの型定義
interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
  type: NotificationType;
  meta?: any;
}

const NotificationsPage: NextPage = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");

  // 通知データを取得
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(
            data.map((notification: any) => ({
              ...notification,
              date: new Date(notification.createdAt).toLocaleDateString("ja-JP"),
              read: notification.isRead,
            }))
          );
        } else {
          toast.error("通知の取得に失敗しました");
        }
      } catch (error) {
        console.error("通知取得エラー:", error);
        toast.error("通知の読み込み中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [session]);

  // 通知フィルター
  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.read);

  // 通知を既読にする
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });

      if (response.ok) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
      } else {
        toast.error("通知の既読設定に失敗しました");
      }
    } catch (error) {
      console.error("通知既読設定エラー:", error);
      toast.error("通知の既読設定中にエラーが発生しました");
    }
  };

  // すべて既読にする
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/read-all`, {
        method: "POST",
      });

      if (response.ok) {
        setNotifications(
          notifications.map((notification) => ({ ...notification, read: true }))
        );
        toast.success("すべての通知を既読にしました");
      } else {
        toast.error("通知の一括既読設定に失敗しました");
      }
    } catch (error) {
      console.error("通知一括既読設定エラー:", error);
      toast.error("通知の一括既読設定中にエラーが発生しました");
    }
  };

  // 未読通知数をカウント
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 通知アイコンと色を取得する関数
  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case "POINTS_EARNED":
        return {
          icon: "🎁",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          textColor: "text-purple-800",
          linkColor: "text-purple-600",
          linkText: "ポイント履歴を見る",
          linkUrl: "/mypage/coupons-points?tab=points",
        };
      case "POINTS_EXPIRING":
        return {
          icon: "⚠️",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          linkColor: "text-red-600",
          linkText: "ポイントを使う",
          linkUrl: "/products",
        };
      case "COUPON_ISSUED":
        return {
          icon: "🎫",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-800",
          linkColor: "text-orange-600",
          linkText: "クーポンを見る",
          linkUrl: "/mypage/coupons-points?tab=coupons",
        };
      case "COUPON_EXPIRING":
        return {
          icon: "⏰",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-800",
          linkColor: "text-amber-600",
          linkText: "クーポンを使う",
          linkUrl: "/products",
        };
      case "PRODUCT_RESTOCK":
      case "new-item":
        return {
          icon: "🆕",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          linkColor: "text-green-600",
          linkText: "詳細を見る",
          linkUrl: notification.meta?.productId
            ? `/product/${notification.meta.productId}`
            : "/products",
        };
      case "price-change":
        return {
          icon: "💰",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          linkColor: "text-blue-600",
          linkText: "詳細を見る",
          linkUrl: "/",
        };
      case "sale":
        return {
          icon: "🏷️",
          bgColor: "bg-pink-50",
          borderColor: "border-pink-200",
          textColor: "text-pink-800",
          linkColor: "text-pink-600",
          linkText: "詳細を見る",
          linkUrl: "/",
        };
      case "ORDER_STATUS":
        return {
          icon: "📦",
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-200",
          textColor: "text-indigo-800",
          linkColor: "text-indigo-600",
          linkText: "注文詳細を見る",
          linkUrl: notification.meta?.orderId
            ? `/mypage/orders/${notification.meta.orderId}`
            : "/mypage/orders",
        };
      default:
        return {
          icon: "📢",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          linkColor: "text-gray-600",
          linkText: "詳細を見る",
          linkUrl: "/",
        };
    }
  };

  // 特別な通知コンポーネント（ポイント、クーポン用）
  const renderSpecialNotification = (notification: Notification) => {
    const { type, meta } = notification;
    
    if (type === "POINTS_EARNED" && meta?.points) {
      return (
        <div className="mt-3 py-2 px-3 bg-purple-50 rounded-md">
          <div className="flex items-center">
            <span className="text-xl mr-2">🎁</span>
            <span className="font-semibold text-purple-700">
              {meta.points.toLocaleString()}ポイント獲得
            </span>
          </div>
          {meta.orderId && (
            <p className="text-sm text-gray-600 mt-1">
              注文 #{meta.orderId.slice(-6)} に対するポイント付与
            </p>
          )}
        </div>
      );
    }
    
    if (type === "COUPON_ISSUED" && meta?.couponCode) {
      const discountText = meta.discountType === "percentage"
        ? `${meta.discountValue}%オフ`
        : `${meta.discountValue.toLocaleString()}円オフ`;
      
      return (
        <div className="mt-3 py-2 px-3 bg-orange-50 rounded-md border border-dashed border-orange-300">
          <div className="flex items-center">
            <span className="text-xl mr-2">🎫</span>
            <span className="font-semibold text-orange-700">
              {discountText}クーポン
            </span>
          </div>
          <div className="mt-1 bg-white px-2 py-1 rounded text-center">
            <span className="font-mono font-semibold tracking-wider text-orange-600">
              {meta.couponCode}
            </span>
          </div>
          {meta.expiryDate && (
            <p className="text-xs text-gray-600 mt-1">
              有効期限: {new Date(meta.expiryDate).toLocaleDateString("ja-JP")}
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <Head>
        <title>通知管理 | DumDumb</title>
        <meta name="description" content="DumDumbの通知管理" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">通知管理</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* サイドバー */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <nav className="flex flex-col">
                <Link
                  href="/mypage"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3"
                >
                  マイページトップ
                </Link>
                <Link
                  href="/mypage/orders"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3"
                >
                  お買い物履歴
                </Link>
                <Link
                  href="/mypage/interested"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3"
                >
                  気になるアイテム
                </Link>
                <Link
                  href="/mypage/favorites-cart"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3"
                >
                  お気に入り・カート
                </Link>
                <Link
                  href="/mypage/notifications"
                  className="text-indigo-600 bg-indigo-50 font-medium px-4 py-3 border-l-4 border-indigo-600"
                >
                  通知管理
                </Link>
                <Link
                  href="/mypage/coupons-points"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3"
                >
                  クーポン・ポイント
                </Link>
                <Link
                  href="/mypage/settings"
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3"
                >
                  アカウント設定
                </Link>
              </nav>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">通知</h2>
                <div className="flex items-center space-x-4">
                  <div>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">すべての通知</option>
                      <option value="unread">未読のみ ({unreadCount})</option>
                      <option value="read">既読のみ</option>
                    </select>
                  </div>
                  <button
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    onClick={markAllAsRead}
                  >
                    すべて既読にする
                  </button>
                </div>
              </div>

              {/* 通知設定リンク */}
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">通知設定</h3>
                  <Link
                    href="/mypage/notificationsManagement"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    詳細設定
                  </Link>
                </div>
              </div>

              {/* 通知リスト */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => {
                    const style = getNotificationStyle(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`border rounded-md p-4 ${
                          !notification.read
                            ? `${style.bgColor} ${style.borderColor}`
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <span className="text-xl mr-2">{style.icon}</span>
                            <div>
                              <h3
                                className={`font-medium ${
                                  !notification.read ? style.textColor : ""
                                }`}
                              >
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.date}
                              </p>
                            </div>
                          </div>
                          {!notification.read && (
                            <button
                              className="text-indigo-600 hover:text-indigo-800 text-sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              既読にする
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-gray-700">
                          {notification.content}
                        </p>
                        
                        {/* 特別な通知表示（ポイント・クーポン） */}
                        {renderSpecialNotification(notification)}
                        
                        <div className="mt-3">
                          <Link
                            href={style.linkUrl}
                            className={`${style.linkColor} hover:underline text-sm font-medium`}
                          >
                            {style.linkText} →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {filter === "unread"
                      ? "未読の通知はありません"
                      : filter === "read"
                      ? "既読の通知はありません"
                      : "通知はありません"}
                  </p>
                </div>
              )}

              {/* ページネーション */}
              {filteredNotifications.length > 10 && (
                <div className="mt-6 flex justify-center">
                  <nav className="inline-flex rounded-md shadow">
                    <a
                      href="#"
                      className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      前へ
                    </a>
                    <a
                      href="#"
                      className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="px-3 py-2 border-t border-b border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600"
                    >
                      2
                    </a>
                    <a
                      href="#"
                      className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      3
                    </a>
                    <a
                      href="#"
                      className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      次へ
                    </a>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
