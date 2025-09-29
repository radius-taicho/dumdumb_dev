import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PointsSectionProps {
  totalAmount: number;
  onPointsUse: (amount: number) => void;
}

const PointsSection: React.FC<PointsSectionProps> = ({ totalAmount, onPointsUse }) => {
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingPoints, setIsUsingPoints] = useState<boolean>(false);

  // ユーザーの利用可能ポイントを取得
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user/points');
        setAvailablePoints(response.data.totalPoints);
        setLoading(false);
      } catch (err) {
        console.error('ポイント情報の取得に失敗しました:', err);
        setError('ポイント情報の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  // ポイント使用の切り替え
  const handleTogglePoints = () => {
    if (isUsingPoints) {
      // ポイント使用をキャンセル
      setIsUsingPoints(false);
      setPointsToUse(0);
      onPointsUse(0);
    } else {
      // ポイント使用を有効化
      setIsUsingPoints(true);
      // デフォルトでは最大利用可能ポイントをセット（合計金額を超えない範囲）
      const defaultPoints = Math.min(availablePoints, totalAmount);
      setPointsToUse(defaultPoints);
      onPointsUse(defaultPoints);
    }
  };

  // ポイント利用量の変更
  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    
    // 空の入力やNaNの場合は0をセット
    if (isNaN(value) || value < 0) {
      setPointsToUse(0);
      onPointsUse(0);
      return;
    }
    
    // 利用可能ポイントと合計金額のどちらか小さい方を上限とする
    const maxPoints = Math.min(availablePoints, totalAmount);
    const validValue = Math.min(value, maxPoints);
    
    setPointsToUse(validValue);
    onPointsUse(validValue);
  };

  // 最大ポイントを使用
  const handleMaxPointsUse = () => {
    const maxPoints = Math.min(availablePoints, totalAmount);
    setPointsToUse(maxPoints);
    onPointsUse(maxPoints);
  };

  if (loading) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-red-50 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (availablePoints === 0) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-gray-50">
        <h3 className="font-semibold text-lg mb-2">ポイント利用</h3>
        <p className="text-gray-500 text-sm">現在利用可能なポイントはありません</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-lg mb-2">ポイント利用</h3>
      
      <div className="flex items-center mb-3">
        <input
          type="checkbox"
          id="use-points"
          checked={isUsingPoints}
          onChange={handleTogglePoints}
          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="use-points" className="ml-2 text-sm text-gray-700">
          ポイントを使用する（利用可能ポイント: <span className="font-medium">{availablePoints.toLocaleString()}</span>ポイント）
        </label>
      </div>
      
      {isUsingPoints && (
        <div className="mt-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={pointsToUse}
              onChange={handlePointsChange}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
              min="0"
              max={availablePoints}
              disabled={!isUsingPoints}
            />
            <span className="text-sm">ポイント</span>
            <button
              type="button"
              onClick={handleMaxPointsUse}
              className="ml-2 text-xs text-orange-500 hover:text-orange-600 underline"
              disabled={!isUsingPoints}
            >
              最大ポイントを使用
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            1ポイント = 1円として使用されます
          </p>
        </div>
      )}
    </div>
  );
};

export default PointsSection;
