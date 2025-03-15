import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const MyPagePage: NextPage = () => {
  // 実際はここでユーザーデータを取得します
  const user = {
    id: "1",
    name: "ユーザー名",
    email: "user@example.com",
    lastLogin: "2023-03-15",
  };

  const [isScrolled, setIsScrolled] = useState(false);

  // スクロールイベントのリスナー
  useEffect(() => {
    const handleScroll = () => {
      // スクロール位置に応じてisScrolledの状態を更新
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // イベントリスナーを追加
    window.addEventListener("scroll", handleScroll);

    // クリーンアップ関数
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Head>
        <title>マイページ | DumDumb</title>
        <meta name="description" content="DumDumbのマイページ" />
      </Head>

      <div className="relative overflow-x-hidden">
        {/* メインコンテンツ */}
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-72px)]">
          <h1 className="text-3xl font-bold mb-8 text-start">マイページ</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* お買い物履歴 */}
            <Link href="/mypage/orders" className="block">
              <div className="border rounded-lg p-4 md:p-6 h-32 md:h-40 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <h2 className="text-lg md:text-xl font-semibold text-center">
                  お買い物履歴
                </h2>
              </div>
            </Link>

            {/* 通知管理 */}
            <Link href="/mypage/notificationsManagement" className="block">
              <div className="border rounded-lg p-4 md:p-6 h-32 md:h-40 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <h2 className="text-lg md:text-xl font-semibold text-center">
                  通知管理
                </h2>
              </div>
            </Link>

            {/* 気になっているアイテム */}
            <Link href="/mypage/interested" className="block">
              <div className="border rounded-lg p-4 md:p-6 h-32 md:h-40 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <h2 className="text-lg md:text-xl font-semibold text-center">
                  気になっているアイテム
                </h2>
              </div>
            </Link>

            {/* アカウント情報管理 */}
            <Link href="/mypage/settings" className="block">
              <div className="border rounded-lg p-4 md:p-6 h-32 md:h-40 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <h2 className="text-lg md:text-xl font-semibold text-center">
                  アカウント情報管理
                </h2>
              </div>
            </Link>

            {/* お届け先 */}
            <Link href="/mypage/delivery-addresses" className="block">
              <div className="border rounded-lg p-4 md:p-6 h-32 md:h-40 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <h2 className="text-lg md:text-xl font-semibold text-center">
                  お届け先
                </h2>
              </div>
            </Link>

            {/* お支払い先 */}
            <Link href="/mypage/payment-methods" className="block">
              <div className="border rounded-lg p-4 md:p-6 h-32 md:h-40 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <h2 className="text-lg md:text-xl font-semibold text-center">
                  お支払い先
                </h2>
              </div>
            </Link>

            {/* dumdumbクーポン&ポイント */}
            <Link href="/mypage/coupons-points" className="block">
              <div className="border rounded-lg p-4 md:p-6 h-32 md:h-40 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <h2 className="text-lg md:text-xl font-semibold text-center">
                  dumdumbクーポン&ポイント
                </h2>
              </div>
            </Link>

            {/* アカウント連携 */}
            <Link href="/mypage/account-connections" className="block">
              <div className="border rounded-lg p-4 md:p-6 h-32 md:h-40 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <h2 className="text-lg md:text-xl font-semibold text-center">
                  アカウント連携
                </h2>
              </div>
            </Link>

            {/* ご要望 */}
            <Link href="/mypage/requests" className="block">
              <div className="border rounded-lg p-4 md:p-6 h-32 md:h-40 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <h2 className="text-lg md:text-xl font-semibold text-center">
                  ご要望
                </h2>
              </div>
            </Link>
          </div>
        </div>

        {/* キャラクターイメージ */}
        <div
          className={`fixed bottom-0 right-0 transform transition-transform duration-200 ${
            isScrolled
              ? "translate-x-full"
              : "translate-x-1/2 hover:translate-x-0"
          }`}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-gray-300 rounded-full flex items-center justify-center bg-white shadow-md">
            <span className="text-xs text-gray-400">キャラクター</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPagePage;
