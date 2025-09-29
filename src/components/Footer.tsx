import { FiTwitter, FiInstagram } from "react-icons/fi";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// シンプルなSwitchコンポーネント
const SimpleSwitch = ({
  onChange,
}: {
  onChange?: (checked: boolean) => void;
}) => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
    if (onChange) onChange(!checked);
  };

  return (
    <div
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-gray-600" : "bg-gray-600"
      }`}
      onClick={handleChange}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
};

export default function Footer(): JSX.Element {
  // Navigation links data
  const navigationLinks = [
    { name: "トップ", href: "/" },
    { name: "マイページ", href: "/mypage" },
    { name: "キャラクターシリーズ一覧", href: "/character-series" },
    { name: "サイトコンセプト", href: "/concept" },
    { name: "お買い物ガイド", href: "/guide" },
    { name: "サイトマップ", href: "/sitemap" },
  ];

  // Shopping safety links - left column
  const safetyLinksLeft = [
    { name: "会社概要", href: "/company" },
    { name: "よくある質問（FAQ）", href: "/faq" },
    { name: "お問い合わせ", href: "/contact" },
  ];

  // Shopping safety links - right column
  const safetyLinksRight = [
    { name: "利用規約", href: "/terms" },
    { name: "特定商取引法に基づく表記", href: "/legal" },
    { name: "送料・配送情報", href: "/shipping" },
    { name: "各種ポリシー", href: "/policies" },
    { name: "お客様へのお願い", href: "/requests" },
  ];

  // Language options
  const languages = [
    { name: "日本語", flag: "🇯🇵" },
    { name: "한국어", flag: "🇰🇷" },
    { name: "中文", flag: "🇨🇳" },
    { name: "ภาษาไทย", flag: "🇹🇭" },
    { name: "English", flag: "🇬🇧" },
  ];

  return (
    <footer className="flex flex-col w-full items-center justify-center px-4 md:px-12 py-10 bg-white text-gray-800 shadow-md">
      <div className="flex flex-col md:flex-row w-full max-w-[1280px] items-start justify-between gap-10">
        {/* Left Column */}
        <div className="flex flex-col w-full md:max-w-[592px] items-start">
          {/* Logo and Social Media */}
          <div className="flex w-full items-start justify-between mb-8">
            <div className="relative">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo_dumdumb.svg"
                  alt="dumdumb shop"
                  width={280}
                  height={84}
                  className="h-14 w-auto"
                  priority
                />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="https://twitter.com" className="hover:opacity-80">
                <FiTwitter className="w-6 h-6 text-gray-700" />
              </Link>
              <Link href="https://instagram.com" className="hover:opacity-80">
                <FiInstagram className="w-8 h-8 text-gray-700" />
              </Link>
            </div>
          </div>

          {/* Site Navigation */}
          <div className="pt-8">
            <h3 className="font-medium text-xl mb-8">サイトナビゲーション</h3>

            <div className="flex flex-col gap-8">
              {navigationLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm hover:underline cursor-pointer"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col w-full md:max-w-[592px] items-start md:pt-[104px]">
          <h3 className="w-full font-medium text-xl mb-8">
            安心してお買い物するために
          </h3>

          <div className="flex flex-col sm:flex-row w-full justify-between gap-8">
            {/* Left subcolumn */}
            <div className="flex flex-col gap-8">
              {safetyLinksLeft.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm hover:underline cursor-pointer"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right subcolumn */}
            <div className="flex flex-col gap-8">
              {safetyLinksRight.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm hover:underline cursor-pointer"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="flex flex-col md:flex-row w-full max-w-[1280px] justify-between items-start md:items-end border-t border-gray-200 mt-12 pt-8">
        {/* Language and Theme Settings */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-[88px] mb-8 md:mb-0">
          {/* Language Selection */}
          <div className="flex flex-col items-start">
            <h4 className="text-sm mb-4">言語設定</h4>
            <div className="flex flex-col gap-2">
              {languages.map((lang, index) => (
                <button
                  key={index}
                  className="text-sm whitespace-nowrap hover:underline cursor-pointer flex items-center"
                >
                  {lang.name}
                  <span className="ml-2">{lang.flag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex flex-col items-start gap-4">
            <h4 className="text-sm">画面設定</h4>
            <div className="flex items-center gap-4">
              <span className="text-base">☀</span>
              <SimpleSwitch />
              <span className="text-base">🌛</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex items-end justify-center md:justify-end w-full md:w-auto">
          <p className="font-['Modak-Regular',Helvetica] font-normal text-sm text-gray-700">
            © 2025 dumdumb inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
