import React, { useState } from 'react';

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

type DeliveryDateTimeSectionProps = {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
};

const DeliveryDateTimeSection: React.FC<DeliveryDateTimeSectionProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    today.setHours(0, 0, 0, 0);

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
      onDateChange(formattedDate);
      setShowDatePicker(false);
    }
  };

  // 時間選択ハンドラ
  const handleTimeSelect = (time: string) => {
    onTimeChange(time);
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
  );
};

export default DeliveryDateTimeSection;
