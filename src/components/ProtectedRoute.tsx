import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/auth-context';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ロード中は何もしない
    if (loading) return;

    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // ロード中またはユーザーがログインしていない場合は何も表示しない
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // ログイン済みの場合は子コンポーネントを表示
  return <>{children}</>;
};

export default ProtectedRoute;
