import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useAnonymousSession } from "@/contexts/anonymous-session";
import { toast } from "react-hot-toast";

// コンポーネントのインポート
import { RecentlyViewedSection } from "@/components/mypage/RecentlyViewedSection";
import { FrequentlyViewedSection } from "@/components/mypage/FrequentlyViewedSection";
import { RecommendedItemsSection } from "@/components/mypage/RecommendedItemsSection";

// 型定義のインポート
import { ViewItem, ViewHistoryDetailsMap } from "@/types/view-history";

const InterestedItemsPage: NextPage = () => {
  const { data: session, status } = useSession();
  const { anonymousSessionToken } = useAnonymousSession();
  const [loading, setLoading] = useState(true);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<ViewItem[]>(
    []
  );
  const [frequentlyViewedItems, setFrequentlyViewedItems] = useState<
    ViewItem[]
  >([]);
  const [recommendedItems, setRecommendedItems] = useState<ViewItem[]>([]);

  // 全アイテムの視聴履歴を取得
  const [viewHistoryDetails, setViewHistoryDetails] =
    useState<ViewHistoryDetailsMap>({});
  const [showViewHistory, setShowViewHistory] = useState<string | null>(null);

  // 視聴履歴とおすすめアイテムを取得
  useEffect(() => {
    const fetchViewHistory = async () => {
      try {
        setLoading(true);

        // ログイン状態または匿名セッションがあればデータを取得
        if (
          (status === "authenticated" && session?.user) ||
          anonymousSessionToken
        ) {
          // URLクエリパラメータの構築
          const params = new URLSearchParams();
          if (anonymousSessionToken) {
            params.append("anonymousSessionToken", anonymousSessionToken);
          }

          const response = await fetch(
            `/api/view-history/get?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch view history");
          }

          const data = await response.json();

          // 取得したデータを設定
          setRecentlyViewedItems(data.recentlyViewed || []);
          setFrequentlyViewedItems(data.frequentlyViewed || []);
          setRecommendedItems(data.recommended || []);
        } else {
          // 認証情報がない場合は空配列に設定
          setRecentlyViewedItems([]);
          setFrequentlyViewedItems([]);
          setRecommendedItems([]);
        }
      } catch (error) {
        console.error("Error fetching view history:", error);
        toast.error("履歴の取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchViewHistory();
  }, [session, status, anonymousSessionToken]);

  // 視聴履歴の詳細を取得
  useEffect(() => {
    const fetchViewHistoryDetails = async () => {
      try {
        // ログイン状態または匿名セッションがあればデータを取得
        if (
          (status === "authenticated" && session?.user) ||
          anonymousSessionToken
        ) {
          // URLクエリパラメータの構築
          const params = new URLSearchParams();
          if (anonymousSessionToken) {
            params.append("anonymousSessionToken", anonymousSessionToken);
          }

          const response = await fetch(
            `/api/view-history/details?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch view history details");
          }

          const data = await response.json();
          if (data.success && data.viewHistoryDetails) {
            // サーバーから返されたデータを受け取り、日付文字列をDateオブジェクトに変換
            const processedDetails: ViewHistoryDetailsMap = {};

            Object.entries(data.viewHistoryDetails).forEach(
              ([itemId, details]: [string, any]) => {
                processedDetails[itemId] = {
                  dates: details.dates.map(
                    (dateStr: string) => new Date(dateStr)
                  ),
                  count: details.count,
                };
              }
            );

            setViewHistoryDetails(processedDetails);
          }
        }
      } catch (error) {
        console.error("Error fetching view history details:", error);
      }
    };

    fetchViewHistoryDetails();
  }, [session, status, anonymousSessionToken]);

  // 視聴履歴の表示/非表示を切り替える
  const toggleViewHistory = (itemId: string) => {
    if (showViewHistory === itemId) {
      setShowViewHistory(null);
    } else {
      setShowViewHistory(itemId);
    }
  };

  return (
    <>
      <Head>
        <title>気になっているアイテム | DumDumb</title>
        <meta
          name="description"
          content="DumDumbで気になっているアイテム一覧"
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/mypage" className="mr-2">
            <span className="text-gray-500 hover:text-gray-700">
              &lt; マイページに戻る
            </span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">気になっているアイテム</h1>

        {/* 最近見たアイテムセクション */}
        <RecentlyViewedSection
          items={recentlyViewedItems}
          viewHistoryDetails={viewHistoryDetails}
          showViewHistory={showViewHistory}
          toggleViewHistory={toggleViewHistory}
        />

        {/* よく見ているアイテムセクション */}
        <FrequentlyViewedSection
          items={frequentlyViewedItems}
          viewHistoryDetails={viewHistoryDetails}
          showViewHistory={showViewHistory}
          toggleViewHistory={toggleViewHistory}
        />

        {/* おすすめアイテムセクション */}
        <RecommendedItemsSection items={recommendedItems} loading={loading} />
      </div>
    </>
  );
};

export default InterestedItemsPage;
