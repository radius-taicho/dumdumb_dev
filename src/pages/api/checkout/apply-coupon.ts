import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { validateCoupon } from '@/lib/coupons/validateCoupon';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POSTリクエストのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // セッションからユーザーを取得
    const session = await getSession({ req });
    if (!session || !session.user?.id) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const userId = session.user.id;
    const { couponCode, cartTotal, cartItems } = req.body;

    if (!couponCode || typeof cartTotal !== 'number') {
      return res.status(400).json({ message: '無効なリクエストデータです' });
    }

    // クーポンを検証
    const validationResult = await validateCoupon(couponCode, {
      userId,
      cartTotal,
      cartItems,
    });

    if (!validationResult.isValid) {
      return res.status(400).json({
        isValid: false,
        message: validationResult.message,
      });
    }

    // クーポン情報と割引額を返す
    return res.status(200).json({
      isValid: true,
      discountAmount: validationResult.discountAmount,
      coupon: {
        id: validationResult.coupon.id,
        code: validationResult.coupon.code,
        discountType: validationResult.coupon.discountType,
        discountValue: validationResult.coupon.discountValue,
      },
      message: validationResult.message,
    });
  } catch (error) {
    console.error('クーポン適用中にエラーが発生しました:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
