import React, { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";

// ThumbnailImage Component
const ThumbnailImage: React.FC = () => {
  return (
    <article className="flex overflow-hidden gap-2.5 justify-center items-center px-2.5 py-8 w-full">
      <figure className="flex flex-1 shrink self-stretch my-auto rounded-full basis-0 bg-zinc-300 h-[100px] min-h-[100px] w-[100px]" />
    </article>
  );
};

// ImageGallery Component
const ImageGallery: React.FC = () => {
  return (
    <div
      className="overflow-hidden z-0 min-w-60 w-[669px] max-md:max-w-full"
      space={0}
    >
      <div className="flex gap-5 max-md:flex-col">
        <div className="w-[18%] max-md:ml-0 max-md:w-full">
          <div className="flex overflow-hidden flex-col justify-center w-full min-h-[792px]">
            <ThumbnailImage />
            <ThumbnailImage />
            <ThumbnailImage />
          </div>
        </div>
        <div className="ml-5 w-[82%] max-md:ml-0 max-md:w-full">
          <figure className="flex shrink-0 mx-auto max-w-full bg-zinc-300 h-[792px] w-[549px]" />
        </div>
      </div>
    </div>
  );
};

// SizeOption Component
const SizeOption: React.FC<{
  size: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ size, isSelected, onSelect }) => {
  return (
    <div className="self-stretch my-auto w-[72px]">
      <button
        onClick={onSelect}
        className={`px-2 rounded-full ${
          isSelected ? "bg-orange-500" : "bg-zinc-300"
        } h-[72px] w-[72px] max-md:px-5 flex items-center justify-center`}
        aria-label={`Select size ${size}`}
        aria-pressed={isSelected}
      >
        {size}
      </button>
    </div>
  );
};

// SizeSelector Component
const SizeSelector: React.FC<{
  onSizeSelect: (size: string) => void;
  selectedSize: string | null;
}> = ({ onSizeSelect, selectedSize }) => {
  const sizes = ["S", "M", "L", "XL", "XLL"];

  return (
    <div className="flex overflow-hidden gap-4 items-center self-start px-2 py-3 mt-4 text-4xl text-center text-black whitespace-nowrap max-md:max-w-full">
      {sizes.map((size) => (
        <SizeOption
          key={size}
          size={size}
          isSelected={selectedSize === size}
          onSelect={() => onSizeSelect(size)}
        />
      ))}
    </div>
  );
};

// QuantitySelector Component
const QuantitySelector: React.FC<{
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}> = ({ quantity, onQuantityChange }) => {
  const decrementQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    onQuantityChange(quantity + 1);
  };

  return (
    <div className="flex gap-0.5 justify-center items-center self-stretch my-auto bg-white rounded-3xl border border-black border-solid min-h-10 w-[88px]">
      <button
        onClick={decrementQuantity}
        className="flex overflow-hidden flex-col justify-center self-stretch px-1.5 py-3.5 my-auto w-[27px]"
        aria-label="Decrease quantity"
      >
        <div className="flex shrink-0 h-0.5 bg-zinc-600 w-[15px]" />
      </button>
      <span className="self-stretch px-2.5 py-2 my-auto w-8 text-2xl font-medium text-center text-black whitespace-nowrap">
        {quantity}
      </span>
      <button
        onClick={incrementQuantity}
        className="object-contain shrink-0 self-stretch my-auto aspect-square w-[27px] flex items-center justify-center"
        aria-label="Increase quantity"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7.5 0V15" stroke="#3F3F46" strokeWidth="1" />
          <path d="M15 7.5L0 7.5" stroke="#3F3F46" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
};

// ActionButtons Component
const ActionButtons: React.FC = () => {
  return (
    <>
      <button className="self-stretch my-auto w-40 text-2xl text-center text-black whitespace-nowrap bg-orange-500 rounded-3xl min-h-14 flex items-center justify-center">
        今すぐ買う
      </button>
      <div className="flex justify-center items-center self-stretch px-1.5 py-3 my-auto bg-white rounded-3xl border border-black border-solid min-h-14 w-[72px]">
        <FiShoppingCart className="w-6 h-6" />
      </div>
    </>
  );
};

