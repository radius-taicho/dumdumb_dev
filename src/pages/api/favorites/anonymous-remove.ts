import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'DELETE') {
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

    // お気に入りを削除
    const result = await prisma.anonymousFavorite.deleteMany({
      where: {
        anonymousSessionId: anonymousSession.id,
        itemId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    console.error('Error removing from anonymous favorites:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
