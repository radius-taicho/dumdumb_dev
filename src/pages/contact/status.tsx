import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Loader, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function ContactStatus() {
  const router = useRouter();
  const { id, email } = router.query;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [inputId, setInputId] = useState(id as string || '');
  const [inputEmail, setInputEmail] = useState(email as string || '');

  // ステータス表示用の翻訳マップ
  const statusMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    pending: {
      label: '受付済み（確認待ち）',
      color: 'text-yellow-600',
      icon: <Clock className="w-5 h-5" />,
    },
    inProgress: {
      label: '対応中',
      color: 'text-blue-600',
      icon: <Clock className="w-5 h-5" />,
    },
    completed: {
      label: '対応完了',
      color: 'text-green-600',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    spam: {
      label: '不明なステータス',
      color: 'text-gray-600',
      icon: <AlertCircle className="w-5 h-5" />,
    },
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // ステータスを取得する関数
  const checkStatus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputId || !inputEmail) {
      setError('お問い合わせIDとメールアドレスを入力してください');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/contact/status?id=${encodeURIComponent(inputId)}&email=${encodeURIComponent(inputEmail)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '情報の取得に失敗しました');
      }
      
      setStatusData(data.data);
      
      // URLをステータス情報で更新（リロード時に再入力不要に）
      router.push(
        {
          pathname: '/contact/status',
          query: { id: inputId, email: inputEmail }
        },
        undefined,
        { shallow: true }
      );
      
    } catch (error) {
      console.error('Error fetching status:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : '情報の取得中にエラーが発生しました'
      );
    } finally {
      setLoading(false);
    }
  };

  // URL内にIDとメールが含まれている場合、自動的にステータスを確認
  React.useEffect(() => {
    if (id && email && typeof id === 'string' && typeof email === 'string') {
      setInputId(id);
      setInputEmail(email);
      checkStatus();
    }
  }, [id, email]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-center">お問い合わせステータス確認</h1>
      <p className="text-center text-gray-600 mb-8">
        お問い合わせID（受付番号）とメールアドレスを入力して、対応状況をご確認いただけます。
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <form onSubmit={checkStatus}>
          <div className="mb-4">
            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 mb-1">
              お問い合わせID
            </label>
            <input
              id="contactId"
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
              placeholder="例：clfg7x9c10000abc123def456"
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
              placeholder="例：example@mail.com"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              お問い合わせ時に入力したメールアドレスをご入力ください。
            </p>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                確認中...
              </>
            ) : (
              'ステータスを確認する'
            )}
          </button>
        </form>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {statusData && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">お問い合わせ状況</h2>
          
          <div className="flex items-center mb-4">
            <div className={`mr-2 ${statusMap[statusData.status]?.color || 'text-gray-600'}`}>
              {statusMap[statusData.status]?.icon || <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-medium">ステータス：</span>
              <span className={`${statusMap[statusData.status]?.color || 'text-gray-600'} font-medium`}>
                {statusMap[statusData.status]?.label || '不明なステータス'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex">
              <span className="w-32 font-medium text-gray-600">受付日時：</span>
              <span>{formatDate(statusData.createdAt)}</span>
            </div>
            
            <div className="flex">
              <span className="w-32 font-medium text-gray-600">最終更新：</span>
              <span>{formatDate(statusData.updatedAt)}</span>
            </div>
            
            {statusData.hasResponse && (
              <div className="flex">
                <span className="w-32 font-medium text-gray-600">回答日時：</span>
                <span>{formatDate(statusData.responseDate)}</span>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            {statusData.status === 'pending' && (
              <p className="text-sm text-gray-600">
                お問い合わせを受け付けました。担当者が内容を確認次第、ご回答いたします。
                通常、1～2営業日以内にご返信いたしますが、内容によっては回答までにお時間をいただく場合がございます。
              </p>
            )}
            
            {statusData.status === 'inProgress' && (
              <p className="text-sm text-gray-600">
                担当者がお問い合わせ内容を確認し、対応を進めております。
                詳細な調査が必要な場合など、回答までにお時間をいただく場合がございます。
                今しばらくお待ちくださいますようお願いいたします。
              </p>
            )}
            
            {statusData.status === 'completed' && (
              <p className="text-sm text-gray-600">
                {statusData.hasResponse
                  ? 'お問い合わせへの回答を送信いたしました。ご登録のメールアドレス宛にご確認ください。'
                  : 'お問い合わせへの対応が完了しました。'}
                メールが届かない場合は、迷惑メールフォルダをご確認いただくか、
                <a href="/contact" className="text-blue-600 hover:underline">こちら</a>からお問い合わせください。
              </p>
            )}
          </div>
          
          {statusData.status !== 'completed' && (
            <div className="mt-6 text-center">
              <a
                href="/contact"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                別のお問い合わせをする
              </a>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-2">
          お問い合わせに関するサポートが必要な場合は、
          <a href="/faq" className="text-blue-600 hover:underline">よくある質問</a>
          をご確認ください。
        </p>
        <p className="text-sm text-gray-600">
          または、
          <a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a>
          から新しいお問い合わせを作成することもできます。
        </p>
      </div>
    </div>
  );
}
