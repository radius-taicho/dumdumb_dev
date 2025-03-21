import React, { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiShoppingCart, FiHeart, FiUser } from "react-icons/fi";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ハートボタンクリック時の処理
  const handleFavoritesClick = (e: React.MouseEvent) => {
    e.preventDefault();

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

  // ユーザーメニュートグル
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // ログアウト処理
  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowUserMenu(false);
    router.push('/');
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
            className="p-2 text-gray-700 hover:text-gray-900"
            onClick={handleFavoritesClick}
          >
            <FiHeart className="w-6 h-6" />
          </a>
          <Link
            href="/cartAndFavorites"
            className="p-2 text-gray-700 hover:text-gray-900"
          >
            <FiShoppingCart className="w-6 h-6" />
          </Link>

          {status === 'authenticated' ? (
            <div className="relative">
              <button
                className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                onClick={toggleUserMenu}
              >
                <FiUser className="w-6 h-6" />
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
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    注文履歴
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
            {status !== 'authenticated' ? (
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
                  href="/account"
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