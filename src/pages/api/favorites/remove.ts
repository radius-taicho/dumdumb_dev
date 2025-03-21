import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  message?: string;
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
    const { favoriteId, itemId } = req.body;

    // favoriteIdとitemIdのどちらかが必要
    if (!favoriteId && !itemId) {
      return res.status(400).json({ success: false, message: 'Either favoriteId or itemId is required' });
    }

    if (favoriteId) {
      // favoriteIdが指定されている場合、そのIDのお気に入りを削除
      // ただし、そのお気に入りが自分のものであることを確認
      const favorite = await prisma.favorite.findUnique({
        where: { id: favoriteId },
      });

      if (!favorite) {
        return res.status(404).json({ success: false, message: 'Favorite not found' });
      }

      if (favorite.userId !== session.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to remove this favorite' });
      }

      await prisma.favorite.delete({
        where: { id: favoriteId },
      });
    } else {
      // itemIdが指定されている場合、そのアイテムのお気に入りを削除
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_itemId: {
            userId: session.user.id,
            itemId,
          },
        },
      });

      if (!favorite) {
        return res.status(404).json({ success: false, message: 'Favorite not found' });
      }

      await prisma.favorite.delete({
        where: { id: favorite.id },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
