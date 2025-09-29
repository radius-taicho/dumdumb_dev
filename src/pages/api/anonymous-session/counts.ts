import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 安全な基本レスポンス
  const safeResponse = {
    success: true,
    cartCount: 0,
    favoritesCount: 0
  };

  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(200).json(safeResponse);
    }
    
    try {
      // 単純なクエリだけを実行
      const favorites = await prisma.anonymousFavorite.count({
        where: {
          anonymousSession: {
            token
          }
        }
      });
      
      // カート数を安全に取得
      let cartCount = 0;
      try {
        const cartItems = await prisma.cartItem.findMany({
          where: {
            cart: {
              anonymousSession: {
                token
              }
            }
          },
          select: { quantity: true }
        });
        
        cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      } catch (cartError) {
        console.error('Cart count error:', cartError);
      }
      
      return res.status(200).json({
        success: true,
        cartCount,
        favoritesCount: favorites
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(200).json(safeResponse);
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).json(safeResponse);
  }
}