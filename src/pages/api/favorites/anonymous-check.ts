import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  isFavorite: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, isFavorite: false, message: 'Method Not Allowed' });
  }

  try {
    const { token, itemId } = req.query;
    
    if (!token || !itemId || typeof token !== 'string' || typeof itemId !== 'string') {
      return res.status(400).json({ 
        success: false, 
        isFavorite: false,
        message: 'Anonymous session token and itemId are required' 
      });
    }

    // 匿名セッションを取得
    const anonymousSession = await prisma.anonymousSession.findUnique({
      where: { token },
    });

    if (!anonymousSession) {
      return res.status(200).json({ 
        success: true, 
        isFavorite: false,
        message: 'Anonymous session not found' 
      });
    }

    // お気に入りに登録されているか確認
    const favorite = await prisma.anonymousFavorite.findFirst({
      where: {
        anonymousSessionId: anonymousSession.id,
        itemId,
      },
    });

    return res.status(200).json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error('Error checking anonymous favorite status:', error);
    return res.status(500).json({ 
      success: false, 
      isFavorite: false, 
      message: 'Internal Server Error' 
    });
  }
}
