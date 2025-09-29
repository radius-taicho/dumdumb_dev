import React, { useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

const PasswordChangePage: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // バリデーション
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('新しいパスワードと確認用パスワードが一致しません');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'パスワードの変更に失敗しました');
      }
      
      toast.success('パスワードを変更しました');
      router.push('/mypage/account-settings');
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'パスワードの変更に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>パスワード変更 | DumDumb</title>
        <meta name="description" content="DumDumbのパスワード変更ページ" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/mypage/account-settings" className="mr-2">
            <span className="text-gray-500 hover:text-gray-700">
              &lt; アカウント情報に戻る
            </span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">パスワード変更</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                現在のパスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                新しいパスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">8文字以上で入力してください</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                新しいパスワード（確認用） <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md disabled:opacity-50"
              >
                {isLoading ? '処理中...' : 'パスワードを変更する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login?redirect=/mypage/account-settings/password',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default PasswordChangePage;
