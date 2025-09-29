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
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid token is required' });
    }

    // 匿名セッションを取得
    const anonymousSession = await prisma.anonymousSession.findUnique({
      where: { token },
      include: {
        cart: {
          include: {
            items: {
              include: {
                item: {
                  include: {
                    itemSizes: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!anonymousSession) {
      return res.status(404).json({ success: false, message: 'Anonymous session not found' });
    }

    // 期限切れかどうかを確認
    const now = new Date();
    if (anonymousSession.expires < now) {
      return res.status(400).json({ success: false, message: 'Anonymous session has expired' });
    }

    // カートが存在しない場合は空のカート情報を返す
    if (!anonymousSession.cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [] },
      });
    }

    return res.status(200).json({
      success: true,
      cart: anonymousSession.cart,
    });
  } catch (error) {
    console.error('Error fetching anonymous cart:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
