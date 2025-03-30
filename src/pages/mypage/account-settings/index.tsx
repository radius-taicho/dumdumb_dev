import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import ProtectedRoute from '@/components/ProtectedRoute';
import AccountEditModal from '@/components/mypage/account/AccountEditModal';
import ProfileImageModal from '@/components/mypage/account/ProfileImageModal';
import PasswordChangeModal from '@/components/mypage/account/PasswordChangeModal';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

const AccountSettingsPage: NextPage = () => {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [defaultIconUrl, setDefaultIconUrl] = useState<string | null>(null);
  
  // デバッグ用 - セッション情報をコンソールに出力
  useEffect(() => {
    if (session) {
      console.log('Current session user data:', session.user);
      console.log('Nickname value:', session.user.name);
    }
  }, [session]);

  // デフォルトアイコンを取得
  useEffect(() => {
    const fetchDefaultIcon = async () => {
      try {
        const response = await fetch('/api/user/icons');
        if (response.ok) {
          const data = await response.json();
          setDefaultIconUrl(data.defaultIconUrl);
        }
      } catch (error) {
        console.error('Error fetching default icon:', error);
      }
    };

    fetchDefaultIcon();
  }, []);

  // リロード関数 - セッションを強制的に再取得
  const reloadSession = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
    console.log('Reloading session...');
  };
  
  // 強化されたセッション更新関数
  const updateSessionData = async (newData: { name?: string, image?: string | null }) => {
    try {
      // デバッグ情報
      console.log('Old session data:', session?.user);
      console.log('Updating with new data:', newData);
      
      // 1. まずupdateを呼び出してNextAuthのセッションを更新
      if (session && session.user) {
        await update({
          ...session,
          user: {
            ...session.user,
            ...newData
          }
        });
      }
      
      // 2. セッションの強制リロード
      reloadSession();
      
      console.log('Session update completed');
      return true;
    } catch (error) {
      console.error('Failed to update session:', error);
      return false;
    }
  };

  // アカウント情報の更新（ニックネーム）
  const handleEditSubmit = async (userData: { name: string; image: string | null }) => {
    if (!session?.user?.id) return;
    
    console.log('Submitting user data:', userData);
    setIsProcessing(true);
    
    try {
      // DB更新前のデータを保存しておく
      const originalUserData = {
        name: session.user.name,
        image: session.user.image
      };
      
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          image: session.user.image // 画像は変更しない
        }),
      });

      if (!response.ok) {
        throw new Error('アカウント情報の更新に失敗しました');
      }
      
      const responseData = await response.json();
      console.log('Update API response:', responseData);

      // セッション更新
      console.log('Updating session with new name:', userData.name);
      
      // 強化されたセッション更新関数を使用
      const sessionUpdated = await updateSessionData({ name: userData.name });
      
      if (sessionUpdated) {
        console.log('Session successfully updated with new name');
      } else {
        console.warn('Session update may have failed, continuing anyway');
      }
      
      toast.success('アカウント情報を更新しました');
      setShowEditModal(false);
      
      // DB更新とセッション更新の後、確実にページをリロード
      console.log('Reloading page to ensure new data is displayed');
      
      // 少し待ってからリロードする
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 800);
      
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('アカウント情報の更新に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // プロフィール画像の更新
  const handleImageSubmit = async (imageUrl: string | null) => {
    if (!session?.user?.id) return;
    
    setIsProcessing(true);
    try {
      // DB更新前のデータを保存しておく
      const originalUserData = {
        name: session.user.name,
        image: session.user.image
      };
      
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session.user.name, // 名前は変更しない
          image: imageUrl
        }),
      });

      if (!response.ok) {
        throw new Error('プロフィール画像の更新に失敗しました');
      }

      const responseData = await response.json();
      console.log('Update image API response:', responseData);
      
      // セッション更新
      console.log('Updating session with new image:', imageUrl);
      
      // 強化されたセッション更新関数を使用
      const sessionUpdated = await updateSessionData({ image: imageUrl });
      
      if (sessionUpdated) {
        console.log('Session successfully updated with new image');
      } else {
        console.warn('Session update may have failed, continuing anyway');
      }

      toast.success('プロフィール画像を更新しました');
      setShowImageModal(false);
      
      // DB更新とセッション更新の後、確実にページをリロード
      console.log('Reloading page to ensure new data is displayed');
      
      // 少し待ってからリロードする
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 800);
      
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error('プロフィール画像の更新に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // 表示するユーザーアイコン（ユーザー画像またはデフォルト）
  const displayImageUrl = session?.user?.image || defaultIconUrl;

  return (
    <ProtectedRoute>
      <Head>
        <title>アカウント情報 | DumDumb</title>
        <meta name="description" content="DumDumbのアカウント情報設定ページ" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/mypage" className="mr-2">
            <span className="text-gray-500 hover:text-gray-700">
              &lt; マイページに戻る
            </span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">アカウント情報</h1>

        {/* アカウント情報カード */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold">基本情報</h2>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
            >
              編集
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center">
            {/* プロフィール画像 */}
            <div className="mb-4 md:mb-0 md:mr-6">
              <button
                onClick={() => setShowImageModal(true)}
                className="group relative h-24 w-24 overflow-hidden rounded-full border border-gray-200 focus:outline-none"
                aria-label="プロフィール画像を変更"
              >
                {displayImageUrl ? (
                  <>
                    <Image
                      src={displayImageUrl}
                      alt="プロフィール画像"
                      fill
                      sizes="(max-width: 768px) 100px, 96px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm">変更</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm">変更</span>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* ユーザー情報 */}
            <div>
              <div className="mb-2">
                <p className="text-sm text-gray-500">ニックネーム</p>
                {session?.user?.name ? (
                  <p className="font-medium">{session.user.name}</p>
                ) : (
                  <p className="text-gray-400 italic">未設定（任意）</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">メールアドレス</p>
                <p className="font-medium">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* セキュリティ情報カード */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold">セキュリティ情報</h2>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
            >
              変更
            </button>
          </div>

          <div>
            <p className="text-sm text-gray-500">パスワード</p>
            <p className="font-medium">••••••••</p>
            <p className="text-xs text-gray-500 mt-1">セキュリティのため、パスワードは定期的に変更することをお勧めします</p>
          </div>
        </div>

        {/* モーダル */}
        {showEditModal && (
          <AccountEditModal
            user={session?.user || {}}
            onClose={() => setShowEditModal(false)}
            onSubmit={handleEditSubmit}
            isProcessing={isProcessing}
          />
        )}

        {showImageModal && (
          <ProfileImageModal
            currentImage={session?.user?.image || null}
            onClose={() => setShowImageModal(false)}
            onSubmit={handleImageSubmit}
            isProcessing={isProcessing}
          />
        )}

        {showPasswordModal && (
          <PasswordChangeModal
            onClose={() => setShowPasswordModal(false)}
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
        destination: '/auth/login?redirect=/mypage/account-settings',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default AccountSettingsPage;
