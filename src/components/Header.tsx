import React, { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiShoppingCart, FiHeart } from "react-icons/fi";
import { useRouter } from "next/router";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

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

        {/* 右側：アイコンとログイン */}
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
          <Link
            href="/auth/login"
            className="hidden md:block text-gray-700 hover:text-gray-900"
          >
            ログイン
          </Link>
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
              商品一覧
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
            <Link
              href="/auth/login"
              className="text-gray-700 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              ログイン
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
