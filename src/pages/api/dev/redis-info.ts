import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from '@/lib/redis';

// ⚠️ 注意: このエンドポイントは開発環境でのみ有効にし、
// 本番環境では必ずアクセス制限をかけるか無効化してください

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 本番環境でこのAPIを保護
  if (process.env.NODE_ENV === 'production') {
    // 開発者IPアドレスやセキュアなアクセスチェックがない場合は無効化
    if (!process.env.ALLOW_REDIS_INFO || process.env.ALLOW_REDIS_INFO !== 'true') {
      return res.status(403).json({ error: 'This endpoint is disabled in production' });
    }
  }

  try {
    const redis = getRedisClient();
    
    if (!redis) {
      return res.status(500).json({ error: 'Redis client not available' });
    }

    // Redisの基本情報を取得
    const info = await redis.info();
    
    // キャッシュされているキーのパターンを取得
    const keys = await redis.keys('*');
    
    // キャッシュのサイズを取得（サンプルとして最初の10キー）
    const sampleKeys = keys.slice(0, 10);
    const sizes = await Promise.all(
      sampleKeys.map(async (key) => {
        const size = await redis.memory('usage', key);
        return { key, size };
      })
    );

    // パターンごとのキー数をカウント
    const patterns = {
      'view_history': keys.filter(k => k.startsWith('view_history')).length,
      'viewed_together': keys.filter(k => k.startsWith('viewed_together')).length,
      'related_items': keys.filter(k => k.startsWith('related_items')).length,
      'other': keys.filter(k => 
        !k.startsWith('view_history') && 
        !k.startsWith('viewed_together') && 
        !k.startsWith('related_items')
      ).length
    };

    return res.status(200).json({
      uptime: info.split('\n').find(line => line.startsWith('uptime_in_seconds')),
      memoryUsed: info.split('\n').find(line => line.startsWith('used_memory_human')),
      connectedClients: info.split('\n').find(line => line.startsWith('connected_clients')),
      totalKeys: keys.length,
      patternCounts: patterns,
      sampleKeys: sizes,
    });
  } catch (error) {
    console.error('Error fetching Redis info:', error);
    return res.status(500).json({ error: 'Failed to fetch Redis information' });
  }
}
