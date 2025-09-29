import React, { useEffect, useState } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";

interface PointHistory {
  id: string;
  amount: number;
  expiresAt: string;
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minimumPurchase: number | null;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

const CouponsPointsPage: NextPage = () => {
  const { data: session } = useSession();
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"points" | "coupons">("points");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // ポイント情報を取得
        const pointsResponse = await axios.get("/api/user/points");
        setTotalPoints(pointsResponse.data.totalPoints);
        setPointHistory(pointsResponse.data.pointHistory);

        // クーポン情報を取得
        const couponsResponse = await axios.get("/api/user/coupons");
        setCoupons(couponsResponse.data.coupons);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("データの取得中にエラーが発生しました。");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // クーポンの割引表示を整形
  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}%オフ`;
    } else {
      return `${coupon.discountValue.toLocaleString()}円オフ`;
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>dumdumbクーポン&ポイント | DumDumb</title>
        <meta
          name="description"
          content="DumDumbのクーポンとポイント管理ページ"
        />
      </Head>

      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-72px)]">
        <div className="flex items-center mb-6">
          <Link
            href="/mypage"
            className="text-gray-600 hover:text-gray-900 mr-2"
          >
            <span className="inline-block align-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </span>
            <span className="inline-block align-middle">マイページへ戻る</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-start">
          dumdumbクーポン&ポイント
        </h1>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === "points"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("points")}
            >
              ポイント
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === "coupons"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("coupons")}
            >
              クーポン
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : (
          <>
            {activeTab === "points" ? (
              <div className="points-section">
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <h2 className="text-xl font-semibold mb-2 md:mb-0">
                      現在の保有ポイント
                    </h2>
                    <div className="text-3xl font-bold text-indigo-600">
                      {totalPoints.toLocaleString()} ポイント
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">ポイント履歴</h2>
                {pointHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            獲得日
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            ポイント
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            有効期限
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pointHistory.map((point) => (
                          <tr key={point.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {formatDate(point.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                              {point.amount.toLocaleString()} ポイント
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {formatDate(point.expiresAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    ポイント履歴はありません
                  </div>
                )}

                <div className="mt-10 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    ポイントについて
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>
                      ポイントはアイテム購入時に獲得でき、1円 =
                      1ポイントで付与されます。
                    </li>
                    <li>
                      セールアイテムや特定のキャンペーン対象アイテムは、ポイント還元率がアップします。
                    </li>
                    <li>獲得したポイントは次回のお買い物から使用できます。</li>
                    <li>ポイントは獲得から1年間有効です。</li>
                    <li>
                      返品・キャンセルの場合、付与されたポイントは取り消しとなります。
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="coupons-section">
                <h2 className="text-xl font-semibold mb-4">
                  利用可能なクーポン
                </h2>
                {coupons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons
                      .filter((coupon) => !coupon.isUsed)
                      .map((coupon) => (
                        <div
                          key={coupon.id}
                          className="border rounded-lg p-4 relative overflow-hidden"
                        >
                          <div className="bg-indigo-100 absolute -right-6 -top-6 rotate-12 p-2 w-24 text-center text-xs font-medium text-indigo-800">
                            {coupon.discountType === "percentage"
                              ? "割引率"
                              : "値引き"}
                          </div>
                          <div className="mt-4">
                            <div className="text-xl font-bold text-indigo-600 mb-2">
                              {formatDiscount(coupon)}
                            </div>
                            <div className="text-sm mb-1">
                              クーポンコード:{" "}
                              <span className="font-medium">{coupon.code}</span>
                            </div>
                            {coupon.minimumPurchase && (
                              <div className="text-sm mb-1">
                                最低購入金額:{" "}
                                <span className="font-medium">
                                  {coupon.minimumPurchase.toLocaleString()}円
                                </span>
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              有効期限: {formatDate(coupon.expiresAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    利用可能なクーポンはありません
                  </div>
                )}

                {coupons.filter((coupon) => coupon.isUsed).length > 0 && (
                  <>
                    <h2 className="text-xl font-semibold mt-10 mb-4">
                      使用済みクーポン
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coupons
                        .filter((coupon) => coupon.isUsed)
                        .map((coupon) => (
                          <div
                            key={coupon.id}
                            className="border rounded-lg p-4 bg-gray-100 opacity-70 relative overflow-hidden"
                          >
                            <div className="bg-gray-300 absolute -right-6 -top-6 rotate-12 p-2 w-24 text-center text-xs font-medium text-gray-700">
                              使用済み
                            </div>
                            <div className="mt-4">
                              <div className="text-xl font-bold text-gray-600 mb-2">
                                {formatDiscount(coupon)}
                              </div>
                              <div className="text-sm mb-1">
                                クーポンコード:{" "}
                                <span className="font-medium">
                                  {coupon.code}
                                </span>
                              </div>
                              {coupon.minimumPurchase && (
                                <div className="text-sm mb-1">
                                  最低購入金額:{" "}
                                  <span className="font-medium">
                                    {coupon.minimumPurchase.toLocaleString()}円
                                  </span>
                                </div>
                              )}
                              <div className="text-sm text-gray-500">
                                有効期限: {formatDate(coupon.expiresAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}

                <div className="mt-10 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    クーポンについて
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>
                      クーポンは購入時にクーポンコードを入力して使用できます。
                    </li>
                    <li>一部のクーポンには最低購入金額が設定されています。</li>
                    <li>クーポンは1回のお買い物につき1つまで使用できます。</li>
                    <li>クーポンとポイントは併用可能です。</li>
                    <li>有効期限を過ぎたクーポンは使用できません。</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

// サーバーサイドでの認証チェック
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login?redirect=/mypage/coupons-points",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default CouponsPointsPage;
