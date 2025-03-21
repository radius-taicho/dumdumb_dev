// このファイルは使用されなくなりました
// NextAuthの移行完了後に削除してください

// 移行ノート: このファイルのすべての機能は、NextAuthの標準機能に置き換えられました
// useSessionの代わりにuseAuthを使っていた場所は、useSessionに変更し、以下のように移行してください
// - user → session?.user
// - loading → status === 'loading'
// - error → なし (NextAuthの内部処理)
// - login → signIn
// - register → APIを直接呼び出し
// - logout → signOut

import React, { createContext, ReactNode } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// この型定義は参照用に残しています
type UserWithoutPassword = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
};

type AuthContextType = {
  user: null;
  loading: boolean;
  error: null;
  login: () => Promise<boolean>;
  register: () => Promise<boolean>;
  logout: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: async () => false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  console.warn('useAuth() は非推奨です。代わりに next-auth/react の useSession() を使用してください。');
  
  const { data: session, status } = useSession();
  
  // 最小限の互換性を提供
  return {
    user: session?.user || null,
    loading: status === 'loading',
    error: null,
    login: async () => { 
      toast.error('このメソッドは非推奨です。signIn()を使用してください'); 
      return false; 
    },
    register: async () => { 
      toast.error('このメソッドは非推奨です。APIを直接呼び出してください');
      return false; 
    },
    logout: async () => { 
      await signOut();
      return true; 
    },
  };
};
