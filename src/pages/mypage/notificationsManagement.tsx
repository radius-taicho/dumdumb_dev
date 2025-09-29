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
        setIsLoading(true);
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
        toast.error("設定の読み込みに失敗しました");
      } finally {
        setIsLoading(false);
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
    { id: "points", name: "ポイント獲得・失効", checked: true }, // 追加
    { id: "coupons", name: "クーポン発行・期限", checked: true }, // 追加
  ]);

  // ポイント通知設定
  const [pointsNotificationSettings, setPointsNotificationSettings] = useState({
    pointsEarned: true,
    pointsExpiring: true,
    daysBeforeExpiryNotice: 14, // 失効何日前に通知するか
  });

  // クーポン通知設定
  const [couponNotificationSettings, setCouponNotificationSettings] = useState({
    couponIssued: true,
    couponExpiring: true,
    daysBeforeExpiryNotice: 7, // 失効何日前に通知するか
  });

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

  // ポイント設定変更ハンドラー
  const handlePointsSettingChange = (setting: keyof typeof pointsNotificationSettings) => {
    setPointsNotificationSettings(prev => ({
      ...prev,
      [setting]: typeof prev[setting] === 'boolean' ? !prev[setting] : prev[setting]
    }));
  };

  // クーポン設定変更ハンドラー
  const handleCouponSettingChange = (setting: keyof typeof couponNotificationSettings) => {
    setCouponNotificationSettings(prev => ({
      ...prev,
      [setting]: typeof prev[setting] === 'boolean' ? !prev[setting] : prev[setting]
    }));
  };

  // 日数選択変更ハンドラー
  const handleDaysChange = (type: 'points' | 'coupons', days: number) => {
    if (type === 'points') {
      setPointsNotificationSettings(prev => ({
        ...prev,
        daysBeforeExpiryNotice: days
      }));
    } else {
      setCouponNotificationSettings(prev => ({
        ...prev,
        daysBeforeExpiryNotice: days
      }));
    }
  };

  // 設定を保存する関数
  const saveSettings = async () => {
    if (!session?.user?.id) {
      toast.error("ログインが必要です");
      return;
    }

    try {
      setIsLoading(true);
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
          pointsNotificationSettings,
          couponNotificationSettings,
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>通知設定 | DumDumb</title>
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
        <h1 className="text-2xl font-bold mb-6 sm:mb-8">通知設定</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
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

                {/* ポイント通知設定 */}
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 mt-6">
                  ポイント通知設定
                </h2>
                <div className="border rounded-lg p-3 sm:p-4">
                  <div className="mb-3 pb-3 border-b">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-purple-500 rounded"
                        checked={pointsNotificationSettings.pointsEarned}
                        onChange={() => handlePointsSettingChange('pointsEarned')}
                        disabled={!categories.find(c => c.id === 'points')?.checked || !receiveAllNotifications}
                      />
                      <span
                        className={`ml-2 text-sm sm:text-base ${
                          !categories.find(c => c.id === 'points')?.checked || !receiveAllNotifications ? "text-gray-400" : ""
                        }`}
                      >
                        ポイント獲得時に通知する
                      </span>
                    </label>
                  </div>
                  <div className="mb-3 pb-3 border-b">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-purple-500 rounded"
                        checked={pointsNotificationSettings.pointsExpiring}
                        onChange={() => handlePointsSettingChange('pointsExpiring')}
                        disabled={!categories.find(c => c.id === 'points')?.checked || !receiveAllNotifications}
                      />
                      <span
                        className={`ml-2 text-sm sm:text-base ${
                          !categories.find(c => c.id === 'points')?.checked || !receiveAllNotifications ? "text-gray-400" : ""
                        }`}
                      >
                        ポイント失効前に通知する
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ポイント失効通知タイミング
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                      value={pointsNotificationSettings.daysBeforeExpiryNotice}
                      onChange={(e) => handleDaysChange('points', Number(e.target.value))}
                      disabled={!pointsNotificationSettings.pointsExpiring || !categories.find(c => c.id === 'points')?.checked || !receiveAllNotifications}
                    >
                      <option value={7}>失効7日前</option>
                      <option value={14}>失効14日前</option>
                      <option value={30}>失効30日前</option>
                    </select>
                  </div>
                </div>

                {/* クーポン通知設定 */}
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 mt-6">
                  クーポン通知設定
                </h2>
                <div className="border rounded-lg p-3 sm:p-4">
                  <div className="mb-3 pb-3 border-b">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-orange-500 rounded"
                        checked={couponNotificationSettings.couponIssued}
                        onChange={() => handleCouponSettingChange('couponIssued')}
                        disabled={!categories.find(c => c.id === 'coupons')?.checked || !receiveAllNotifications}
                      />
                      <span
                        className={`ml-2 text-sm sm:text-base ${
                          !categories.find(c => c.id === 'coupons')?.checked || !receiveAllNotifications ? "text-gray-400" : ""
                        }`}
                      >
                        クーポン発行時に通知する
                      </span>
                    </label>
                  </div>
                  <div className="mb-3 pb-3 border-b">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-orange-500 rounded"
                        checked={couponNotificationSettings.couponExpiring}
                        onChange={() => handleCouponSettingChange('couponExpiring')}
                        disabled={!categories.find(c => c.id === 'coupons')?.checked || !receiveAllNotifications}
                      />
                      <span
                        className={`ml-2 text-sm sm:text-base ${
                          !categories.find(c => c.id === 'coupons')?.checked || !receiveAllNotifications ? "text-gray-400" : ""
                        }`}
                      >
                        クーポン失効前に通知する
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      クーポン失効通知タイミング
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                      value={couponNotificationSettings.daysBeforeExpiryNotice}
                      onChange={(e) => handleDaysChange('coupons', Number(e.target.value))}
                      disabled={!couponNotificationSettings.couponExpiring || !categories.find(c => c.id === 'coupons')?.checked || !receiveAllNotifications}
                    >
                      <option value={3}>失効3日前</option>
                      <option value={7}>失効7日前</option>
                      <option value={14}>失効14日前</option>
                    </select>
                  </div>
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

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">
                    メール配信について
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    メール通知には SendGrid を使用しています。重要な通知をお見逃しなく受け取るために、
                    no-reply@dumdumb.example.com からのメールを受信できるようにしてください。
                  </p>
                  <p className="text-sm text-gray-600">
                    迷惑メールフォルダに振り分けられる場合は、メールアドレスを連絡先に追加するか、
                    「迷惑メールではない」と設定してください。
                  </p>
                </div>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="flex justify-center md:justify-end">
              <button
                className={`
                  bg-orange-500 text-white py-2 px-6 rounded-full 
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 
                  transition-colors
                  ${isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-orange-600'
                  }
                `}
                onClick={saveSettings}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                ) : "設定を保存"}
              </button>
            </div>
          </>
        )}
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
