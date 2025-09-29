import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import ProtectedRoute from '@/components/ProtectedRoute';
import AddressModal from '@/components/mypage/address/AddressModal';

type Address = {
  id: string;
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  line1: string;
  line2?: string | null;
  phoneNumber: string;
  isDefault: boolean;
};

const DeliveryAddressesPage: NextPage = () => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isProcessing, setIsProcessing] = useState(false);

  // 住所一覧の取得
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/addresses');
      if (!response.ok) throw new Error('住所情報の取得に失敗しました');
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      alert('住所情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAddresses();
    }
  }, [session]);

  // 住所の追加・編集
  const handleAddressSubmit = async (addressData: Address) => {
    setIsProcessing(true);
    try {
      const url = modalMode === 'add' ? '/api/addresses' : `/api/addresses/${addressData.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '住所情報の保存に失敗しました');
      }

      await fetchAddresses();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving address:', error);
      alert(error instanceof Error ? error.message : '住所情報の保存に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // 住所の削除
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('この住所を削除してもよろしいですか？')) return;
    
    try {
      const response = await fetch('/api/addresses/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addressId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '住所の削除に失敗しました');
      }

      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert(error instanceof Error ? error.message : '住所の削除に失敗しました');
    }
  };

  // 住所編集モーダルを開く
  const openEditModal = (address: Address) => {
    setCurrentAddress(address);
    setModalMode('edit');
    setShowModal(true);
  };

  // 住所追加モーダルを開く
  const openAddModal = () => {
    setCurrentAddress(null);
    setModalMode('add');
    setShowModal(true);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>お届け先 | DumDumb</title>
        <meta name="description" content="DumDumbのお届け先設定ページ" />
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
          <h1 className="text-2xl font-bold">お届け先</h1>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
          >
            お届け先を追加
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>読み込み中...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">登録されたお届け先はありません</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
            >
              お届け先を追加する
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4 bg-white relative">
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                    デフォルト
                  </span>
                )}
                <div className="mb-4">
                  <p className="font-semibold">{address.name}</p>
                  <p>〒{address.postalCode}</p>
                  <p>{address.prefecture}{address.city}</p>
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p className="mt-1">TEL: {address.phoneNumber}</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(address)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 住所モーダル */}
        {showModal && (
          <AddressModal
            address={currentAddress}
            onClose={() => setShowModal(false)}
            onSubmit={handleAddressSubmit}
            isProcessing={isProcessing}
            mode={modalMode}
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
        destination: '/auth/login?redirect=/mypage/delivery-addresses',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default DeliveryAddressesPage;