// RestockNotification Component
const RestockNotification: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  return (
    <aside className="flex absolute z-0 flex-col justify-center items-center w-60 text-sm text-center text-black whitespace-nowrap right-[-22px] top-[409px]">
      <p>再入荷した際に通知を受け取る</p>
      <button
        onClick={handleSubscribe}
        aria-label={
          isSubscribed
            ? "Unsubscribe from restock notifications"
            : "Subscribe to restock notifications"
        }
        className="mt-2.5"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 10C24 7.87827 23.1571 5.84344 21.6569 4.34315C20.1566 2.84285 18.1217 2 16 2C13.8783 2 11.8434 2.84285 10.3431 4.34315C8.84285 5.84344 8 7.87827 8 10C8 17 5 19 5 19H27C27 19 24 17 24 10Z"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.3 23C18.1111 23.3031 17.8428 23.5547 17.5215 23.7295C17.2002 23.9044 16.8383 23.9965 16.47 24C16.1017 23.9965 15.7399 23.9044 15.4185 23.7295C15.0972 23.5547 14.8289 23.3031 14.64 23"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </aside>
  );
};

// ProductInfo Component
const ProductInfo: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  return (
    <article className="flex overflow-hidden z-0 flex-col min-w-60 w-[483px] max-md:max-w-full">
      <span className="gap-2.5 self-stretch max-w-full text-base text-center whitespace-nowrap bg-zinc-300 rounded-[40px] text-neutral-400 w-[120px]">
        キャラクター名
      </span>
      <h1 className="mt-4 text-2xl text-black">アイテム名</h1>
      <p className="mt-4 text-xl text-black">4,500</p>
      <h2 className="mt-4 text-2xl text-black">サイズ</h2>

      <SizeSelector
        onSizeSelect={handleSizeSelect}
        selectedSize={selectedSize}
      />

      <h2 className="mt-4 text-2xl text-black">数量</h2>

      <div className="flex overflow-hidden flex-wrap gap-8 items-center px-8 py-3.5 mt-4 w-full max-w-[510px] max-md:px-5 max-md:max-w-full">
        <QuantitySelector
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
        />
        <ActionButtons />
      </div>

      <h3 className="mt-4 text-xl text-black">このアイテムについて</h3>
      <p className="mt-4 text-base text-black max-md:max-w-full">
        テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト
        <br />
        <br />
        テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト
        <br />
        <br />
        テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト
        <br />
        <br />
        テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト
      </p>
    </article>
  );
};

// CharacterSection Component
const CharacterSection: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-8 mb-16">
      <h2 className="text-xl font-bold mb-6">
        このアイテムのキャラクターについて
      </h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4 flex-shrink-0 flex flex-col justify-between items-center">
          <img
            src="/images/character.png"
            alt="キャラクター"
            className="max-w-full h-auto"
          />
          <h2 className="text-xl font-bold">キャラクター名</h2>
        </div>
        <div className="w-full md:w-3/4 flex flex-col items-end">
          <p className="text-gray-700">
            テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト
          </p>
          <Link
            href="/characters"
            className="text-orange-500 text-sm flex items-center"
          >
            このキャラクターについてもっと詳しく見る
            <svg
              className="w-4 h-4 ml-1"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

// RelatedItems Component
const RelatedItems: React.FC = () => {
  const relatedItems = [
    { id: "1", name: "商品名", price: 4800, image: "/images/dummy1.jpg" },
    { id: "2", name: "商品名", price: 4800, image: "/images/dummy2.jpg" },
    { id: "3", name: "商品名", price: 4800, image: "/images/dummy3.jpg" },
    { id: "4", name: "商品名", price: 4800, image: "/images/dummy4.jpg" },
    { id: "5", name: "商品名", price: 4800, image: "/images/dummy5.jpg" },
  ];

  return (
    <section className="container mx-auto px-4 py-8 mb-16">
      <h2 className="text-xl font-bold mb-6">このキャラクターの他のアイテム</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {relatedItems.map((item) => (
          <Link href={`/items/${item.id}`} key={item.id}>
            <div className="border border-gray-300 p-2">
              <div className="aspect-square bg-gray-200 mb-2">
                {/* 商品画像 */}
              </div>
              <p className="text-sm">商品名</p>
              <p className="text-sm">4,800</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// Main ProductDetailPage Component
const ProductDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>アイテム名 | dumdumb</title>
        <meta name="description" content="アイテム名の商品詳細" />
      </Head>

      <section className="flex relative gap-10 items-center px-8 pt-16 max-md:px-5">
        <ImageGallery />
        <ProductInfo />
        <RestockNotification />
      </section>

      <CharacterSection />
      <RelatedItems />
    </>
  );
};

export default ProductDetailPage;
