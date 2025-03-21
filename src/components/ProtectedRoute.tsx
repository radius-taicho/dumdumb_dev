import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';

  useEffect(() => {
    // ロード中は何もしない
    if (loading) return;

    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (status === 'unauthenticated') {
      // クエリパラメーターにリダイレクト先を追加
      router.push({
        pathname: '/auth/login',
        query: { redirect: router.asPath }
      });
    }
  }, [status, loading, router]);

  // ロード中またはユーザーがログインしていない場合は読み込み中を表示
  if (loading || status === 'unauthenticated') {
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