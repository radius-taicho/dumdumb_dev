import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAnonymousSession } from '@/contexts/anonymous-session';

export const useFavorites = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { anonymousSessionToken, isAuthenticated, updateFavoritesCount, refreshCounts } = useAnonymousSession();

  // お気に入りに追加
  const addToFavorites = useCallback(
    async (itemId: string) => {
      if (isLoading) return;

      try {
        setIsLoading(true);

        // 認証状態に応じたAPIエンドポイントを呼び出す
        const endpoint = isAuthenticated ? '/api/favorites/add' : '/api/favorites/anonymous-add';
        const payload = isAuthenticated
          ? { itemId }
          : { anonymousSessionToken, itemId };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('お気に入りに追加しました');
          await refreshCounts();
          return true;
        } else {
          toast.error(data.message || 'お気に入りへの追加に失敗しました');
          return false;
        }
      } catch (error) {
        console.error('お気に入り追加エラー:', error);
        toast.error('お気に入りへの追加中にエラーが発生しました');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, anonymousSessionToken, isLoading, refreshCounts]
  );

  // お気に入りから削除
  const removeFromFavorites = useCallback(
    async (itemId: string) => {
      if (isLoading) return;

      try {
        setIsLoading(true);

        // 認証状態に応じたAPIエンドポイントを呼び出す
        const endpoint = isAuthenticated ? '/api/favorites/remove' : '/api/favorites/anonymous-remove';
        const payload = isAuthenticated
          ? { itemId }
          : { anonymousSessionToken, itemId };

        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('お気に入りから削除しました');
          await refreshCounts();
          return true;
        } else {
          toast.error(data.message || 'お気に入りからの削除に失敗しました');
          return false;
        }
      } catch (error) {
        console.error('お気に入り削除エラー:', error);
        toast.error('お気に入りからの削除中にエラーが発生しました');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, anonymousSessionToken, isLoading, refreshCounts]
  );

  // お気に入り状態をチェック
  const checkFavorite = useCallback(
    async (itemId: string): Promise<boolean> => {
      try {
        // 認証状態に応じたAPIエンドポイントを呼び出す
        const endpoint = isAuthenticated 
          ? `/api/favorites/check?itemId=${itemId}` 
          : `/api/favorites/anonymous-check?token=${anonymousSessionToken}&itemId=${itemId}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (response.ok) {
          return data.isFavorite;
        } else {
          console.error('お気に入りチェックエラー:', data.message);
          return false;
        }
      } catch (error) {
        console.error('お気に入りチェックエラー:', error);
        return false;
      }
    },
    [isAuthenticated, anonymousSessionToken]
  );

  // お気に入り一覧を取得
  const getFavorites = useCallback(async () => {
    try {
      // 認証状態に応じたAPIエンドポイントを呼び出す
      const endpoint = isAuthenticated 
        ? '/api/favorites' 
        : `/api/anonymous-session/favorites?token=${anonymousSessionToken}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok) {
        return data.favorites;
      } else {
        console.error('お気に入り一覧取得エラー:', data.message);
        return [];
      }
    } catch (error) {
      console.error('お気に入り一覧取得エラー:', error);
      return [];
    }
  }, [isAuthenticated, anonymousSessionToken]);

  return {
    addToFavorites,
    removeFromFavorites,
    checkFavorite,
    getFavorites,
    isLoading,
  };
};
