import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POSTリクエストのみを受け付ける
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // セッションからユーザーを取得
    const session = await getSession({ req });
    if (!session || !session.user?.id) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    const userId = session.user.id;
    const { id, all } = req.body;

    if (all) {
      // すべての通知を既読にする
      await prisma.notification.updateMany({
        where: { userId },
        data: { isRead: true },
      });

      return res.status(200).json({
        message: "すべての通知を既読にしました",
      });
    } else if (id) {
      // 指定された通知を既読にする
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        return res.status(404).json({ message: "通知が見つかりません" });
      }

      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return res.status(200).json({
        message: "通知を既読にしました",
        notification,
      });
    } else {
      return res.status(400).json({ message: "ID、または 'all' パラメータが必要です" });
    }
  } catch (error) {
    console.error("通知既読エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}
