import React, { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

// 仮のカートアイテムデータ
const dummyCartItems = [
  {
    id: "1",
    name: "アイテム名",
    size: "サイズ",
    price: 4800,
    quantity: 1,
    image: "/images/dummy1.jpg",
  },
];

// 時間帯オプション
const timeOptions = [
  { value: "午前中", label: "午前中" },
  { value: "12-14", label: "12時-14時" },
  { value: "14-16", label: "14時-16時" },
  { value: "16-18", label: "16時-18時" },
  { value: "18-20", label: "18時-20時" },
  { value: "19-21", label: "19時-21時" },
  { value: "18-21", label: "18時-21時" },
];

const CheckoutPage: NextPage = () => {
  // 注文情報の状態管理
  const [selectedDate, setSelectedDate] = useState<string>("希望日なし");
  const [selectedTime, setSelectedTime] = useState<string>("希望時間帯なし");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // カート合計金額計算
  const subtotal = dummyCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shippingFee = 760;
  const tax = 550;
  const total = subtotal + shippingFee + tax;

  // カレンダー用の日付生成関数
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // 月の最初の日の曜日を取得（0: 日曜日, 1: 月曜日, ...)
    const firstDay = new Date(year, month, 1).getDay();

    // 月の最終日を取得
    const lastDate = new Date(year, month + 1, 0).getDate();

    // カレンダー用の日付配列を生成
    const days = [];

    // 前月の日を追加（空白セル）
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: "", isDisabled: true });
    }

    // 現在の日付
    const today = new Date();

    // 当月の日を追加
    for (let i = 1; i <= lastDate; i++) {
      const date = new Date(year, month, i);
      const isDisabled = date < today;
      days.push({ day: i, isDisabled });
    }

    return days;
  };

  // 日付選択ハンドラ
  const handleDateSelect = (day: number) => {
    if (day) {
      const newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const formattedDate = `${newDate.getFullYear()}年${
        newDate.getMonth() + 1
      }月${newDate.getDate()}日`;
      setSelectedDate(formattedDate);
      setShowDatePicker(false);
    }
  };

  // 時間選択ハンドラ
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowTimePicker(false);
  };

  // 前月へ移動
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  // 次月へ移動
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // 曜日の配列
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // 年月の表示文字列
  const monthString = `${currentMonth.getFullYear()}年${
    currentMonth.getMonth() + 1
  }月`;

  return (
    <>
      <Head>
        <title>購入手続き | DumDumb</title>
        <meta name="description" content="DumDumbでの購入手続き" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">購入手続き</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* Amazon支払いセクション */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                amazonアカウントでお支払い
              </h2>
              <div className="flex flex-col">
                <button className="bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 rounded-lg py-3 px-6 w-56 mb-4">
                  <div className="flex items-center justify-center">
                    <span className="text-lg font-semibold">amazon pay</span>
                  </div>
                </button>
                <p className="text-sm text-gray-600">
                  ※amazonアカウントに登録されているお届け先とお支払い方法の情報を引き継ぎます
                </p>
              </div>
            </div>

            {/* お届け先セクション */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">お届け先</h2>
                <button className="text-orange-500 hover:text-orange-600">
                  <span className="text-xl">+</span>
                </button>
              </div>
              <div className="border rounded-lg p-4 text-gray-700">
                <p>お届け先を追加してください</p>
              </div>
            </div>

            {/* お支払い方法セクション */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">お支払い方法</h2>
                <button className="text-orange-500 hover:text-orange-600">
                  <span className="text-xl">+</span>
                </button>
              </div>
              <div className="border rounded-lg p-4 text-gray-700">
                <p>お支払い方法を追加してください</p>
              </div>
            </div>

            {/* 希望配送日時セクション */}
            <div className="mb-20">
              <h2 className="text-xl font-semibold mb-4">希望配送日時</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 配送日選択 */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配送日
                  </label>
                  <button
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    {selectedDate}
                  </button>

                  {/* 日付ピッカー */}
                  {showDatePicker && (
                    <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <button
                          onClick={goToPreviousMonth}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          ◀
                        </button>
                        <div className="font-semibold">{monthString}</div>
                        <button
                          onClick={goToNextMonth}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          ▶
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {weekdays.map((day, index) => (
                          <div
                            key={index}
                            className="text-center text-sm text-gray-600 py-1"
                          >
                            {day}
                          </div>
                        ))}

                        {generateCalendarDays().map((item, index) => (
                          <div key={index} className="text-center">
                            {item.day ? (
                              <button
                                className={`w-8 h-8 rounded-full ${
                                  item.isDisabled
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "hover:bg-orange-100 text-gray-800"
                                } ${
                                  selectedDate ===
                                  `${currentMonth.getFullYear()}年${
                                    currentMonth.getMonth() + 1
                                  }月${item.day}日`
                                    ? "bg-orange-500 text-white hover:bg-orange-600"
                                    : ""
                                }`}
                                onClick={() =>
                                  !item.isDisabled &&
                                  handleDateSelect(item.day as number)
                                }
                                disabled={item.isDisabled}
                              >
                                {item.day}
                              </button>
                            ) : (
                              <div className="w-8 h-8"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 配送時間選択 */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配送時間
                  </label>
                  <button
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    onClick={() => setShowTimePicker(!showTimePicker)}
                  >
                    {selectedTime}
                  </button>

                  {/* 時間帯ピッカー */}
                  {showTimePicker && (
                    <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 w-full">
                      <div className="max-h-60 overflow-y-auto">
                        {timeOptions.map((time, index) => (
                          <button
                            key={index}
                            className={`w-full text-left py-2 px-4 hover:bg-orange-100 ${
                              selectedTime === time.label
                                ? "bg-orange-500 text-white hover:bg-orange-600"
                                : ""
                            }`}
                            onClick={() => handleTimeSelect(time.label)}
                          >
                            {time.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* お届けアイテムセクション */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                お届けアイテム (1点)
              </h2>
              <div className="border rounded-lg p-4">
                <div className="flex items-start">
                  {/* 商品画像 */}
                  <div className="w-28 h-28 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center mr-4">
                    {/* 実際の画像が入る場所 */}
                    <div className="w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center">
                      <div className="flex">
                        <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* 商品情報 */}
                  <div className="flex-grow">
                    <h3 className="font-medium">アイテム名</h3>
                    <p className="text-sm text-gray-600">サイズ</p>
                    <p className="font-medium mt-2">¥4,800</p>
                  </div>

                  {/* 数量 */}
                  <div className="text-right">
                    <p className="text-gray-600">×1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 注文内容サマリー */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">注文内容</h2>

              <div className="space-y-3 border-b pb-4 mb-4">
                <div className="flex justify-between">
                  <span>アイテム小計</span>
                  <span className="font-medium">
                    ¥{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>送料</span>
                  <span className="font-medium">
                    ¥{shippingFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>内消費税</span>
                  <span className="font-medium">¥{tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between font-semibold mb-8">
                <span>合計</span>
                <span className="text-xl">¥{total.toLocaleString()}</span>
              </div>
              <Link
                href="/checkout/complete"
                className="block text-center w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-full focus:outline-none transition-colors font-medium mb-4"
              >
                注文を確定する
              </Link>

              <Link
                href="/cartAndFavorites"
                className="block text-center text-gray-700 hover:text-gray-900"
              >
                カートに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
