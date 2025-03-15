import React, { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const RegisterPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("パスワードが一致しません");
      return false;
    }

    if (password.length < 8) {
      setPasswordError("パスワードは8文字以上必要です");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // パスワード検証
    if (!validatePassword()) {
      return;
    }

    // 新規登録処理をここに実装
    console.log("Register attempt with:", { email, password });
  };

  return (
    <>
      <Head>
        <title>アカウント作成 | DumDumb</title>
        <meta name="description" content="DumDumbアカウントの新規作成" />
      </Head>
      <div className="relative min-h-[calc(100vh-72px)] flex flex-col items-center justify-start px-4 py-24">
        <div className="w-full max-w-md mb-12 md:mb-0">
          <h1 className="text-2xl font-bold text-center mb-8">
            dumdumbアカウントを作成
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
              <p className="mt-1 text-xs text-gray-500">
                半角英数字記号8文字以上
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                パスワード（確認）
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-500">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
            >
              アカウント作成
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">または</p>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <span className="text-sm text-gray-600 mr-2">
              すでにアカウントをお持ちの方は
            </span>
            <Link
              href="/auth/login"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              ログイン
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

export default RegisterPage;
