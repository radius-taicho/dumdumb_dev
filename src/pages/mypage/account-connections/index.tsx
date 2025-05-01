import React, { useState } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  ArrowLeft,
  Twitter,
  Instagram,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// 連携アカウントのタイプ
type ConnectedAccountType = "twitter" | "line" | "instagram" | "helloworld";

// 連携済みアカウント情報の型
interface ConnectedAccount {
  type: ConnectedAccountType;
  username: string;
  connected: boolean;
  connectedAt?: Date;
}

const AccountConnectionsPage: NextPage = () => {
  // 初期状態の設定 (実際のAPIデータに置き換え)
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([
    {
      type: "twitter",
      username: "",
      connected: false,
    },
    {
      type: "line",
      username: "",
      connected: false,
    },
    {
      type: "instagram",
      username: "",
      connected: false,
    },
    {
      type: "helloworld",
      username: "",
      connected: false,
    },
  ]);

  const [loading, setLoading] = useState<ConnectedAccountType | null>(null);
  const [success, setSuccess] = useState<ConnectedAccountType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // アカウント連携処理
  const handleConnect = async (type: ConnectedAccountType) => {
    setLoading(type);
    setError(null);

    try {
      // 実際のアプリでは、適切なOAuthフローまたはAPI呼び出しを実装
      // モックのために少し待機
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 成功を模擬（実際のアプリではOAuth成功後のコールバックで処理）
      const mockUsername =
        type === "twitter"
          ? "@dumdum_user"
          : type === "instagram"
          ? "dumdumb_official"
          : type === "line"
          ? "dum.dumb"
          : "DumDumbUser";

      // 状態更新
      setConnectedAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.type === type
            ? {
                ...account,
                connected: true,
                username: mockUsername,
                connectedAt: new Date(),
              }
            : account
        )
      );

      setSuccess(type);

      // 成功メッセージを3秒後に消す
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        "連携中にエラーが発生しました。しばらくしてからお試しください。"
      );
    } finally {
      setLoading(null);
    }
  };

  // アカウント連携解除処理
  const handleDisconnect = async (type: ConnectedAccountType) => {
    setLoading(type);
    setError(null);

    try {
      // 実際のアプリでは、適切なAPI呼び出しで連携解除を実装
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 状態更新
      setConnectedAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.type === type
            ? {
                ...account,
                connected: false,
                username: "",
                connectedAt: undefined,
              }
            : account
        )
      );
    } catch (err) {
      setError(
        "連携解除中にエラーが発生しました。しばらくしてからお試しください。"
      );
    } finally {
      setLoading(null);
    }
  };

  // アカウントタイプに応じたアイコンを返す
  const getAccountIcon = (type: ConnectedAccountType) => {
    switch (type) {
      case "twitter":
        return <Twitter className="w-6 h-6 text-blue-400" />;
      case "instagram":
        return <Instagram className="w-6 h-6 text-purple-500" />;
      case "line":
        return (
          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
        );
      case "helloworld":
        return <Globe className="w-6 h-6 text-orange-500" />;
      default:
        return null;
    }
  };

  // アカウントタイプに応じた名前を返す
  const getAccountName = (type: ConnectedAccountType) => {
    switch (type) {
      case "twitter":
        return "X (Twitter)";
      case "line":
        return "LINE";
      case "instagram":
        return "Instagram";
      case "helloworld":
        return "Hello World掲示板";
      default:
        return "";
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>アカウント連携 | DumDumb</title>
        <meta name="description" content="DumDumbのアカウント連携設定" />
      </Head>

      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-72px)]">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link href="/mypage" className="mr-2">
              <span className="text-gray-500 hover:text-gray-700">
                &lt; トップに戻る
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">アカウント連携</h1>
          <p className="text-gray-600">
            外部サービスのアカウントとDumDumbアカウントを連携して、より便利にご利用いただけます。
            連携したアカウントでのログインやお気に入りの同期などが可能になります。
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-1">
                再度お試しいただくか、しばらく経ってからアクセスしてください。
              </p>
            </div>
          </div>
        )}

        {/* 連携アカウント一覧 */}
        <div className="space-y-6">
          {connectedAccounts.map((account) => (
            <div
              key={account.type}
              className="border rounded-lg p-4 md:p-6 transition-all"
            >
              <div className="flex justify-between items-center flex-wrap gap-y-4">
                <div className="flex items-center">
                  <div className="mr-3">{getAccountIcon(account.type)}</div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getAccountName(account.type)}
                    </h3>
                    {account.connected && account.username && (
                      <p className="text-sm text-gray-600">
                        {account.username}
                      </p>
                    )}
                  </div>

                  {/* 成功メッセージ (一時的に表示) */}
                  {success === account.type && (
                    <div className="ml-4 flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>連携しました</span>
                    </div>
                  )}
                </div>

                <div>
                  {account.connected ? (
                    <button
                      onClick={() => handleDisconnect(account.type)}
                      disabled={loading === account.type}
                      className="px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors disabled:opacity-50"
                    >
                      {loading === account.type ? "処理中..." : "連携を解除"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(account.type)}
                      disabled={loading === account.type}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors disabled:opacity-50"
                    >
                      {loading === account.type ? "処理中..." : "連携する"}
                    </button>
                  )}
                </div>
              </div>

              {/* 連携メリットの説明 */}
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {account.type === "twitter" && (
                  <p>
                    X (Twitter)
                    と連携すると、購入したアイテムをシェアしたり、友達の紹介リンクを共有できます。
                  </p>
                )}
                {account.type === "instagram" && (
                  <p>
                    Instagram
                    と連携すると、購入したアイテムの写真をシェアしたり、特別なフィルターが使えるようになります。
                  </p>
                )}
                {account.type === "line" && (
                  <p>
                    LINE
                    と連携すると、配送状況の通知やクーポン情報をLINEで受け取ることができます。
                  </p>
                )}
                {account.type === "helloworld" && (
                  <p>
                    Hello
                    World掲示板と連携すると、コミュニティでの活動やアイテムレビューがDumDumbアカウントと紐づきます。
                  </p>
                )}
              </div>

              {/* 連携日時の表示 */}
              {account.connected && account.connectedAt && (
                <p className="mt-3 text-xs text-gray-500">
                  {`連携日時: ${account.connectedAt.toLocaleString()}`}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 注意事項 */}
        <div className="mt-10 border-t pt-6">
          <h3 className="font-semibold mb-3">
            アカウント連携についての注意事項
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>
              アカウント連携には各サービスでのログインおよび認証が必要です。
            </li>
            <li>
              連携情報は各サービスのプライバシーポリシーに基づいて管理されます。
            </li>
            <li>連携を解除しても、既に共有されたデータには影響しません。</li>
            <li>
              特定の機能は連携アカウントによって制限される場合があります。
            </li>
            <li>
              連携に関する詳細はDumDumbのプライバシーポリシーをご確認ください。
            </li>
          </ul>
        </div>
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
        destination: "/auth/login?redirect=/mypage/account-connections",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default AccountConnectionsPage;
