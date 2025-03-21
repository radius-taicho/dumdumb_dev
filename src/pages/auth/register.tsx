import React, { useState, useEffect, useRef } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const RegisterPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  // パスワード要件チェック
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  
  // パスワード強度計算（0-3のスケール）
  const passwordStrength = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasDigit,
  ].filter(Boolean).length;

  // パスワード強度のラベルとカラー
  const getStrengthLabel = () => {
    if (passwordStrength === 0)
      return { text: "入力してください", color: "bg-gray-200" };
    if (passwordStrength <= 1) return { text: "弱い", color: "bg-red-500" };
    if (passwordStrength <= 2) return { text: "普通", color: "bg-yellow-500" };
    if (passwordStrength <= 3) return { text: "強い", color: "bg-green-500" };
    return { text: "非常に強い", color: "bg-green-600" };
  };

  const strengthLabel = getStrengthLabel();

  // 既にログインしている場合はリダイレクト
  useEffect(() => {
    if (status === 'authenticated') {
      router.push("/");
    }
  }, [status, router]);

  const validatePassword = () => {
    // パスワードの一致確認
    if (password !== confirmPassword) {
      setPasswordError("パスワードが一致しません");
      return false;
    }

    // パスワード強度の検証
    if (!hasMinLength || passwordStrength < 2) {
      setPasswordError("パスワードの要件を満たしていません");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // エラーメッセージをクリア
    setErrorMessage("");

    // パスワード検証
    if (!validatePassword()) {
      return;
    }

    // 入力検証
    if (!email || !password) {
      setErrorMessage("メールアドレスとパスワードを入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 新規ユーザー登録API呼び出し
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '登録に失敗しました');
      }

      // 登録成功メッセージ
      toast.success('アカウントを作成しました');
      
      // 登録後、自動的にログイン
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        console.error('Auto sign-in failed:', signInResult.error);
        // ログインに失敗してもエラーは表示せず、ログインページにリダイレクト
        router.push('/auth/login');
        return;
      }

      // ログインに成功したらトップページにリダイレクト
      router.push('/');
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage(err instanceof Error ? err.message : "登録処理中にエラーが発生しました");
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

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on" method="post">
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
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="new-password"
                  ref={passwordInputRef}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                  minLength={8}
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
                <p className="text-xs text-gray-700">
                  <span className="text-gray-700">
                    入力欄をクリックすると、ブラウザの自動パスワード生成機能が表示されます
                  </span>
                </p>

                {/* パスワード入力欄にフォーカスがあるとき、または入力済みでエラーがある場合のみ表示 */}
                {(passwordFocused || (password && passwordStrength < 2)) && (
                  <>
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
                    </div>
                  </>
                )}
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
                name="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-500">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "アカウント作成中..." : "アカウント作成"}
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