import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  message?: string;
  favorite?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // セッションを取得して認証チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const { itemId } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    // アイテムが存在するか確認
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // すでにお気に入りに登録されているか確認
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
    });

    if (existingFavorite) {
      return res.status(200).json({ 
        success: true, 
        message: 'Item is already in favorites',
        favorite: existingFavorite 
      });
    }

    // お気に入りに追加
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        itemId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Added to favorites',
      favorite,
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
