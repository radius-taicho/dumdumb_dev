import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Point {
  id: string;
  userId: string;
  amount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

const AdminPoints: NextPage = () => {
  const router = useRouter();
  const [points, setPoints] = useState<Point[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pointAmount, setPointAmount] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch all points
        const pointsResponse = await axios.get('/api/admin/points');
        setPoints(pointsResponse.data.points);
        
        // Fetch all users
        const usersResponse = await axios.get('/api/admin/users');
        setUsers(usersResponse.data.users);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('データの取得中にエラーが発生しました。再度お試しください。');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || pointAmount <= 0 || !expiryDate) {
      setError('すべての項目を入力してください。');
      return;
    }

    try {
      await axios.post('/api/admin/points', {
        userId: selectedUserId,
        amount: pointAmount,
        expiresAt: new Date(expiryDate).toISOString(),
      });
      
      // Refresh the points list
      const pointsResponse = await axios.get('/api/admin/points');
      setPoints(pointsResponse.data.points);
      
      // Reset form
      setSelectedUserId('');
      setPointAmount(0);
      setExpiryDate('');
      
      setError(null);
    } catch (err) {
      console.error('Error adding points:', err);
      setError('ポイントの追加中にエラーが発生しました。再度お試しください。');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>ポイント管理 | Dumdumb 管理画面</title>
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">ポイント管理</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Points Form */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">ポイント追加</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">ユーザー</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">ユーザーを選択</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">ポイント数</label>
                  <input
                    type="number"
                    value={pointAmount}
                    onChange={(e) => setPointAmount(parseInt(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    min="1"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">有効期限</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-