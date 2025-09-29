import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma-client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 管理者権限チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Only admins can access this endpoint' 
    });
  }

  try {
    // 診断情報を収集
    const [
      totalSessions,
      activeSessions,
      expiredSessions,
      orphanedCarts,
      anonymousFavorites,
      cartItemsStats,
    ] = await Promise.all([
      // 総セッション数
      prisma.anonymousSession.count(),
      
      // アクティブなセッション数（期限内）
      prisma.anonymousSession.count({
        where: {
          expires: {
            gt: new Date()
          }
        }
      }),
      
      // 期限切れセッション数
      prisma.anonymousSession.count({
        where: {
          expires: {
            lt: new Date()
          }
        }
      }),
      
      // 孤立したカート数（セッションなし）
      prisma.cart.count({
        where: {
          userId: null,
          anonymousSessionId: null
        }
      }),
      
      // 匿名セッションのお気に入り総数
      prisma.anonymousFavorite.count(),
      
      // カートアイテムの統計
      prisma.cartItem.aggregate({
        _count: {
          _all: true
        },
        _avg: {
          quantity: true
        },
        _max: {
          quantity: true
        }
      })
    ]);

    // 重複トークンの確認
    const potentialDuplicates = await prisma.$queryRaw`
      SELECT token, COUNT(*) as count 
      FROM AnonymousSession 
      GROUP BY token 
      HAVING COUNT(*) > 1
    `;

    // 固有トークン数の確認
    const uniqueTokenCount = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT token) as unique_count 
      FROM AnonymousSession
    `;

    // 30分以内に作成されたセッション数
    const recentSessions = await prisma.anonymousSession.count({
      where: {
        createdAt: {
          gt: new Date(Date.now() - 30 * 60 * 1000) // 30分前
        }
      }
    });

    // 診断レポートを送信
    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      sessionStats: {
        total: totalSessions,
        active: activeSessions,
        expired: expiredSessions,
        recent30min: recentSessions,
        uniqueTokens: uniqueTokenCount,
        potentialDuplicates
      },
      relatedData: {
        orphanedCarts,
        anonymousFavorites,
        cartItemsStats
      },
      environment: process.env.NODE_ENV
    };

    return res.status(200).json({
      success: true,
      diagnosticReport
    });
  } catch (error) {
    console.error('Error in session diagnostic:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating diagnostic report',
      error: error.message
    });
  }
}