import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/auth-context";

const LoginPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user, error } = useAuth();
  const router = useRouter();

  // 既にログインしている場合はリダイレクト
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // 認証エラーメッセージの表示
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // エラーメッセージをクリア
    setErrorMessage("");
    
    // 入力検証
    if (!email || !password) {
      setErrorMessage("メールアドレスとパスワードを入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await login(email, password, rememberMe);
      
      if (success) {
        // ログイン成功したらホームページにリダイレクト
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("ログイン処理中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>ログイン | DumDumb</title>
        <meta name="description" content="DumDumbへのログイン" />
      </Head>
      <div className="relative min-h-[calc(100vh-72px)] flex flex-col items-center justify-start px-4 py-24">
        <div className="w-full max-w-md mb-12 md:mb-0">
          <h1 className="text-2xl font-bold text-center mb-8">
            dumdumbアカウントにログイン
          </h1>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
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
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
                disabled={isSubmitting}
                autoComplete="username email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                パスワード
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  ログイン情報を保存する
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-orange-500 hover:text-orange-600"
                >
                  パスワードをお忘れですか？
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">または</p>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <span className="text-sm text-gray-600 mr-2">
              アカウントをお持ちでない方は
            </span>
            <Link
              href="/auth/register"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              新規登録
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

export default LoginPage;
