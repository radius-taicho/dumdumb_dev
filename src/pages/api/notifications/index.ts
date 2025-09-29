import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // セッションからユーザーを取得
  const session = await getSession({ req });
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: "認証が必要です" });
  }

  const userId = session.user.id;

  // GET: ユーザーの通知一覧を取得
  if (req.method === "GET") {
    try {
      // ページネーションパラメータを取得
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      // 通知の総数を取得（ページネーション用）
      const totalCount = await prisma.notification.count({
        where: { userId },
      });

      // ユーザーの通知を取得
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      // ページネーション情報を追加
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      return res.status(200).json(notifications);
    } catch (error) {
      console.error("通知取得エラー:", error);
      return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  }

  // POST: 新しい通知を作成（テスト用/管理者用）
  else if (req.method === "POST") {
    // テスト用なので権限チェックを厳密に行う実装が必要
    // 本番環境では特定の管理者権限などでのみアクセス可能にすべき
    try {
      const { title, content, type, meta } = req.body;

      if (!title || !content || !type) {
        return res
          .status(400)
          .json({ message: "必須項目が入力されていません" });
      }

      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          content,
          type,
          meta,
          isRead: false,
        },
      });

      return res.status(201).json(notification);
    } catch (error) {
      console.error("通知作成エラー:", error);
      return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  }

  // その他のメソッドは許可しない
  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
