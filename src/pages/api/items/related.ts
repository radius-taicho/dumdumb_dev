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
    const { characterId, categoryId, currentItemId, limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10) || 10;

    // characterIdまたはcategoryIdが必要
    if ((!characterId || typeof characterId !== 'string') && 
        (!categoryId || typeof categoryId !== 'string')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Character ID or Category ID is required' 
      });
    }

    // キャッシュキー
    const cacheKey = `related_items_${characterId || ''}_${categoryId || ''}_${currentItemId || ''}_${limitNum}`;
    
    // Redisからキャッシュチェック
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        items: cachedData,
        fromCache: true
      });
    }

    // 除外するアイテムID
    const excludeItemId = currentItemId && typeof currentItemId === 'string' ? currentItemId : '';

    // クエリ条件を構築
    let whereCondition: any = {};
    
    if (characterId && typeof characterId === 'string') {
      whereCondition = {
        characters: {
          some: {
            characterId
          }
        }
      };
    } else if (categoryId && typeof categoryId === 'string') {
      whereCondition = {
        categoryId
      };
    }

    // 現在のアイテムを除外
    if (excludeItemId) {
      whereCondition.id = {
        not: excludeItemId
      };
    }

    // 多様性を確保するための戦略：
    // 1. 関連アイテムを取得（最大limitNum*2まで）
    // 2. 同じキャラクター/カテゴリからのアイテムを取得
    // 3. 項目の多様性を確保するために結果を処理

    // 関連アイテムを取得（2倍の数を取得してから多様化のため）
    const items = await prisma.item.findMany({
      where: whereCondition,
      include: {
        characters: {
          include: {
            character: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: limitNum * 2,
      orderBy: [
        // 新しいアイテムを優先
        { createdAt: 'desc' }
      ]
    });

    if (items.length === 0) {
      return res.status(200).json({
        success: true,
        items: []
      });
    }

    // 多様性を確保するために結果を処理
    // 1. 各カテゴリに分類
    const categorizedItems: Record<string, any[]> = {};
    
    items.forEach(item => {
      const catId = item.categoryId;
      if (!categorizedItems[catId]) {
        categorizedItems[catId] = [];
      }
      categorizedItems[catId].push(item);
    });

    // 2. 各カテゴリから均等に選択（最大でMAX_PER_CATEGORY項目）
    const MAX_PER_CATEGORY = Math.ceil(limitNum / Object.keys(categorizedItems).length);
    let diverseItems: any[] = [];
    
    Object.values(categorizedItems).forEach(catItems => {
      // 各カテゴリから最大MAX_PER_CATEGORY項目を選択
      diverseItems = [...diverseItems, ...catItems.slice(0, MAX_PER_CATEGORY)];
    });

    // 制限に合わせてトリミング
    diverseItems = diverseItems.slice(0, limitNum);

    // レスポンス用にデータを整形
    const formattedItems = diverseItems.map(item => {
      // キャラクター情報を整形
      const characters = item.characters.map((ic: any) => ({
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
            characters,
            category: item.category
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
    console.error('Error fetching related items:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
