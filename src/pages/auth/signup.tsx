import React, { useState, useEffect, useRef } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const SignupPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  // パスワード要件チェック
  const hasMinLength = password.length >= 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  
  // すべての要件を満たしているかチェック
  const meetsAllRequirements = hasMinLength && hasUpperCase && hasLowerCase && hasDigit;
  
  // パスワード強度計算（0-4のスケール）
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

  // パスワードフォーカス時と要件表示を制御
  useEffect(() => {
    if (passwordFocused) {
      // フォーカス時は少し遅延させて表示（ブラウザのパスワード生成UIとの干渉を避ける）
      const timer = setTimeout(() => {
        setShowPasswordRequirements(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      // パスワードが入力済みで要件を満たしていない場合は表示を維持
      if (password && !meetsAllRequirements) {
        setShowPasswordRequirements(true);
      } else {
        // それ以外の場合は非表示
        const timer = setTimeout(() => {
          setShowPasswordRequirements(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [passwordFocused, password, meetsAllRequirements]);

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

    // パスワード要件の検証 - すべての要件を満たしているか確認
    if (!meetsAllRequirements) {
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
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
      const errorMsg = err instanceof Error ? err.message : "登録処理中にエラーが発生しました";
      setErrorMessage(errorMsg);
      toast.error(errorMsg || '登録に失敗しました');
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
                {passwordFocused && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-blue-50 rounded-md border border-blue-200 shadow-sm">
                    <p className="text-sm text-blue-700 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <strong>ブラウザの自動パスワード生成機能をお使いください</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1 ml-5">
                      高度に安全なパスワードが自動生成され、ブラウザに保存されます。
                    </p>
                  </div>
                )}
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
                  minLength={12}
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

              {showPasswordRequirements && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                  {/* パスワード要件表示 */}
                  <div>
                    <p className="text-xs text-gray-600 mb-2">
                      安全なパスワードの条件：
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      <RequirementItem met={hasMinLength} text="12文字以上" />
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
                  </div>
                </div>
              )}
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

export default SignupPage;