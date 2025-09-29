import React from "react";

interface PointInfoProps {
  price: number;
  isSale?: boolean;
  campaignId?: string | null;
}

const PointInfo: React.FC<PointInfoProps> = ({
  price,
  isSale = false,
  campaignId = null,
}) => {
  // 基本ポイント率（1%）
  const basePointRate = 0.01;

  // セールアイテムの場合のボーナスポイント率（+1%、合計2%）
  const salePointRate = isSale ? 0.01 : 0;

  // キャンペーン対象アイテムの場合のボーナスポイント率（+3%、合計4%）
  const campaignPointRate = campaignId ? 0.03 : 0;

  // 合計ポイント率
  const totalPointRate = basePointRate + salePointRate + campaignPointRate;

  // 付与ポイント（小数点以下切り捨て）
  const pointAmount = Math.floor(price * totalPointRate);

  // 特別ボーナスポイントがある場合のみ詳細を表示
  const hasBonus = isSale || campaignId;

  return (
    <div className="mt-1 mb-3">
      <div className="flex items-center">
        <span className="text-sm font-medium text-purple-700">
          {pointAmount.toLocaleString()} ポイント獲得
        </span>
        {hasBonus && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
            ボーナスポイント
          </span>
        )}
      </div>

      {hasBonus && (
        <div className="mt-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>基本ポイント ({Math.floor(basePointRate * 100)}%)</span>
            <span>{Math.floor(price * basePointRate).toLocaleString()}P</span>
          </div>

          {isSale && (
            <div className="flex justify-between">
              <span>セール特典 ({Math.floor(salePointRate * 100)}%)</span>
              <span>{Math.floor(price * salePointRate).toLocaleString()}P</span>
            </div>
          )}

          {campaignId && (
            <div className="flex justify-between">
              <span>
                キャンペーン特典 ({Math.floor(campaignPointRate * 100)}%)
              </span>
              <span>
                {Math.floor(price * campaignPointRate).toLocaleString()}P
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PointInfo;
