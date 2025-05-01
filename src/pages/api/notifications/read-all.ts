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

  // POST: すべての通知を既読にする
  if (req.method === "POST") {
    try {
      // ユーザーの未読通知をすべて既読にする
      const updateResult = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return res.status(200).json({
        message: `${updateResult.count}件の通知を既読にしました`,
        count: updateResult.count,
      });
    } catch (error) {
      console.error("通知一括既読設定エラー:", error);
      return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  }

  // その他のメソッドは許可しない
  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
