import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface CouponSectionProps {
  subtotal: number;
  cartItems: any[];
  onCouponApply: (couponData: {
    code: string;
    discount: number;
    couponId: string;
  }) => void;
}

interface UserCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  isUsed: boolean;
  description?: string;
}

const CouponSection: React.FC<CouponSectionProps> = ({
  subtotal,
  cartItems,
  onCouponApply,
}) => {
  const [couponCode, setCouponCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    couponId: string;
  } | null>(null);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [showUserCoupons, setShowUserCoupons] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ユーザーの保有クーポンを取得
  useEffect(() => {
    const fetchUserCoupons = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user/coupons');
        
        // 有効かつ未使用のクーポンのみをフィルタリング
        // APIからのレスポンスデータが{ coupons: [...] }の形式であることを確認
        if (!response.data || !response.data.coupons) {
          console.error('クーポンデータが解析できません:', response.data);
          setUserCoupons([]);
          return;
        }
        
        const validCoupons = response.data.coupons.filter((coupon: UserCoupon) => {
          const isExpired = new Date(coupon.expiryDate) < new Date();
          return !coupon.isUsed && !isExpired;
        });
        
        setUserCoupons(validCoupons);
        setLoading(false);
      } catch (err) {
        console.error('クーポン情報の取得に失敗しました:', err);
        setLoading(false);
      }
    };

    fetchUserCoupons();
  }, []);

  // クーポンコード適用
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('クーポンコードを入力してください');
      return;
    }

    try {
      setValidating(true);
      setError(null);

      const response = await axios.post('/api/checkout/apply-coupon', {
        couponCode: couponCode.trim(),
        cartTotal: subtotal,
        cartItems,
      });

      if (response.data.isValid) {
        const couponData = {
          code: couponCode,
          discount: response.data.discountAmount,
          couponId: response.data.coupon.id,
        };
        
        setAppliedCoupon(couponData);
        onCouponApply(couponData);
        toast.success('クーポンが適用されました');
      } else {
        setError(response.data.message || 'クーポンは無効です');
        setAppliedCoupon(null);
        onCouponApply({ code: '', discount: 0, couponId: '' });
      }
    } catch (err) {
      console.error('クーポン検証中にエラーが発生しました:', err);
      setError(err.response?.data?.message || 'クーポン検証中にエラーが発生しました');
      setAppliedCoupon(null);
      onCouponApply({ code: '', discount: 0, couponId: '' });
    } finally {
      setValidating(false);
    }
  };

  // クーポン適用解除
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setError(null);
    onCouponApply({ code: '', discount: 0, couponId: '' });
  };

  // 保有クーポン選択
  const handleSelectCoupon = async (coupon: UserCoupon) => {
    setCouponCode(coupon.code);
    setShowUserCoupons(false);
    
    // 自動的にクーポンを適用する
    try {
      setValidating(true);
      setError(null);

      const response = await axios.post('/api/checkout/apply-coupon', {
        couponCode: coupon.code,
        cartTotal: subtotal,
        cartItems,
      });

      if (response.data.isValid) {
        const couponData = {
          code: coupon.code,
          discount: response.data.discountAmount,
          couponId: response.data.coupon.id,
        };
        
        setAppliedCoupon(couponData);
        onCouponApply(couponData);
        toast.success('クーポンが適用されました');
      } else {
        setError(response.data.message || 'クーポンは無効です');
        setAppliedCoupon(null);
        onCouponApply({ code: '', discount: 0, couponId: '' });
      }
    } catch (err) {
      console.error('クーポン検証中にエラーが発生しました:', err);
      setError(err.response?.data?.message || 'クーポン検証中にエラーが発生しました');
      setAppliedCoupon(null);
      onCouponApply({ code: '', discount: 0, couponId: '' });
    } finally {
      setValidating(false);
    }
  };

  // 割引タイプの表示文字列を取得
  const getDiscountText = (coupon: UserCoupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%オフ`;
    } else {
      return `${coupon.discountValue.toLocaleString()}円オフ`;
    }
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-lg mb-2">クーポン適用</h3>
      
      {appliedCoupon ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-green-700 font-medium">
                クーポン適用中: {appliedCoupon.code}
              </span>
              <p className="text-sm text-green-600">
                割引額: {appliedCoupon.discount.toLocaleString()}円
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-sm text-red-500 hover:text-red-700"
            >
              解除
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="text"
              placeholder="クーポンコードを入力"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={validating}
              className={`
                px-4 py-2 rounded-md text-white
                ${validating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'}
              `}
            >
              {validating ? '検証中...' : '適用'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </>
      )}
      
      {userCoupons.length > 0 && !appliedCoupon && (
        <div>
          <button
            type="button"
            onClick={() => setShowUserCoupons(!showUserCoupons)}
            className="text-sm text-orange-500 hover:text-orange-700 underline"
          >
            {showUserCoupons ? 'クーポン一覧を閉じる' : '利用可能なクーポンを表示する'}
          </button>
          
          {showUserCoupons && (
            <div className="mt-3 border rounded-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {userCoupons.map((coupon) => (
                  <li key={coupon.id} className="p-3 hover:bg-gray-50">
                    <button
                      className="w-full text-left"
                      onClick={() => handleSelectCoupon(coupon)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{getDiscountText(coupon)}</p>
                          <p className="text-xs text-gray-500">
                            コード: {coupon.code} • 
                            {coupon.description && ` ${coupon.description} •`}
                            有効期限: {formatDate(coupon.expiryDate)}
                          </p>
                        </div>
                        <span className="text-orange-500 text-sm">選択</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {userCoupons.length === 0 && !loading && !appliedCoupon && (
        <p className="text-sm text-gray-500">
          現在利用可能なクーポンはありません
        </p>
      )}
      
      {loading && (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponSection;
