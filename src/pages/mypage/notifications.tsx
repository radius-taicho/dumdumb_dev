import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

// 仮の通知データ
const dummyNotifications = [
  { 
    id: '1', 
    title: '新作グッズが入荷しました', 
    content: 'お気に入りのシリーズの新作グッズが入荷しました。今すぐチェックしましょう！',
    date: '2023-03-10',
    read: false,
    type: 'new-item'
  },
  { 
    id: '2', 
    title: 'お気に入りアイテムが値下げされました', 
    content: 'お気に入りに登録している商品が20%オフになりました。',
    date: '2023-03-08',
    read: false,
    type: 'price-change'
  },
  { 
    id: '3', 
    title: '配送料が改定されました', 
    content: '4月1日より配送料の改定があります。詳細はお知らせをご覧ください。',
    date: '2023-03-05',
    read: true,
    type: 'announcement'
  },
  { 
    id: '4', 
    title: 'ゴールデンウィークセール開催のお知らせ', 
    content: '4月29日から5月7日までゴールデンウィークセールを開催します。最大50%オフをお見逃しなく！',
    date: '2023-03-01',
    read: true,
    type: 'sale'
  },
];

const NotificationsPage: NextPage = () => {
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [filter, setFilter] = useState('all');

  // 通知フィルター
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.read) 
      : notifications.filter(n => n.read);

  // 通知を既読にする
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // すべて既読にする
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  // 未読通知数をカウント
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Head>
        <title>通知管理 | DumDumb</title>
        <meta name="description" content="DumDumbの通知管理" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">通知管理</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* サイドバー */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <nav className="flex flex-col">
                <Link href="/mypage" className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3">
                  マイページトップ
                </Link>
                <Link href="/mypage/orders" className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3">
                  お買い物履歴
                </Link>
                <Link href="/mypage/interested" className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3">
                  気になるアイテム
                </Link>
                <Link href="/mypage/favorites-cart" className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3">
                  お気に入り・カート
                </Link>
                <Link href="/mypage/notifications" className="text-indigo-600 bg-indigo-50 font-medium px-4 py-3 border-l-4 border-indigo-600">
                  通知管理
                </Link>
                <Link href="/mypage/settings" className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3">
                  アカウント設定
                </Link>
              </nav>
            </div>
          </div>
          
          {/* メインコンテンツ */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">通知</h2>
                <div className="flex items-center space-x-4">
                  <div>
                    <select 
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">すべての通知</option>
                      <option value="unread">未読のみ ({unreadCount})</option>
                      <option value="read">既読のみ</option>
                    </select>
                  </div>
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    onClick={markAllAsRead}
                  >
                    すべて既読にする
                  </button>
                </div>
              </div>
              
              {/* 通知設定 */}
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="font-medium mb-3">通知設定</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="notify-new-items" 
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="notify-new-items" className="ml-2 text-sm text-gray-700">
                      新商品の入荷をお知らせする
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="notify-price-changes" 
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="notify-price-changes" className="ml-2 text-sm text-gray-700">
                      お気に入り商品の価格変更をお知らせする
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="notify-sales" 
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="notify-sales" className="ml-2 text-sm text-gray-700">
                      セールや特別イベントをお知らせする
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="notify-announcements" 
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="notify-announcements" className="ml-2 text-sm text-gray-700">
                      サイトに関する重要なお知らせを受け取る
                    </label>
                  </div>
                </div>
              </div>
              
              {/* 通知リスト */}
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border rounded-md p-4 ${!notification.read ? 'bg-indigo-50 border-indigo-200' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium ${!notification.read ? 'text-indigo-800' : ''}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.date}</p>
                        </div>
                        {!notification.read && (
                          <button 
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            既読にする
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-gray-700">{notification.content}</p>
                      {notification.type === 'new-item' || notification.type === 'price-change' || notification.type === 'sale' ? (
                        <div className="mt-3">
                          <Link 
                            href="/" 
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            詳細を見る →
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {filter === 'unread' ? '未読の通知はありません' : filter === 'read' ? '既読の通知はありません' : '通知はありません'}
                  </p>
                </div>
              )}
              
              {/* ページネーション */}
              {filteredNotifications.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <nav className="inline-flex rounded-md shadow">
                    <a href="#" className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      前へ
                    </a>
                    <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      1
                    </a>
                    <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600">
                      2
                    </a>
                    <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      3
                    </a>
                    <a href="#" className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      次へ
                    </a>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
