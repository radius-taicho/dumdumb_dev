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
  Send,
  CheckCircle,
  Clock,
  MessageSquare,
  ChevronRight,
  Plus,
  AlertTriangle,
} from "lucide-react";

// 要望のタイプ
type RequestType = "character" | "item" | "service" | "other";

// 要望ステータス
type RequestStatus = "pending" | "reviewing" | "completed" | "declined";

// 要望の型
interface Request {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  response?: {
    message: string;
    respondedAt: Date;
  };
}

const RequestsPage: NextPage = () => {
  const { data: session } = useSession();

  // 要望フォーム状態管理
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>("character");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 要望リスト（実際のアプリではAPIから取得）
  // 重要: 実際の実装では、現在のユーザーの要望のみを取得する
  // GET /api/user/requests?userId={session.user.id} のような実装にする
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "req-001",
      type: "character",
      title: "進撃の巨人のキャラクターグッズが欲しい",
      description: "特にリヴァイ兵長のグッズを増やしてほしいです。",
      status: "completed",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30日前
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25日前
      response: {
        message:
          "ご要望ありがとうございます。次回のアイテムラインナップに追加を検討しております。",
        respondedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25日前
      },
    },
    {
      id: "req-002",
      type: "service",
      title: "定期便サービスがあるといい",
      description:
        "毎月新しいアイテムを自動的に届けてくれる定期便サービスがあると便利だと思います。",
      status: "reviewing",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7日前
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7日前
    },
  ]);

  // 要望詳細表示の状態管理
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // 要望送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 入力検証
      if (!title.trim() || !description.trim()) {
        throw new Error("タイトルと詳細は必須項目です。");
      }

      // 実際のアプリではAPIへの送信処理を実装
      await new Promise((resolve) => setTimeout(resolve, 1500)); // モック遅延

      // 新しい要望を追加
      const newRequest: Request = {
        id: `req-${(requests.length + 1).toString().padStart(3, "0")}`,
        type: requestType,
        title,
        description,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRequests((prev) => [newRequest, ...prev]);

      // フォームをリセット
      setTitle("");
      setDescription("");
      setRequestType("character");
      setIsFormOpen(false);

      // 成功メッセージを表示
      setSuccessMessage("ご要望を送信しました。確認次第対応いたします。");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "要望の送信中にエラーが発生しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 要望タイプに応じたラベルを取得
  const getRequestTypeLabel = (type: RequestType): string => {
    switch (type) {
      case "character":
        return "キャラクター要望";
      case "item":
        return "アイテムアイテム要望";
      case "service":
        return "サービス機能要望";
      case "other":
        return "その他";
    }
  };

  // ステータスに応じたラベルとスタイルを取得
  const getStatusInfo = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "受付中",
          icon: <Clock className="w-4 h-4 text-yellow-500" />,
          className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        };
      case "reviewing":
        return {
          label: "検討中",
          icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "completed":
        return {
          label: "対応済み",
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          className: "bg-green-50 text-green-700 border-green-200",
        };
      case "declined":
        return {
          label: "見送り",
          icon: <AlertTriangle className="w-4 h-4 text-gray-500" />,
          className: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>ご要望 | DumDumb</title>
        <meta name="description" content="DumDumbへのご要望" />
      </Head>

      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-72px)]">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link href="/mypage" className="mr-2">
              <span className="text-gray-500 hover:text-gray-700">
                &lt; マイページに戻る
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">ご要望</h1>
          <p className="text-gray-600">
            DumDumbをより良くするための「こんなアイテムが欲しい」「こんな機能があったらいいな」など、
            あなたの要望をお聞かせください。実現可能なものから順次対応いたします。
          </p>
        </div>

        {/* 成功メッセージ */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 要望フォーム */}
        <div className="mb-8">
          {!isFormOpen ? (
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-medium">新しい要望を送信する</span>
            </button>
          ) : (
            <div className="border rounded-lg p-5">
              <h2 className="font-bold text-lg mb-4">新しい要望を送信</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    要望の種類
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) =>
                      setRequestType(e.target.value as RequestType)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                    disabled={isSubmitting}
                  >
                    <option value="character">
                      キャラクター要望（新キャラの取り扱い等）
                    </option>
                    <option value="item">
                      アイテムアイテム要望（新アイテム・サイズ等）
                    </option>
                    <option value="service">
                      サービス機能要望（使いやすさ向上等）
                    </option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例: 〇〇シリーズのグッズが欲しい"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                    maxLength={100}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    詳細
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="具体的にどのようなものが欲しいか、どのような機能があると便利かなど、詳しく教えてください。"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                    rows={5}
                    maxLength={1000}
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length}/1000文字
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors disabled:opacity-50 flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "送信中..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" />
                        送信する
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* 要望リスト */}
        <div>
          <h2 className="font-bold text-lg mb-4">あなたの送信済み要望</h2>

          {requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              <p className="text-gray-500">まだ要望を送信していません</p>
              <p className="text-sm text-gray-400 mt-1">
                上のフォームから新しい要望を送信できます
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* モバイル表示用（詳細モードがない場合） */}
              {!selectedRequest && (
                <>
                  {requests.map((request) => {
                    const statusInfo = getStatusInfo(request.status);

                    return (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border flex items-center ${statusInfo.className}`}
                          >
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            {request.createdAt.toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-semibold text-lg mb-1">
                          {request.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          {getRequestTypeLabel(request.type)}
                        </p>

                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {request.description}
                        </p>

                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-orange-500 text-sm font-medium flex items-center"
                        >
                          詳細を見る
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}

              {/* 詳細表示モード */}
              {selectedRequest && (
                <div className="border rounded-lg p-5">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-sm text-gray-600 flex items-center mb-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    戻る
                  </button>

                  <div className="mb-3 flex justify-between items-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border flex items-center ${
                        getStatusInfo(selectedRequest.status).className
                      }`}
                    >
                      {getStatusInfo(selectedRequest.status).icon}
                      <span className="ml-1">
                        {getStatusInfo(selectedRequest.status).label}
                      </span>
                    </span>
                    <div className="text-xs text-gray-500">
                      <div>
                        送信日: {selectedRequest.createdAt.toLocaleDateString()}
                      </div>
                      <div>
                        更新日: {selectedRequest.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <h2 className="font-bold text-xl mb-1">
                    {selectedRequest.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {getRequestTypeLabel(selectedRequest.type)}
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium mb-2">詳細内容</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedRequest.description}
                    </p>
                  </div>

                  {/* 運営からの回答 */}
                  {selectedRequest.response && (
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">DumDumbからの回答</h3>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedRequest.response.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          回答日:{" "}
                          {selectedRequest.response.respondedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ステータスに応じたメッセージ */}
                  {!selectedRequest.response &&
                    selectedRequest.status === "reviewing" && (
                      <div className="border-t pt-4">
                        <div className="bg-blue-50 p-4 rounded-lg flex">
                          <MessageSquare className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-blue-700 font-medium">
                              現在検討中です
                            </p>
                            <p className="text-sm text-blue-600">
                              運営チームが要望内容を確認しています。回答までしばらくお待ちください。
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {!selectedRequest.response &&
                    selectedRequest.status === "pending" && (
                      <div className="border-t pt-4">
                        <div className="bg-yellow-50 p-4 rounded-lg flex">
                          <Clock className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-yellow-700 font-medium">
                              要望を受け付けました
                            </p>
                            <p className="text-sm text-yellow-600">
                              内容確認後、対応を検討いたします。回答までしばらくお待ちください。
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 注意事項 */}
        <div className="mt-12 bg-gray-50 p-5 rounded-lg border text-sm text-gray-600">
          <h3 className="font-semibold text-gray-700 mb-3">
            ご要望の取り扱いについて
          </h3>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              送信いただいたご要望は全て確認しておりますが、実現できない場合もございます。
            </li>
            <li>
              類似の要望が多数寄せられている場合は、優先的に検討いたします。
            </li>
            <li>
              具体的な実現時期や詳細な進捗状況についてはお答えできない場合がございます。
            </li>
            <li>
              お困りごとやトラブルについては、こちらではなく「お問い合わせ」からご連絡ください。
            </li>
            <li>
              不適切な内容や他のユーザーへの誹謗中傷を含む要望は削除される場合があります。
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
        destination: "/auth/login?redirect=/mypage/requests",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default RequestsPage;
