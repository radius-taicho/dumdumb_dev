import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX, FiShoppingCart, FiHeart, FiUser } from "react-icons/fi";
import { useRouter } from "next/router";
import { useSession, signOut, signIn } from "next-auth/react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [defaultIconUrl, setDefaultIconUrl] = useState<string | null>(null);

  // デフォルトアイコンを取得
  useEffect(() => {
    const fetchDefaultIcon = async () => {
      try {
        const response = await fetch('/api/user/icons');
        if (response.ok) {
          const data = await response.json();
          setDefaultIconUrl(data.defaultIconUrl);
        }
      } catch (error) {
        console.error('Error fetching default icon:', error);
      }
    };

    if (status === "authenticated") {
      fetchDefaultIcon();
    }
  }, [status]);

  // ハートボタンクリック時の処理
  const handleFavoritesClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // ログイン状態チェック
    if (status !== "authenticated") {
      setShowLoginPrompt(true);
      return;
    }

    // 現在のパスがすでにcartAndFavoritesの場合
    if (router.pathname === "/cartAndFavorites") {
      // 直接お気に入りセクションにスクロール
      const favoritesSection = document.getElementById("favorites-section");
      if (favoritesSection) {
        // cartAndFavorites.tsxと同じスクロール処理とオフセットを使用
        const yOffset = -72; // ヘッダー高さ + 余白
        const y =
          favoritesSection.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "auto" });
      }
    } else {
      // 異なるページからの遷移
      router.push("/cartAndFavorites?section=favorites");
    }
  };

  // カートボタンクリック時の処理
  const handleCartClick = (e: React.MouseEvent) => {
    // ログイン状態をチェック
    if (status !== "authenticated") {
      e.preventDefault();
      setShowLoginPrompt(true);
      return;
    }
  };
  
  // ログインを促すモーダルを閉じる
  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  // ログインページへ移動
  const handleGoToLogin = () => {
    setShowLoginPrompt(false);
    router.push("/auth/login");
  };

  // アカウント作成ページへ移動
  const handleGoToSignup = () => {
    setShowLoginPrompt(false);
    router.push("/auth/signup");
  };

  // ゲストとして続ける
  const handleContinueAsGuest = () => {
    setShowLoginPrompt(false);
    router.push("/cartAndFavorites");
  };

  // ユーザーメニュートグル
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // ログアウト処理
  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowUserMenu(false);
    router.push("/");
  };

  // ユーザーアイコンを表示するコンポーネント
  const UserAvatar = () => {
    // ユーザー画像、デフォルトアイコン、またはデフォルトアイコンがない場合はアイコン
    if (session?.user?.image) {
      return (
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
          <Image 
            src={session.user.image} 
            alt="ユーザーアイコン" 
            fill 
            className="object-cover"
          />
        </div>
      );
    } else if (defaultIconUrl) {
      return (
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
          <Image 
            src={defaultIconUrl} 
            alt="デフォルトアイコン" 
            fill 
            className="object-cover"
          />
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
          <FiUser className="w-5 h-5 text-gray-600" />
        </div>
      );
    }
  };

  return (
    <>
      <header className="flex h-[72px] items-center justify-between px-4 py-2 bg-white shadow-sm">
        {/* 左側：メニューボタン（モバイル）またはナビゲーション（デスクトップ） */}
        <div>
          <button
            className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <FiX className="w-8 h-8" />
            ) : (
              <FiMenu className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* 中央：ロゴ */}
        <div className="flex items-center justify-center ">
          <Link href="/" className="relative flex items-center">
            <h1 className="font-['Modak-Regular',Helvetica] font-bold text-[#1e1e1e] text-4xl sm:text-5xl text-center tracking-[0] leading-normal">
              dumdumb
            </h1>
            <div className="w-12 h-12 bg-[#d9d9d9] rounded-full" />
            {/* 画像がある場合は以下のコメントを外してください */}
            {/* <img className="w-12 h-12 sm:w-16 sm:h-16 ml-2" alt="Dumdumb" src="/images/logo.png" /> */}
          </Link>
        </div>

        {/* 右側：アイコンとログイン/ユーザーアイコン */}
        <div className="flex items-center gap-4 sm:gap-8">
          <a
            href="/cartAndFavorites"
            className="p-2 text-gray-700 hover:text-gray-900 relative"
            onClick={handleFavoritesClick}
          >
            <FiHeart className="w-6 h-6" />
          </a>
          <a
            href="/cartAndFavorites"
            className="p-2 text-gray-700 hover:text-gray-900 relative"
            onClick={handleCartClick}
          >
            <FiShoppingCart className="w-6 h-6" />
          </a>

          {status === "authenticated" ? (
            <div className="relative">
              <button
                className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                onClick={toggleUserMenu}
              >
                <UserAvatar />
              </button>

              {/* ユーザーメニュードロップダウン */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {session?.user?.email}
                  </div>
                  <Link
                    href="/mypage"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    マイページ
                  </Link>
                  <Link
                    href="/mypage/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    お買い物履歴
                  </Link>
                  <Link
                    href="/mypage/account-settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    アカウント設定
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden md:block text-gray-700 hover:text-gray-900"
            >
              ログイン
            </Link>
          )}
        </div>
      </header>

      {/* モバイルメニュー */}
      {/* ログインプロンプトモーダル */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">ログインが必要です</h3>
            <p className="mb-6">この機能を利用するにはログインが必要です。ログインしますか？</p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleGoToLogin}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                ログイン
              </button>
              <button
                onClick={handleGoToSignup}
                className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                アカウント作成
              </button>
              <button
                onClick={handleContinueAsGuest}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                ゲストとして続ける
              </button>
              <button
                onClick={closeLoginPrompt}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              href="/items"
              className="text-gray-700 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              アイテム一覧
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              カテゴリー
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            {status !== "authenticated" ? (
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                ログイン
              </Link>
            ) : (
              <>
                <Link
                  href="/mypage/account-settings"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  アカウント設定
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left text-gray-700 hover:text-gray-900"
                >
                  ログアウト
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
