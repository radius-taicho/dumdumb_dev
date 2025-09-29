import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { awardOrderPoints } from '../../../lib/points/awardOrderPoints';
import { issueCouponIfEligible } from '../../../lib/coupons/issueCoupon';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // 注文情報を取得
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 注文が既に完了済みの場合はエラー
    if (order.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Order is already completed' });
    }

    // 注文ステータスを完了に更新
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // 注文に対してポイントを付与
    const pointsResult = await awardOrderPoints(orderId);

    // 初回購入やその他の条件でクーポンを発行
    const couponResult = await issueCouponIfEligible(order.userId);

    return res.status(200).json({
      success: true,
      order: updatedOrder,
      points: pointsResult,
      coupon: couponResult,
    });
  } catch (error) {
    console.error('Error completing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
