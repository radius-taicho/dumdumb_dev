import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

// カテゴリータイプの定義
type Category = {
  id: string;
  name: string;
  checked: boolean;
};

const NotificationsManagementPage: NextPage = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // 初期設定を取得
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/notifications/settings");
        if (response.ok) {
          const data = await response.json();

          // データがあれば設定を更新
          if (data) {
            setReceiveAllNotifications(data.receiveAllNotifications);
            setReceiveSiteNotifications(data.receiveSiteNotifications);
            setReceiveEmailNotifications(data.receiveEmailNotifications);
            setNotificationFrequency(data.notificationFrequency);

            // カテゴリー設定の更新
            if (data.categorySettings) {
              setCategories((prevCategories) =>
                prevCategories.map((category) => ({
                  ...category,
                  checked:
                    data.categorySettings[category.id] ?? category.checked,
                }))
              );
            }
          }
        }
      } catch (error) {
        console.error("通知設定の取得に失敗しました:", error);
      }
    };

    fetchSettings();
  }, [session]);
  // 通知内容の設定状態
  const [receiveAllNotifications, setReceiveAllNotifications] = useState(true);

  // 通知方法の設定状態
  const [receiveSiteNotifications, setReceiveSiteNotifications] =
    useState(true);
  const [receiveEmailNotifications, setReceiveEmailNotifications] =
    useState(true);

  // 通知頻度の設定状態
  const [notificationFrequency, setNotificationFrequency] = useState<
    "realtime" | "daily" | "weekly"
  >("realtime");

  // カテゴリー別設定
  const [categories, setCategories] = useState<Category[]>([
    { id: "series", name: "シリーズ", checked: true },
    { id: "character", name: "キャラクター", checked: true },
    { id: "waiting", name: "入荷待ちアイテム", checked: true },
  ]);

  // カテゴリーのチェック状態を変更する関数
  const handleCategoryChange = (id: string) => {
    setCategories(
      categories.map((category) =>
        category.id === id
          ? { ...category, checked: !category.checked }
          : category
      )
    );
  };

  // 設定を保存する関数
  const saveSettings = async () => {
    try {
      const response = await fetch("/api/notifications/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiveAllNotifications,
          receiveEmailNotifications,
          receiveSiteNotifications,
          notificationFrequency,
          categorySettings: categories.reduce((acc, category) => {
            acc[category.id] = category.checked;
            return acc;
          }, {}),
        }),
      });

      if (response.ok) {
        toast.success("通知設定を保存しました");
      } else {
        toast.error("設定の保存に失敗しました");
      }
    } catch (error) {
      console.error("通知設定保存エラー:", error);
      toast.error("設定の保存中にエラーが発生しました");
    }
  };

  return (
    <>
      <Head>
        <title>通知管理 | DumDumb</title>
        <meta name="description" content="DumDumbの通知管理設定" />
      </Head>
      <div className="container min-h-[calc(100vh-72px)] mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/mypage" className="mr-2">
            <span className="text-gray-500 hover:text-gray-700">
              &lt; マイページに戻る
            </span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6 sm:mb-8">通知管理</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* 通知内容 */}
          <div className="w-full">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              通知内容
            </h2>
            <div className="mb-4 sm:mb-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-orange-500 rounded"
                  checked={receiveAllNotifications}
                  onChange={() =>
                    setReceiveAllNotifications(!receiveAllNotifications)
                  }
                />
                <span className="ml-2 text-sm sm:text-base">
                  dumdumbからのすべてのお知らせを受け取る
                </span>
              </label>
            </div>

            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              カテゴリー別設定
            </h2>
            <div className="border rounded-lg p-3 sm:p-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-b-0"
                >
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-orange-500 rounded"
                      checked={category.checked}
                      onChange={() => handleCategoryChange(category.id)}
                      disabled={!receiveAllNotifications}
                    />
                    <span
                      className={`ml-2 text-sm sm:text-base ${
                        !receiveAllNotifications ? "text-gray-400" : ""
                      }`}
                    >
                      {category.name}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 通知方法 */}
          <div className="w-full">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              通知方法
            </h2>
            <div className="mb-1 sm:mb-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-orange-500 rounded"
                  checked={receiveSiteNotifications}
                  onChange={() =>
                    setReceiveSiteNotifications(!receiveSiteNotifications)
                  }
                />
                <span className="ml-2 text-sm sm:text-base">
                  サイト内で通知を受け取る
                </span>
              </label>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 ml-6 sm:ml-7">
              ※ONにするとサイト内の通知ボックスに表示されます
            </p>

            <div className="mb-4 sm:mb-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-orange-500 rounded"
                  checked={receiveEmailNotifications}
                  onChange={() =>
                    setReceiveEmailNotifications(!receiveEmailNotifications)
                  }
                />
                <span className="ml-2 text-sm sm:text-base">
                  自分のメールアドレスで通知を受け取る
                </span>
              </label>
            </div>

            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              通知頻度
            </h2>
            <div className="space-y-3 sm:space-y-4 flex flex-col">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-orange-500"
                  name="notificationFrequency"
                  value="realtime"
                  checked={notificationFrequency === "realtime"}
                  onChange={() => setNotificationFrequency("realtime")}
                  disabled={
                    !receiveSiteNotifications && !receiveEmailNotifications
                  }
                />
                <span
                  className={`ml-2 text-sm sm:text-base ${
                    !receiveSiteNotifications && !receiveEmailNotifications
                      ? "text-gray-400"
                      : ""
                  }`}
                >
                  リアルタイム
                </span>
              </label>

              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-orange-500"
                  name="notificationFrequency"
                  value="daily"
                  checked={notificationFrequency === "daily"}
                  onChange={() => setNotificationFrequency("daily")}
                  disabled={
                    !receiveSiteNotifications && !receiveEmailNotifications
                  }
                />
                <span
                  className={`ml-2 text-sm sm:text-base ${
                    !receiveSiteNotifications && !receiveEmailNotifications
                      ? "text-gray-400"
                      : ""
                  }`}
                >
                  1日に一度（20時）
                </span>
              </label>

              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-orange-500"
                  name="notificationFrequency"
                  value="weekly"
                  checked={notificationFrequency === "weekly"}
                  onChange={() => setNotificationFrequency("weekly")}
                  disabled={
                    !receiveSiteNotifications && !receiveEmailNotifications
                  }
                />
                <span
                  className={`ml-2 text-sm sm:text-base ${
                    !receiveSiteNotifications && !receiveEmailNotifications
                      ? "text-gray-400"
                      : ""
                  }`}
                >
                  週に一度のダイジェスト（金曜日）
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-center md:justify-end">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors"
            onClick={saveSettings}
          >
            設定を保存
          </button>
        </div>
      </div>

      {/* キャラクターイメージ */}
      <div className="fixed bottom-4 right-0 transform translate-x-1/2 hover:translate-x-0 transition-transform duration-300">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 border-gray-300 rounded-full flex items-center justify-center bg-white shadow-md">
          <span className="text-xs text-gray-400">キャラクター</span>
        </div>
      </div>
    </>
  );
};

export default NotificationsManagementPage;
