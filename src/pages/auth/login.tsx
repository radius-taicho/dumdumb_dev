import React, { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

const LoginPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ログイン処理をここに実装
    console.log("Login attempt with:", { email, password, rememberMe });
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
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
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
            >
              ログイン
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
