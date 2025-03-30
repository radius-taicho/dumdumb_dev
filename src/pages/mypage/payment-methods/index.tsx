import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import ProtectedRoute from '@/components/ProtectedRoute';
import PaymentMethodModal from '@/components/mypage/payment/PaymentMethodModal';

type PaymentMethod = {
  id: string;
  type: string;
  cardNumber?: string | null;
  cardHolderName?: string | null;
  expiryMonth?: string | null;
  expiryYear?: string | null;
  amazonPayId?: string | null;
  isDefault: boolean;
};

const PaymentMethodsPage: NextPage = () => {
  const { data: session } = useSession();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 支払い方法一覧の取得
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-methods/list');
      if (!response.ok) throw new Error('支払い方法の取得に失敗しました');
      const data = await response.json();
      setPaymentMethods(data.paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      alert('支払い方法の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPaymentMethods();
    }
  }, [session]);

  // 支払い方法の追加
  const handlePaymentMethodSubmit = async (paymentData: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '支払い方法の保存に失敗しました');
      }

      await fetchPaymentMethods();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert(error instanceof Error ? error.message : '支払い方法の保存に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // 支払い方法の削除
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('この支払い方法を削除してもよろしいですか？')) return;
    
    try {
      const response = await fetch('/api/payment-methods/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '支払い方法の削除に失敗しました');
      }

      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert(error instanceof Error ? error.message : '支払い方法の削除に失敗しました');
    }
  };

  // 支払い方法のカード表示用にマスク処理
  const getCardDisplay = (method: PaymentMethod) => {
    if (method.type === 'CREDIT_CARD' && method.cardNumber) {
      const lastFour = method.cardNumber.replace(/\s/g, '').slice(-4);
      return `**** **** **** ${lastFour}`;
    }
    return null;
  };

  // 支払い方法のタイプ表示
  const getPaymentTypeDisplay = (method: PaymentMethod) => {
    switch (method.type) {
      case 'CREDIT_CARD':
        return 'クレジットカード';
      case 'AMAZON_PAY':
        return 'Amazon Pay';
      case 'OTHER':
        return '代金引換';
      default:
        return method.type;
    }
  };

  // 支払い方法のアイコン
  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'CREDIT_CARD':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        );
      case 'AMAZON_PAY':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        );
      case 'OTHER':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
            <path d="M10 7a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>お支払い方法 | DumDumb</title>
        <meta name="description" content="DumDumbのお支払い方法設定ページ" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/mypage" className="mr-2">
            <span className="text-gray-500 hover:text-gray-700">
              &lt; マイページに戻る
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">お支払い方法</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
          >
            お支払い方法を追加
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>読み込み中...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">登録されたお支払い方法はありません</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
            >
              お支払い方法を追加する
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {paymentMethods.map((method) => (
              <div key={method.id} className="border rounded-lg p-4 bg-white relative">
                {method.isDefault && (
                  <span className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                    デフォルト
                  </span>
                )}
                <div className="flex items-start mb-4">
                  <div className="mr-3">
                    {getPaymentIcon(method)}
                  </div>
                  <div>
                    <p className="font-semibold">{getPaymentTypeDisplay(method)}</p>
                    {method.type === 'CREDIT_CARD' && (
                      <>
                        <p className="text-gray-600">{getCardDisplay(method)}</p>
                        {method.expiryMonth && method.expiryYear && (
                          <p className="text-sm text-gray-500">
                            有効期限: {method.expiryMonth}/{method.expiryYear}
                          </p>
                        )}
                      </>
                    )}
                    {method.type === 'AMAZON_PAY' && (
                      <p className="text-sm text-gray-600">Amazonアカウントでの支払い</p>
                    )}
                    {method.type === 'OTHER' && (
                      <p className="text-sm text-gray-600">商品到着時に配達員にお支払い</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 支払い方法モーダル */}
        {showModal && (
          <PaymentMethodModal
            onClose={() => setShowModal(false)}
            onSubmit={handlePaymentMethodSubmit}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login?redirect=/mypage/payment-methods',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default PaymentMethodsPage;
