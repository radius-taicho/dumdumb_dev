import Redis from 'ioredis';

// Redisが利用可能かチェックするフラグ
let redisAvailable = true;

// インメモリキャッシュのフォールバックメカニズム
const localCache = new Map<string, { data: any; expiry: number }>();

// ローカルキャッシュから取得するヘルパー関数
function localCacheGet(key: string) {
  const item = localCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  return null;
}

// ローカルキャッシュに設定するヘルパー関数
function localCacheSet(key: string, value: any, ttlSeconds: number = 300) {
  localCache.set(key, {
    data: value,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
  return true;
}

// ローカルキャッシュから削除するヘルパー関数
function localCacheDelete(key: string) {
  return localCache.delete(key);
}

// パターンマッチングキーをローカルキャッシュから削除する
function localCacheDeletePattern(pattern: string) {
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  for (const key of localCache.keys()) {
    if (regex.test(key)) {
      localCache.delete(key);
    }
  }
  return true;
}

// 環境変数から接続情報を取得するか、デフォルト値を使用
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Redisクライアントを保持する変数
let redisClient: Redis | null = null;

// シングルトンパターンでRedisクライアントを取得
// 最後のエラーログ表示時間を記録

let lastErrorLogTime = 0;
const ERROR_LOG_INTERVAL = 60000; // 1分間エラーログを出力しない

export function getRedisClient() {
  if (!redisClient) {
    try {
      redisClient = new Redis(redisUrl);
      
      // エラーハンドリング
      redisClient.on('error', (err) => {
        const now = Date.now();
        if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
          console.error('Redis connection error:', err);
          lastErrorLogTime = now;
        }
        redisAvailable = false;
        redisClient = null;
      });
      
      // 接続成功時のログ
      redisClient.on('connect', () => {
        console.log('Successfully connected to Redis');
        redisAvailable = true;
      });
    } catch (error) {
      const now = Date.now();
      if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
        console.error('Failed to create Redis client:', error);
        lastErrorLogTime = now;
      }
      redisAvailable = false;
      return null;
    }
  }
  
  return redisClient;
}

// キャッシュから値を取得するヘルパー関数
export async function cacheGet(key: string) {
  // Redisが無効な場合はローカルキャッシュを使用
  if (!redisAvailable) {
    return localCacheGet(key);
  }
  
  const redis = getRedisClient();
  if (!redis) {
    redisAvailable = false;
    return localCacheGet(key);
  }
  
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    const now = Date.now();
    if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
      console.error(`Redis cacheGet error for key ${key}:`, error);
      lastErrorLogTime = now;
    }
    redisAvailable = false;
    return localCacheGet(key);
  }
}

// キャッシュに値を設定するヘルパー関数
export async function cacheSet(key: string, value: any, ttlSeconds: number = 300) {
  // 常にローカルキャッシュにも保存（フォールバック用）
  localCacheSet(key, value, ttlSeconds);
  
  // Redisが無効な場合はローカルキャッシュのみを使用
  if (!redisAvailable) {
    return true;
  }
  
  const redis = getRedisClient();
  if (!redis) {
    redisAvailable = false;
    return true;
  }
  
  try {
    const serializedValue = JSON.stringify(value);
    await redis.set(key, serializedValue, 'EX', ttlSeconds);
    return true;
  } catch (error) {
    const now = Date.now();
    if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
      console.error(`Redis cacheSet error for key ${key}:`, error);
      lastErrorLogTime = now;
    }
    redisAvailable = false;
    return true; // ローカルキャッシュには保存済み
  }
}

// キャッシュから値を削除するヘルパー関数
export async function cacheDelete(key: string) {
  // ローカルキャッシュから削除
  localCacheDelete(key);
  
  // Redisが無効な場合はローカルキャッシュのみを使用
  if (!redisAvailable) {
    return true;
  }
  
  const redis = getRedisClient();
  if (!redis) {
    redisAvailable = false;
    return true;
  }
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    const now = Date.now();
    if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
      console.error(`Redis cacheDelete error for key ${key}:`, error);
      lastErrorLogTime = now;
    }
    redisAvailable = false;
    return true; // ローカルキャッシュからは削除済み
  }
}

// パターンマッチングに基づいてキャッシュから値を削除するヘルパー関数
export async function cacheDeletePattern(pattern: string) {
  // ローカルキャッシュから削除
  localCacheDeletePattern(pattern);
  
  // Redisが無効な場合はローカルキャッシュのみを使用
  if (!redisAvailable) {
    return true;
  }
  
  const redis = getRedisClient();
  if (!redis) {
    redisAvailable = false;
    return true;
  }
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    const now = Date.now();
    if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
      console.error(`Redis cacheDeletePattern error for pattern ${pattern}:`, error);
      lastErrorLogTime = now;
    }
    redisAvailable = false;
    return true; // ローカルキャッシュからは削除済み
  }
}
