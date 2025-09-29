import type { NextApiRequest, NextApiResponse } from 'next';
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

  try {
    const { anonymousSessionToken, itemId } = req.body;
    
    if (!anonymousSessionToken || !itemId) {
      return res.status(400).json({ success: false, message: 'Anonymous session token and item ID are required' });
    }

    // 匿名セッションを取得
    const anonymousSession = await prisma.anonymousSession.findUnique({
      where: { token: anonymousSessionToken },
    });

    if (!anonymousSession) {
      return res.status(404).json({ success: false, message: 'Anonymous session not found' });
    }

    // アイテムが存在するか確認
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // すでにお気に入りに登録されているか確認
    const existingFavorite = await prisma.anonymousFavorite.findUnique({
      where: {
        anonymousSessionId_itemId: {
          anonymousSessionId: anonymousSession.id,
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
    const favorite = await prisma.anonymousFavorite.create({
      data: {
        anonymousSessionId: anonymousSession.id,
        itemId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Added to favorites',
      favorite,
    });
  } catch (error) {
    console.error('Error adding to anonymous favorites:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
