import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

// 匿名セッション管理のための定数
const ANONYMOUS_SESSION_TOKEN_COOKIE = 'anonymous_session_token';
const ANONYMOUS_SESSION_EXPIRY_DAYS = 30; // 期限は30日

// 匿名セッションの型定義
type AnonymousSessionContextType = {
  anonymousSessionToken: string | null;
  isAnonymousSessionLoading: boolean;
  isAuthenticated: boolean;
  cartCount: number;
  favoritesCount: number;
  updateCartCount: (count: number) => void;
  updateFavoritesCount: (count: number) => void;
  refreshCounts: () => Promise<void>;
};

// コンテキストの作成
const AnonymousSessionContext = createContext<AnonymousSessionContextType | null>(null);

// コンテキストプロバイダーのprops型
interface AnonymousSessionProviderProps {
  children: ReactNode;
}

// 匿名セッショントークンを取得または生成する関数
const getOrCreateAnonymousSessionToken = (): string => {
  // 既存のトークンを取得
  let token = Cookies.get(ANONYMOUS_SESSION_TOKEN_COOKIE);

  // トークンが存在しない場合は新しいトークンを生成
  if (!token) {
    token = uuidv4();
    
    // トークンをクッキーに保存（30日間有効）
    Cookies.set(ANONYMOUS_SESSION_TOKEN_COOKIE, token, { 
      expires: ANONYMOUS_SESSION_EXPIRY_DAYS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return token;
};

// 匿名セッションプロバイダーコンポーネント
export const AnonymousSessionProvider: React.FC<AnonymousSessionProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [anonymousSessionToken, setAnonymousSessionToken] = useState<string | null>(null);
  const [isAnonymousSessionLoading, setIsAnonymousSessionLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // 認証状態をチェック
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  // 初期化処理
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // 認証済みの場合は匿名セッションを使用しない
        if (isAuthenticated) {
          // ユーザーがログインしている場合、匿名セッションのカート・お気に入りをマージするAPI呼び出し
          const token = Cookies.get(ANONYMOUS_SESSION_TOKEN_COOKIE);
          if (token) {
            try {
              await fetch('/api/auth/merge-anonymous-session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ anonymousSessionToken: token }),
              });
              
              // マージ完了後、匿名セッショントークンを削除
              Cookies.remove(ANONYMOUS_SESSION_TOKEN_COOKIE);
            } catch (error) {
              console.log('Failed to merge anonymous session, but continuing');
            }
          }
          
          setAnonymousSessionToken(null);
        } else {
          // 認証されていない場合、匿名セッショントークンを取得または生成
          const token = getOrCreateAnonymousSessionToken();
          setAnonymousSessionToken(token);
          
          // 匿名セッションの初期化処理
          await fetch('/api/anonymous-session/initialize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });
        }
        
        // カウンター情報を更新
        await refreshCounts();
      } catch (error) {
        console.log('Failed to initialize anonymous session, but continuing');
      } finally {
        setIsAnonymousSessionLoading(false);
      }
    };

    initializeSession();
  }, [isAuthenticated]);

  // カート数とお気に入り数を更新する関数
  const refreshCounts = async () => {
    try {
      // ログイン状態に応じたエンドポイントを使用
      const endpoint = isAuthenticated 
        ? '/api/user/counts' 
        : `/api/anonymous-session/counts?token=${anonymousSessionToken}`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cartCount || 0);
        setFavoritesCount(data.favoritesCount || 0);
      } else {
        // レスポンスが成功でない場合は0カウントを設定
        setCartCount(0);
        setFavoritesCount(0);
      }
    } catch (error) {
      console.log('Failed to fetch counts, but continuing');
      // エラー時は0カウントを設定
      setCartCount(0);
      setFavoritesCount(0);
    }
  };

  // カート数を更新
  const updateCartCount = (count: number) => {
    setCartCount(count);
  };

  // お気に入り数を更新
  const updateFavoritesCount = (count: number) => {
    setFavoritesCount(count);
  };

  const contextValue = {
    anonymousSessionToken,
    isAnonymousSessionLoading,
    isAuthenticated,
    cartCount,
    favoritesCount,
    updateCartCount,
    updateFavoritesCount,
    refreshCounts,
  };

  return (
    <AnonymousSessionContext.Provider value={contextValue}>
      {children}
    </AnonymousSessionContext.Provider>
  );
};

// カスタムフック
export const useAnonymousSession = () => {
  const context = useContext(AnonymousSessionContext);
  if (!context) {
    throw new Error('useAnonymousSession must be used within an AnonymousSessionProvider');
  }
  return context;
};
