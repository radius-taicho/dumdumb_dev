import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 簡単なセキュリティチェック - 開発環境のみで実行
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ success: false, message: 'This operation is only allowed in development environment' });
  }

  try {
    // 期限切れセッションをクリーンアップ
    const now = new Date();
    const expiredSessionsCount = await prisma.anonymousSession.deleteMany({
      where: {
        expires: {
          lt: now
        }
      }
    });

    // 異常な重複トークンを検出し、セッション数をカウント
    const allTokens = await prisma.anonymousSession.findMany({
      select: { token: true }
    });

    const tokenCounts = {};
    allTokens.forEach(session => {
      tokenCounts[session.token] = (tokenCounts[session.token] || 0) + 1;
    });

    const duplicateTokens = Object.entries(tokenCounts)
      .filter(([_, count]) => count > 1)
      .map(([token, count]) => ({ token, count }));

    // セッション総数
    const totalSessions = await prisma.anonymousSession.count();

    // システム情報
    const diagnostics = {
      totalSessions,
      expiredSessionsRemoved: expiredSessionsCount.count,
      duplicateTokensFound: duplicateTokens.length,
      duplicateTokens: duplicateTokens,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      diagnostics
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during cleanup operation',
      error: error.message
    });
  }
}
