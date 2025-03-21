import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  isFavorite: boolean;
  favoriteId?: string;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, isFavorite: false, message: 'Method Not Allowed' });
  }

  // セッションを取得して認証チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(200).json({ success: true, isFavorite: false });
  }

  try {
    const { itemId } = req.query;
    
    if (!itemId || typeof itemId !== 'string') {
      return res.status(400).json({ 
        success: false, 
        isFavorite: false, 
        message: 'Item ID is required' 
      });
    }

    // お気に入りに登録されているか確認
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
    });

    return res.status(200).json({
      success: true,
      isFavorite: !!favorite,
      favoriteId: favorite?.id,
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return res.status(500).json({ 
      success: false, 
      isFavorite: false, 
      message: 'Internal Server Error' 
    });
  }
}
