import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  message?: string;
  recommendations?: any[];
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
    const { anonymousSessionToken, limit = '12' } = req.query;
    const limitNum = parseInt(limit as string, 10) || 12;

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

    // 1. 最近見たアイテムの取得
    const recentlyViewedRaw = await prisma.$queryRaw`
      SELECT vh.itemId, vh.viewedAt, i.name, i.price, i.categoryId
      FROM ItemViewHistory vh
      JOIN Item i ON vh.itemId = i.id
      JOIN (
        SELECT itemId, MAX(viewedAt) as latestView
        FROM ItemViewHistory
        WHERE ${userId ? 'userId = ' + userId : 'anonymousSessionId = "' + anonymousSessionId + '"'}
        GROUP BY itemId
      ) latest ON vh.itemId = latest.itemId AND vh.viewedAt = latest.latestView
      ORDER BY vh.viewedAt DESC
    `;

    // 2. よく見ているアイテムの取得
    const frequentlyViewedRaw = await prisma.$queryRaw`
      SELECT vh.itemId, MAX(vh.viewedAt) as latestView, COUNT(*) as viewCount, i.categoryId
      FROM ItemViewHistory vh
      JOIN Item i ON vh.itemId = i.id
      WHERE ${userId ? 'vh.userId = ' + userId : 'vh.anonymousSessionId = "' + anonymousSessionId + '"'}
      GROUP BY vh.itemId
      HAVING COUNT(*) >= 3
      ORDER BY viewCount DESC, latestView DESC
    `;

    // 視聴アイテムが存在しない場合は人気アイテムをおすすめ
    if ((recentlyViewedRaw as any[]).length === 0 && (frequentlyViewedRaw as any[]).length === 0) {
      const popularItems = await prisma.item.findMany({
        take: limitNum,
        orderBy: {
          id: 'desc' // 新着アイテム順
        }
      });

      const recommendations = popularItems.map(item => {
        const imageUrl = item.images ? item.images.split(',')[0].trim() : null;
        
        return {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price.toString()),
          imageUrl,
          gender: item.gender,
          recommendReason: '新着アイテム'
        };
      });

      return res.status(200).json({
        success: true,
        recommendations
      });
    }

    // 視聴履歴を整形
    const recentlyViewed = (recentlyViewedRaw as any[]).map(item => ({
      id: item.itemId,
      categoryId: item.categoryId,
      viewedAt: new Date(item.viewedAt)
    }));

    const frequentlyViewed = (frequentlyViewedRaw as any[]).map(item => ({
      id: item.itemId,
      categoryId: item.categoryId,
      viewCount: parseInt(item.viewCount, 10),
      latestView: new Date(item.latestView)
    }));

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

    // カテゴリにスコアを付ける
    const categoryScores: Record<string, number> = {};
    
    // 最近見たアイテムに基づいてカテゴリにスコア付け
    recentlyViewed.forEach((item, index) => {
      if (!categoryScores[item.categoryId]) {
        categoryScores[item.categoryId] = 0;
      }
      // 最近見た順に高いスコアを付ける
      categoryScores[item.categoryId] += (recentlyViewed.length - index);
    });
    
    // よく見るアイテムに基づいてカテゴリにスコア付け
    frequentlyViewed.forEach(item => {
      if (!categoryScores[item.categoryId]) {
        categoryScores[item.categoryId] = 0;
      }
      // 視聴回数に基づいてスコアを付ける
      categoryScores[item.categoryId] += (item.viewCount || 3); // デフォルトは3
    });
    
    // スコア順にソートしたカテゴリID配列
    const sortedCategories = Object.entries(categoryScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([id]) => id);
    
    // キャラクター情報を取得
    const viewedCharacters = await prisma.itemCharacter.findMany({
      where: {
        itemId: {
          in: Array.from(viewedItemIds)
        }
      },
      select: {
        characterId: true,
        character: {
          select: {
            name: true
          }
        }
      }
    });

    const characterIds = viewedCharacters.map(vc => vc.characterId);
    const characterNameMap: Record<string, string> = {};
    viewedCharacters.forEach(vc => {
      if (vc.character?.name) {
        characterNameMap[vc.characterId] = vc.character.name;
      }
    });

    // カテゴリ名のマップを取得
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: Array.from(viewedCategories)
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const categoryNameMap: Record<string, string> = {};
    categories.forEach(cat => {
      categoryNameMap[cat.id] = cat.name;
    });

    // 各カテゴリからいくつかのアイテムを取得
    const perCategoryLimit = Math.max(2, Math.ceil(limitNum / sortedCategories.length));
    
    // 各カテゴリからアイテムを取得し、結合
    const recommendedByCategory = await Promise.all(
      sortedCategories.map(async (categoryId) => {
        const items = await prisma.item.findMany({
          where: {
            categoryId: categoryId,
            id: {
              notIn: Array.from(viewedItemIds)
            }
          },
          take: perCategoryLimit,
          orderBy: {
            createdAt: 'desc' // 新しいアイテムを優先
          }
        });

        return items.map(item => ({
          ...item,
          recommendReason: `${categoryNameMap[categoryId] || 'カテゴリ'}のアイテム`
        }));
      })
    );
    
    // すべてのカテゴリからのアイテムをフラット化
    const itemsByCategory = recommendedByCategory.flat();
    
    // キャラクターに基づくアイテムも取得
    let itemsByCharacter: any[] = [];
    if (characterIds.length > 0) {
      const characterItems = await prisma.itemCharacter.findMany({
        where: {
          characterId: {
            in: characterIds
          },
          itemId: {
            notIn: Array.from(viewedItemIds)
          }
        },
        include: {
          item: true,
          character: {
            select: {
              name: true
            }
          }
        },
        take: limitNum
      });
      
      itemsByCharacter = characterItems.map(ci => ({
        ...ci.item,
        recommendReason: `${ci.character?.name || 'キャラクター'}関連のアイテム`
      }));
    }
    
    // カテゴリとキャラクターのアイテムを結合し、重複を除去
    const combinedItems = [...itemsByCategory, ...itemsByCharacter];
    const uniqueItemIds = new Set<string>();
    const uniqueItems: any[] = [];
    
    combinedItems.forEach(item => {
      if (!uniqueItemIds.has(item.id)) {
        uniqueItemIds.add(item.id);
        uniqueItems.push(item);
      }
    });
    
    // 上限数に制限
    const recommendations = uniqueItems.slice(0, limitNum).map(item => {
      // 画像URLの処理（カンマ区切りの場合は最初の画像を使用）
      const imageUrl = item.images ? item.images.split(',')[0].trim() : null;
      
      return {
        id: item.id,
        name: item.name,
        price: parseFloat(item.price.toString()),
        imageUrl,
        gender: item.gender,
        recommendReason: item.recommendReason || 'おすすめアイテム'
      };
    });

    return res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
