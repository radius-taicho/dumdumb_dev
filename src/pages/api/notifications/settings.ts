import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

// 通知設定テーブルがないため、userData内にJSONフィールドとして保存する形で実装
// 本来は専用のテーブルを作るべき

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

  // GET: 通知設定を取得
  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          // metadataフィールドがない場合は追加が必要
          // metadata: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }

      // metadataフィールドがない場合はuserDataテーブルを作成するか、
      // または別の方法でユーザー設定を保存する必要があります
      
      // ダミーデータを返す（実際の実装では適切なデータソースから取得）
      const notificationSettings = {
        receiveAllNotifications: true,
        receiveSiteNotifications: true,
        receiveEmailNotifications: true,
        notificationFrequency: "realtime",
        categorySettings: {
          series: true,
          character: true,
          waiting: true,
        },
      };

      return res.status(200).json(notificationSettings);
    } catch (error) {
      console.error("通知設定取得エラー:", error);
      return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  }

  // POST: 通知設定を保存
  else if (req.method === "POST") {
    try {
      const {
        receiveAllNotifications,
        receiveSiteNotifications,
        receiveEmailNotifications,
        notificationFrequency,
        categorySettings,
      } = req.body;

      // データ検証
      if (
        typeof receiveAllNotifications !== "boolean" ||
        typeof receiveSiteNotifications !== "boolean" ||
        typeof receiveEmailNotifications !== "boolean" ||
        !["realtime", "daily", "weekly"].includes(notificationFrequency) ||
        typeof categorySettings !== "object"
      ) {
        return res.status(400).json({ message: "無効なデータ形式です" });
      }

      // 設定を保存
      // 実際には、ユーザーテーブルにmetadataフィールドを追加するか、
      // 専用の設定テーブルを作成する必要があります

      // 設定保存のシミュレーション（実際の実装ではDBに保存）
      console.log("保存された通知設定:", {
        userId,
        receiveAllNotifications,
        receiveSiteNotifications,
        receiveEmailNotifications,
        notificationFrequency,
        categorySettings,
      });

      return res.status(200).json({ message: "設定を保存しました" });
    } catch (error) {
      console.error("通知設定保存エラー:", error);
      return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  }

  // その他のメソッドは許可しない
  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
