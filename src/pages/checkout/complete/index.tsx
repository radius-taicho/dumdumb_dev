import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CompleteRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // ThankYouForPurchase ページに遷移するロジック
    router.push('/checkout/thanks');
  }, [router]);

  // 遷移中に表示する内容（通常はこのコンポーネントは表示されない）
  return <div className="text-center p-8">リダイレクト中...</div>;
}
