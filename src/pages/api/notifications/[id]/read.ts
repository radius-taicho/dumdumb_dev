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
  const notificationId = req.query.id as string;

  // POST: 通知を既読にする
  if (req.method === "POST") {
    try {
      // 対象の通知が存在し、現在のユーザーのものか確認
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        return res.status(404).json({ message: "通知が見つかりません" });
      }

      // 既読状態を更新
      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return res.status(200).json(updatedNotification);
    } catch (error) {
      console.error("通知既読設定エラー:", error);
      return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  }

  // その他のメソッドは許可しない
  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
