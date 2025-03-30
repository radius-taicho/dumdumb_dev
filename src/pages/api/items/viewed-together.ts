import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet } from '@/lib/redis';

type Data = {
  success: boolean;
  message?: string;
  items?: any[];
};

// キャッシュTTL
const CACHE_TTL = 5 * 60; // 5分間（秒単位）

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { itemId, limit = '6' } = req.query;
    const limitNum = parseInt(limit as string, 10) || 6;

    if (!itemId || typeof itemId !== 'string') {
      return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    // キャッシュキー
    const cacheKey = `viewed_together_${itemId}_${limitNum}`;
    
    // Redisからキャッシュチェック
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        items: cachedData,
        fromCache: true
      });
    }

    // このアイテムを見たユーザーを取得
    const viewers = await prisma.itemViewHistory.findMany({
      where: { itemId },
      select: { 
        userId: true,
        anonymousSessionId: true 
      },
      distinct: ['userId', 'anonymousSessionId']
    });

    if (viewers.length === 0) {
      return res.status(200).json({
        success: true,
        items: []
      });
    }

    // ユーザー条件を構築
    const userConditions = viewers.map(v => {
      if (v.userId) {
        return { userId: v.userId };
      }
      if (v.anonymousSessionId) {
        return { anonymousSessionId: v.anonymousSessionId };
      }
      return null;
    }).filter(Boolean);

    // これらのユーザーが見た他のアイテム
    const viewedItems = await prisma.itemViewHistory.findMany({
      where: {
        OR: userConditions,
        NOT: { itemId }
      },
      select: { 
        itemId: true 
      }
    });

    // アイテム出現頻度カウント
    const itemCounts: Record<string, number> = {};
    viewedItems.forEach(v => {
      itemCounts[v.itemId] = (itemCounts[v.itemId] || 0) + 1;
    });

    // 出現頻度順にソート
    const topItemIds = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limitNum)
      .map(([id]) => id);

    if (topItemIds.length === 0) {
      return res.status(200).json({
        success: true,
        items: []
      });
    }

    // 詳細情報を取得
    const items = await prisma.item.findMany({
      where: { 
        id: { in: topItemIds } 
      },
      include: {
        characters: {
          include: {
            character: true
          }
        }
      },
      take: limitNum
    });

    // レスポンス用にデータを整形
    const formattedItems = items.map(item => {
      // キャラクター情報を整形
      const characters = item.characters.map(ic => ({
        id: ic.character.id,
        name: ic.character.name,
        image: ic.character.image
      }));

      // BigInt型をJSON化するために文字列に変換
      const serializedItem = JSON.parse(
        JSON.stringify(
          {
            id: item.id,
            name: item.name,
            price: item.price,
            images: item.images,
            characters
          },
          (key, value) => typeof value === 'bigint' ? value.toString() : value
        )
      );

      return serializedItem;
    });

    // キャッシュに保存
    await cacheSet(cacheKey, formattedItems, CACHE_TTL);

    return res.status(200).json({
      success: true,
      items: formattedItems
    });
  } catch (error) {
    console.error('Error fetching items viewed together:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
