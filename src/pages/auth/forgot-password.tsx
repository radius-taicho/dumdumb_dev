import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/auth-context";

const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // 既にログインしている場合はリダイレクト
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // エラーメッセージとサクセスメッセージをクリア
    setErrorMessage("");
    setSuccessMessage("");

    // 入力検証
    if (!email) {
      setErrorMessage("メールアドレスを入力してください");
      return;
    }

    try {
      setIsSubmitting(true);

      // APIエンドポイントを呼び出し
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "リセット処理中にエラーが発生しました");
        return;
      }

      // 成功メッセージを表示
      setSuccessMessage(
        data.message ||
          `パスワードリセット手順をメールで送信しました。メールをご確認ください。`
      );
      setEmail(""); // フォームをクリア
    } catch (err) {
      console.error("Password reset error:", err);
      setErrorMessage(
        "リセット処理中にエラーが発生しました。再度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>パスワードをお忘れの方 | DumDumb</title>
        <meta name="description" content="DumDumbのパスワードリセット" />
      </Head>
      <div className="relative min-h-[calc(100vh-72px)] flex flex-col items-center justify-start px-4 py-24">
        <div className="w-full max-w-md mb-12 md:mb-0">
          <h1 className="text-2xl font-bold text-center mb-8">
            パスワードをお忘れの方
          </h1>

          <p className="text-sm text-gray-600 text-left">
            アカウントに登録したメールアドレスを入力してください。
          </p>
          <p className="text-sm text-gray-600 text-left mb-6">
            パスワードリセットの手順をメールでお送りします。
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "送信中..." : "リセットリンクを送信"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">または</p>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <Link
              href="/auth/login"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              ログインページに戻る
            </Link>
          </div>
        </div>

        {/* イラスト部分 - レスポンシブに対応 */}
        <div className="hidden md:block absolute md:right-8 lg:right-16 md:bottom-8 lg:bottom-16">
          <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs md:text-sm text-gray-500">イラスト</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
