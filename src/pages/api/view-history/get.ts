import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  message?: string;
  recentlyViewed?: any[];
  frequentlyViewed?: any[];
  recommended?: any[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // リクエストからパラメータを取得
    const { anonymousSessionToken, limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10) || 10;

    // アクセス情報の取得
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;

    let viewCondition: any = {};
    let anonymousSessionId: string | null = null;

    // ログインユーザーの場合
    if (userId) {
      viewCondition = { userId };
    } 
    // 匿名セッションの場合
    else if (anonymousSessionToken && typeof anonymousSessionToken === 'string') {
      // 匿名セッションの確認
      const anonymousSession = await prisma.anonymousSession.findUnique({
        where: { token: anonymousSessionToken },
      });

      if (!anonymousSession) {
        return res.status(404).json({ success: false, message: 'Anonymous session not found' });
      }

      anonymousSessionId = anonymousSession.id;
      viewCondition = { anonymousSessionId };
    } else {
      // どちらも指定されていない場合
      return res.status(400).json({ 
        success: false, 
        message: 'Either authenticated user or anonymous session token is required' 
      });
    }

    // 1. 最近見たアイテム
    // 各アイテムの最新の閲覧履歴のみを取得し、閲覧日時順に並べる
    const recentlyViewedRaw = await prisma.$queryRaw`
      SELECT vh.itemId, vh.viewedAt, i.name, i.price, i.images, i.gender, i.categoryId
      FROM ItemViewHistory vh
      JOIN Item i ON vh.itemId = i.id
      JOIN (
        SELECT itemId, MAX(viewedAt) as latestView
        FROM ItemViewHistory
        WHERE ${userId ? 'userId = ' + userId : 'anonymousSessionId = "' + anonymousSessionId + '"'}
        GROUP BY itemId
      ) latest ON vh.itemId = latest.itemId AND vh.viewedAt = latest.latestView
      ORDER BY vh.viewedAt DESC
      LIMIT ${limitNum}
    `;

    // 結果を整形
    const recentlyViewed = (recentlyViewedRaw as any[]).map(item => {
      // 画像URLの処理（カンマ区切りの場合は最初の画像を使用）
      const imageUrl = item.images ? item.images.split(',')[0].trim() : null;
      
      return {
        id: item.itemId,
        name: item.name,
        price: parseFloat(item.price),
        viewedAt: item.viewedAt,
        imageUrl,
        gender: item.gender,
        categoryId: item.categoryId
      };
    });

    // 2. よく見ているアイテム (閲覧回数が3回以上)
    // 閲覧回数が多い順、同数の場合は最近閲覧したものが優先
    const frequentlyViewedRaw = await prisma.$queryRaw`
      SELECT vh.itemId, MAX(vh.viewedAt) as latestView, COUNT(*) as viewCount, i.name, i.price, i.images, i.gender, i.categoryId
      FROM ItemViewHistory vh
      JOIN Item i ON vh.itemId = i.id
      WHERE ${userId ? 'vh.userId = ' + userId : 'vh.anonymousSessionId = "' + anonymousSessionId + '"'}
      GROUP BY vh.itemId
      HAVING COUNT(*) >= 3
      ORDER BY latestView DESC
      LIMIT ${limitNum}
    `;

    // 結果を整形
    const frequentlyViewed = (frequentlyViewedRaw as any[]).map(item => {
      // 画像URLの処理（カンマ区切りの場合は最初の画像を使用）
      const imageUrl = item.images ? item.images.split(',')[0].trim() : null;
      
      return {
        id: item.itemId,
        name: item.name,
        price: parseFloat(item.price),
        viewCount: parseInt(item.viewCount, 10),
        latestView: item.latestView,
        imageUrl,
        gender: item.gender,
        categoryId: item.categoryId
      };
    });

    // 3. おすすめアイテム
    // よく見ているアイテムのカテゴリやキャラクターに基づいて関連アイテムを推奨
    let recommended: any[] = [];

    if (recentlyViewed.length > 0 || frequentlyViewed.length > 0) {
      // アイテムのカテゴリIDを収集
      const viewedCategories = new Set([
        ...recentlyViewed.map(item => item.categoryId),
        ...frequentlyViewed.map(item => item.categoryId)
      ]);

      // 閲覧したアイテムのID
      const viewedItemIds = new Set([
        ...recentlyViewed.map(item => item.id),
        ...frequentlyViewed.map(item => item.id)
      ]);

      // キャラクター情報を取得（関連アイテムの推薦に使用）
      const viewedCharacters = await prisma.itemCharacter.findMany({
        where: {
          itemId: {
            in: Array.from(viewedItemIds)
          }
        },
        select: {
          characterId: true
        }
      });

      const characterIds = viewedCharacters.map(vc => vc.characterId);

      // 関連アイテムを取得
      // 1. 同じカテゴリ
      // 2. まだ見ていないアイテム
      // 3. 同じキャラクターに関連するアイテム（あれば）
      const relatedItems = await prisma.item.findMany({
        where: {
          OR: [
            // 同じカテゴリのアイテム
            {
              categoryId: {
                in: Array.from(viewedCategories)
              }
            },
            // 同じキャラクターを持つアイテム
            {
              characters: {
                some: {
                  characterId: {
                    in: characterIds
                  }
                }
              }
            }
          ],
          // 既に見たアイテムは除外
          id: {
            notIn: Array.from(viewedItemIds)
          }
        },
        take: limitNum,
        orderBy: {
          createdAt: 'desc' // 新しいアイテムを優先
        }
      });

      // 結果を整形
      recommended = relatedItems.map(item => {
        // 画像URLの処理（カンマ区切りの場合は最初の画像を使用）
        const imageUrl = item.images ? item.images.split(',')[0].trim() : null;
        
        return {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price.toString()),
          imageUrl,
          gender: item.gender
        };
      });
    }

    return res.status(200).json({
      success: true,
      recentlyViewed,
      frequentlyViewed,
      recommended
    });
  } catch (error) {
    console.error('Error getting view history:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
