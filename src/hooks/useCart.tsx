import { useState, useCallback } from 'react';
import { Size } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { useAnonymousSession } from '@/contexts/anonymous-session';

export const useCart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { anonymousSessionToken, isAuthenticated, updateCartCount, refreshCounts } = useAnonymousSession();

  // カートに商品を追加する
  const addToCart = useCallback(
    async (itemId: string, quantity: number, size?: Size | null) => {
      if (isLoading) return;

      try {
        setIsLoading(true);

        // 認証状態に応じたAPIエンドポイントを呼び出す
        const endpoint = isAuthenticated ? '/api/cart/add' : '/api/cart/anonymous-add';
        const payload = isAuthenticated
          ? { itemId, quantity, size }
          : { anonymousSessionToken, itemId, quantity, size };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message || 'カートに追加しました');
          await refreshCounts();
          return true;
        } else {
          toast.error(data.message || 'カートへの追加に失敗しました');
          return false;
        }
      } catch (error) {
        console.error('カート追加エラー:', error);
        toast.error('カートへの追加中にエラーが発生しました');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, anonymousSessionToken, isLoading, refreshCounts]
  );

  // カートから商品を削除する
  const removeFromCart = useCallback(
    async (itemId: string, size?: Size | null) => {
      if (isLoading) return;

      try {
        setIsLoading(true);

        // 認証状態に応じたAPIエンドポイントを呼び出す
        const endpoint = isAuthenticated ? '/api/cart/remove' : '/api/cart/anonymous-remove';
        const payload = isAuthenticated
          ? { itemId, size }
          : { anonymousSessionToken, itemId, size };

        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.message || 'カートから削除しました');
          await refreshCounts();
          return true;
        } else {
          toast.error(data.message || 'カートからの削除に失敗しました');
          return false;
        }
      } catch (error) {
        console.error('カート削除エラー:', error);
        toast.error('カートからの削除中にエラーが発生しました');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, anonymousSessionToken, isLoading, refreshCounts]
  );

  // カート内の商品の数量を更新する
  const updateCartQuantity = useCallback(
    async (itemId: string, quantity: number, size?: Size | null) => {
      if (isLoading) return;

      try {
        setIsLoading(true);

        // 認証状態に応じたAPIエンドポイントを呼び出す
        const endpoint = isAuthenticated ? '/api/cart/update' : '/api/cart/anonymous-update';
        const payload = isAuthenticated
          ? { itemId, quantity, size }
          : { anonymousSessionToken, itemId, quantity, size };

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          await refreshCounts();
          return true;
        } else {
          toast.error(data.message || 'カートの更新に失敗しました');
          return false;
        }
      } catch (error) {
        console.error('カート更新エラー:', error);
        toast.error('カートの更新中にエラーが発生しました');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, anonymousSessionToken, isLoading, refreshCounts]
  );

  // カートを取得する
  const getCart = useCallback(async () => {
    try {
      // 認証状態に応じたAPIエンドポイントを呼び出す
      const endpoint = isAuthenticated 
        ? '/api/cart' 
        : `/api/anonymous-session/cart?token=${anonymousSessionToken}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok) {
        return data.cart;
      } else {
        console.error('カート取得エラー:', data.message);
        return null;
      }
    } catch (error) {
      console.error('カート取得エラー:', error);
      return null;
    }
  }, [isAuthenticated, anonymousSessionToken]);

  return {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCart,
    isLoading,
  };
};
