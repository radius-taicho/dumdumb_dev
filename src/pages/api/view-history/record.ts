import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { cacheDeletePattern } from '@/lib/redis';

type Data = {
  success: boolean;
  message?: string;
  viewHistory?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { itemId, anonymousSessionToken } = req.body;
    
    // 必須パラメータのチェック
    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    // アイテムの存在確認
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // アクセス情報の取得
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;

    let viewHistory;

    // ログインユーザーの場合
    if (userId) {
      viewHistory = await prisma.itemViewHistory.create({
        data: {
          userId,
          itemId,
        },
      });
    } 
    // 匿名セッションの場合
    else if (anonymousSessionToken) {
      // 匿名セッションの確認
      const anonymousSession = await prisma.anonymousSession.findUnique({
        where: { token: anonymousSessionToken },
      });

      if (!anonymousSession) {
        return res.status(404).json({ success: false, message: 'Anonymous session not found' });
      }

      viewHistory = await prisma.itemViewHistory.create({
        data: {
          anonymousSessionId: anonymousSession.id,
          itemId,
        },
      });
    } else {
      // どちらも指定されていない場合
      return res.status(400).json({ 
        success: false, 
        message: 'Either authenticated user or anonymous session token is required' 
      });
    }

    // 新しい視聴履歴が記録されたので、関連するキャッシュを無効化
    // ユーザー固有のキャッシュをクリア
    const cachePattern = userId 
      ? `view_history_*_${userId}_*` 
      : `view_history_*_${anonymousSessionToken}_*`;
    await cacheDeletePattern(cachePattern);

    // アイテムに関連するキャッシュもクリア
    await cacheDeletePattern(`viewed_together_${itemId}_*`);
    await cacheDeletePattern(`related_items_*_*_${itemId}_*`);

    return res.status(200).json({
      success: true,
      message: 'View history recorded',
      viewHistory,
    });
  } catch (error) {
    console.error('Error recording view history:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
