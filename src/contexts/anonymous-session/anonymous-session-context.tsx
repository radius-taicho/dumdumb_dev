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

// 新しいランダムUUIDを生成する関数
// 旧トークンが取得できなかった場合のバックアップとして使用
const generateSessionToken = (): string => {
  try {
    // UUIDライブラリを使用して新しいトークンを生成
    return uuidv4();
  } catch (e) {
    // バックアップ方法として現在時刻を使用
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
};

// 即時セッションの保存
// 小さなユーティリティ関数集
const sessionUtils = {
  // クッキーからトークンを取得
  getToken: (): string | null => {
    try {
      return Cookies.get(ANONYMOUS_SESSION_TOKEN_COOKIE) || null;
    } catch (e) {
      console.error('Error reading session cookie:', e);
      return null;
    }
  },
  
  // トークンを保存
  saveToken: (token: string): boolean => {
    try {
      Cookies.set(ANONYMOUS_SESSION_TOKEN_COOKIE, token, { 
        expires: ANONYMOUS_SESSION_EXPIRY_DAYS,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return true;
    } catch (e) {
      console.error('Error saving session cookie:', e);
      return false;
    }
  },
  
  // トークンを削除
  removeToken: (): boolean => {
    try {
      Cookies.remove(ANONYMOUS_SESSION_TOKEN_COOKIE);
      return true;
    } catch (e) {
      console.error('Error removing session cookie:', e);
      return false;
    }
  },
  
  // セッションの初期化
  initializeSession: async (token: string): Promise<{success: boolean, message?: string}> => {
    try {
      const response = await fetch('/api/anonymous-session/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      if (response.ok) {
        const data = await response.json().catch(() => ({ success: true }));
        return { success: true, message: data.message || 'Session initialized' };
      }
      
      return { success: false, message: 'Failed to initialize session' };
    } catch (e) {
      console.error('Session initialization error:', e);
      return { success: false, message: 'Error during session initialization' };
    }
  }
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
          const token = sessionUtils.getToken();
          if (token) {
            try {
              const response = await fetch('/api/auth/merge-anonymous-session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ anonymousSessionToken: token }),
              });
              
              if (response.ok) {
                console.log('Anonymous session merged successfully');
              }
              
              // マージ完了後、匿名セッショントークンを削除
              sessionUtils.removeToken();
            } catch (error) {
              console.log('Failed to merge anonymous session:', error);
            }
          }
          
          setAnonymousSessionToken(null);
        } else {
          // 認証されていない場合の処理
          // 安全に実行するルーチン
          let token = sessionUtils.getToken();
          
          // 既存トークンがない場合は新規生成
          if (!token) {
            token = generateSessionToken();
            sessionUtils.saveToken(token);
          }
          
          setAnonymousSessionToken(token);
          
          // 安全な引数チェックと実行
          if (token && typeof token === 'string') {
            // セッション初期化
            const initResult = await sessionUtils.initializeSession(token);
            
            if (!initResult.success) {
              console.warn('Session initialization had issues:', initResult.message);
              // 失敗した場合、新しいトークンで再試行
              const newToken = generateSessionToken();
              sessionUtils.saveToken(newToken);
              setAnonymousSessionToken(newToken);
              
              // 新しいトークンで再度初期化を試行
              await sessionUtils.initializeSession(newToken);
            }
          }
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
        : `/api/anonymous-session/counts?token=${encodeURIComponent(anonymousSessionToken || '')}`;
      
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setCartCount(data.cartCount || 0);
          setFavoritesCount(data.favoritesCount || 0);
        } else {
          // レスポンスが成功でない場合は0カウントを設定
          console.log('Failed to fetch counts, setting zero counts');
          setCartCount(0);
          setFavoritesCount(0);
        }
      } catch (fetchError) {
        console.log('Failed to fetch counts:', fetchError);
        // エラー時は0カウントを設定
        setCartCount(0);
        setFavoritesCount(0);
      }
    } catch (error) {
      console.log('Error in refresh counts function:', error);
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
