import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GETリクエストのみを受け付ける
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // セッションからユーザーを取得
    const session = await getSession({ req });
    if (!session || !session.user?.id) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    const userId = session.user.id;

    // クエリパラメータからフィルターを取得
    const { read, type, limit = 20, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // フィルター条件を作成
    const where: any = { userId };
    
    if (read === "true") {
      where.isRead = true;
    } else if (read === "false") {
      where.isRead = false;
    }

    if (type) {
      where.type = type;
    }

    // 通知を取得
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: Number(limit),
      skip,
    });

    // 通知の総数を取得（ページネーション用）
    const total = await prisma.notification.count({ where });

    return res.status(200).json({
      notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("通知一覧取得エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}
