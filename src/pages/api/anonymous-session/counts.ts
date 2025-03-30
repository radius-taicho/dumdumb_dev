import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  message?: string;
  cartCount?: number;
  favoritesCount?: number;
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

    // トークンがない場合や無効な場合でも、エラーではなく0カウントを返す
    if (!token || typeof token !== 'string' || token === 'null') {
      console.log('Invalid or null token provided to counts API:', token);
      return res.status(200).json({ 
        success: true, 
        cartCount: 0,
        favoritesCount: 0,
        message: 'Default counts returned for invalid token'
      });
    }

    // 匿名セッションを取得
    try {
      const anonymousSession = await prisma.anonymousSession.findUnique({
        where: { token },
        include: {
          cart: {
            include: {
              items: true,
            },
          },
          favorites: true,
        },
      });

      if (!anonymousSession) {
        console.log('Anonymous session not found for token:', token);
        return res.status(200).json({ 
          success: true, 
          cartCount: 0,
          favoritesCount: 0,
          message: 'No session found'
        });
      }

      // 期限切れかどうかを確認
      const now = new Date();
      if (anonymousSession.expires < now) {
        console.log('Anonymous session has expired for token:', token);
        return res.status(200).json({ 
          success: true, 
          cartCount: 0,
          favoritesCount: 0,
          message: 'Session expired'
        });
      }

      // カウントを計算
      const cartCount = anonymousSession.cart?.items.reduce(
        (total, item) => total + item.quantity,
        0
      ) || 0;
      
      const favoritesCount = anonymousSession.favorites.length;

      return res.status(200).json({
        success: true,
        cartCount,
        favoritesCount,
      });
    } catch (dbError) {
      console.error('Database error in counts API:', dbError);
      // データベースエラーの場合も0カウントを返す
      return res.status(200).json({ 
        success: true, 
        cartCount: 0,
        favoritesCount: 0,
        message: 'Error fetching counts'
      });
    }
  } catch (error) {
    console.error('Error fetching anonymous session counts:', error);
    // エラー時も正常レスポンスを返して、クライアント側のエラーを防ぐ
    return res.status(200).json({ 
      success: true, 
      cartCount: 0,
      favoritesCount: 0,
      message: 'Error processing request'
    });
  }
}
