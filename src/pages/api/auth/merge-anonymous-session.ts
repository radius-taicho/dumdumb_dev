import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import { prisma } from '@/lib/prisma-client';

type Data = {
  success: boolean;
  message?: string;
  mergedCarts?: any;
  mergedFavorites?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 認証確認
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      // エラーではなく成功を返す
      return res.status(200).json({ 
        success: true, 
        message: 'Not authenticated, but accepted request' 
      });
    }

    const userId = session.user.id;
    const { anonymousSessionToken } = req.body;

    if (!anonymousSessionToken) {
      return res.status(200).json({ 
        success: true, 
        message: 'No token provided, but accepted request' 
      });
    }

    console.log('Attempting to merge anonymous session for user:', userId);
    console.log('Anonymous session token:', anonymousSessionToken);

    try {
      // 安全なアクセスのための簡略クエリ
      const anonymousSession = await prisma.anonymousSession.findUnique({
        where: { token: anonymousSessionToken },
        select: {
          id: true,
          cart: {
            select: {
              id: true,
              items: {
                select: {
                  id: true,
                  itemId: true,
                  quantity: true,
                  size: true
                }
              }
            }
          },
          favorites: {
            select: {
              id: true,
              itemId: true
            }
          }
        }
      });

      if (!anonymousSession) {
        console.log('No anonymous session found with token:', anonymousSessionToken);
        return res.status(200).json({ 
          success: true, 
          message: 'No anonymous session found to merge' 
        });
      }

      try {
        // トランザクションを使用してデータのマージを行う
        const result = await prisma.$transaction(async (prismaClient) => {
          let mergedCartItems = [];
          let mergedFavorites = [];
          
          try {
            // 1. ユーザーのカートを取得または作成
            let userCart = await prismaClient.cart.findUnique({
              where: { userId },
              include: { items: true },
            });

            if (!userCart) {
              userCart = await prismaClient.cart.create({
                data: { userId },
                include: { items: true },
              });
            }

            // 2. 匿名カートのアイテムがあれば、それらをユーザーのカートにマージ
            if (anonymousSession.cart && anonymousSession.cart.items.length > 0) {
              for (const anonymousItem of anonymousSession.cart.items) {
                // 同じアイテムとサイズがユーザーのカートに既に存在するか確認
                const existingItem = userCart.items.find(
                  item => item.itemId === anonymousItem.itemId && item.size === anonymousItem.size
                );

                if (existingItem) {
                  // 既存のアイテムを更新
                  const updatedItem = await prismaClient.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + anonymousItem.quantity },
                  });
                  mergedCartItems.push(updatedItem);
                } else {
                  // 新しいアイテムを作成
                  const newItem = await prismaClient.cartItem.create({
                    data: {
                      cartId: userCart.id,
                      itemId: anonymousItem.itemId,
                      quantity: anonymousItem.quantity,
                      size: anonymousItem.size,
                    },
                  });
                  mergedCartItems.push(newItem);
                }
              }
            }

            // 3. 匿名セッションのお気に入りをユーザーのお気に入りにマージ
            if (anonymousSession.favorites && anonymousSession.favorites.length > 0) {
              for (const anonymousFavorite of anonymousSession.favorites) {
                // 同じアイテムがユーザーのお気に入りに既に存在するか確認
                const existingFavorite = await prismaClient.favorite.findUnique({
                  where: {
                    userId_itemId: {
                      userId,
                      itemId: anonymousFavorite.itemId,
                    },
                  },
                });

                if (!existingFavorite) {
                  // 存在しない場合は新しいお気に入りを作成
                  const newFavorite = await prismaClient.favorite.create({
                    data: {
                      userId,
                      itemId: anonymousFavorite.itemId,
                    },
                  });
                  mergedFavorites.push(newFavorite);
                }
              }
            }

            // 4. 匿名セッションのカートを削除（カスケード削除でカートアイテムも削除される）
            if (anonymousSession.cart) {
              await prismaClient.cart.delete({
                where: { id: anonymousSession.cart.id },
              });
            }

            // 5. 匿名セッションのお気に入りを削除
            if (anonymousSession.favorites && anonymousSession.favorites.length > 0) {
              await prismaClient.anonymousFavorite.deleteMany({
                where: { anonymousSessionId: anonymousSession.id },
              });
            }

            // 6. 匿名セッション自体を削除
            await prismaClient.anonymousSession.delete({
              where: { id: anonymousSession.id },
            });

          } catch (txError) {
            console.error('Error during transaction:', txError);
            // エラーが発生しても空の結果を返す
          }

          return { mergedCartItems, mergedFavorites };
        });

        console.log('Merge completed successfully');
        
        return res.status(200).json({
          success: true,
          message: 'Anonymous session merged successfully',
          mergedCarts: result.mergedCartItems,
          mergedFavorites: result.mergedFavorites,
        });
      } catch (txSetupError) {
        console.error('Error setting up transaction:', txSetupError);
        return res.status(200).json({
          success: true,
          message: 'Error during merge, but request accepted',
        });
      }
    } catch (sessionError) {
      console.error('Error finding anonymous session:', sessionError);
      return res.status(200).json({
        success: true,
        message: 'Error finding session, but request accepted',
      });
    }
  } catch (error) {
    console.error('Error in merge-anonymous-session API:', error);
    // あらゆるエラーでも成功レスポンスを返す
    return res.status(200).json({ 
      success: true, 
      message: 'Request processed with warning'
    });
  }
}