import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  message?: string;
  cart?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { userId, cartItemId } = req.body;

    if (!userId || !cartItemId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // カートアイテムの存在確認
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'カートアイテムが見つかりません',
      });
    }

    // カートの所有者確認
    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '不正なアクセスです',
      });
    }

    // カートアイテムを削除
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    // 更新されたカートを取得
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    return res.status(200).json({
      success: true,
      message: 'カートから商品を削除しました',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}