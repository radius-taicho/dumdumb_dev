import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react"; 
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const ResetPasswordPage: NextPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValidating, setIsTokenValidating] = useState(true);

  const { data: session, status } = useSession();
  const router = useRouter();

  // パスワード要件チェック
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // パスワード強度計算（0-4のスケール）
  const passwordStrength = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasDigit,
    hasSpecialChar,
  ].filter(Boolean).length;

  // パスワード強度のラベルとカラー
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { text: "入力してください", color: "bg-gray-200" };
    if (passwordStrength <= 2) return { text: "弱い", color: "bg-red-500" };
    if (passwordStrength <= 3) return { text: "普通", color: "bg-yellow-500" };
    if (passwordStrength <= 4) return { text: "強い", color: "bg-green-500" };
    return { text: "非常に強い", color: "bg-green-600" };
  };

  const strengthLabel = getStrengthLabel();

  // URLからトークンを取得
  useEffect(() => {
    if (router.isReady) {
      const { token: queryToken } = router.query;
      if (typeof queryToken === 'string') {
        setToken(queryToken);
        validateToken(queryToken);
      } else {
        setTokenValid(false);
        setIsTokenValidating(false);
      }
    }
  }, [router.isReady, router.query]);

  // 既にログインしている場合はリダイレクト
  useEffect(() => {
    if (status === 'authenticated') {
      router.push("/");
    }
  }, [status, router]);

  // トークン検証
  const validateToken = async (token: string) => {
    try {
      setIsTokenValidating(true);
      const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
      
      if (!response.ok) {
        setTokenValid(false);
        setErrorMessage("パスワードリセットリンクが無効または期限切れです。新しいリンクをリクエストしてください。");
      } else {
        setTokenValid(true);
      }
    } catch (err) {
      console.error("Token validation error:", err);
      setTokenValid(false);
      setErrorMessage("トークン検証中にエラーが発生しました。再度お試しください。");
    } finally {
      setIsTokenValidating(false);
    }
  };

  const validatePassword = () => {
    // パスワードの一致確認
    if (password !== confirmPassword) {
      setErrorMessage("パスワードが一致しません");
      return false;
    }

    // パスワード強度の検証
    if (passwordStrength < 3) {
      setErrorMessage("パスワードの要件を満たしていません");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  // 新しいパスワード設定の送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // エラーメッセージとサクセスメッセージをクリア
    setErrorMessage("");
    setSuccessMessage("");
    
    // トークンがない場合はエラー
    if (!token) {
      setErrorMessage("無効なパスワードリセットリンクです");
      return;
    }

    // パスワード検証
    if (!validatePassword()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // APIエンドポイントを呼び出し
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "パスワードリセット中にエラーが発生しました");
        return;
      }
      
      // 成功メッセージを表示
      toast.success("パスワードが正常にリセットされました");
      setSuccessMessage(data.message || "パスワードが正常にリセットされました。新しいパスワードでログインしてください。");
      setPassword("");
      setConfirmPassword("");
      
      // 5秒後にログインページにリダイレクト
      setTimeout(() => {
        router.push("/auth/login");
      }, 5000);
      
    } catch (err) {
      console.error("Password reset error:", err);
      setErrorMessage("パスワードリセット中にエラーが発生しました。再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 要件表示用のコンポーネント
  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center space-x-2">
      {met ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      )}
      <span className={`text-xs ${met ? "text-green-600" : "text-gray-600"}`}>
        {text}
      </span>
    </div>
  );

  // トークン検証中のローディング表示
  if (isTokenValidating) {
    return (
      <>
        <Head>
          <title>パスワードリセット | DumDumb</title>
          <meta name="description" content="DumDumbのパスワードリセット" />
        </Head>
        <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">リセットリンクを検証しています...</p>
          </div>
        </div>
      </>
    );
  }

  // 無効なトークンの場合のエラー表示
  if (tokenValid === false) {
    return (
      <>
        <Head>
          <title>パスワードリセット | DumDumb</title>
          <meta name="description" content="DumDumbのパスワードリセット" />
        </Head>
        <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage || "パスワードリセットリンクが無効または期限切れです。"}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/auth/forgot-password"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                新しいリセットリンクをリクエスト
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 通常のパスワードリセットフォーム
  return (
    <>
      <Head>
        <title>パスワードリセット | DumDumb</title>
        <meta name="description" content="DumDumbのパスワードリセット" />
      </Head>
      <div className="relative min-h-[calc(100vh-72px)] flex flex-col items-center justify-start px-4 py-24">
        <div className="w-full max-w-md mb-12 md:mb-0">
          <h1 className="text-2xl font-bold text-center mb-8">
            新しいパスワードを設定
          </h1>

          <p className="text-sm text-gray-600 text-center mb-6">
            アカウントの新しいパスワードを設定してください。
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
              <p className="mt-2 text-sm">
                5秒後にログインページにリダイレクトします...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                新しいパスワード
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                {password && (
                  <div className="absolute right-2 top-2.5 flex items-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full text-white ${strengthLabel.color}`}
                    >
                      {strengthLabel.text}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">
                  安全なパスワードの条件：
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  <RequirementItem met={hasMinLength} text="8文字以上" />
                  <RequirementItem
                    met={hasUpperCase}
                    text="大文字（A-Z）を含む"
                  />
                  <RequirementItem
                    met={hasLowerCase}
                    text="小文字（a-z）を含む"
                  />
                  <RequirementItem
                    met={hasDigit}
                    text="数字（0-9）を含む"
                  />
                  <RequirementItem
                    met={hasSpecialChar}
                    text="記号（!@#$%など）を含む"
                  />
                </div>
              </div>
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
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">パスワードが一致しません</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "処理中..." : "パスワードを更新"}
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

export default ResetPasswordPage;