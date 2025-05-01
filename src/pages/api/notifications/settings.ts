import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // セッションからユーザーを取得
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: "認証が必要です" });
  }

  const userId = session.user.id;

  // GET: 通知設定を取得
  if (req.method === "GET") {
    try {
      // ユーザーの通知設定を取得
      let settings = await prisma.userNotificationSettings.findUnique({
        where: { userId },
      });

      // 設定がない場合は、デフォルト設定を使用
      if (!settings) {
        // ユーザーにデフォルト設定を作成
        settings = await prisma.userNotificationSettings.create({
          data: {
            userId,
            // デフォルト値はスキーマで定義済み
          },
        });
      }

      // クライアント側の形式に変換
      const clientFormatSettings = {
        receiveAllNotifications: settings.receiveAllNotifications,
        receiveSiteNotifications: settings.receiveSiteNotifications,
        receiveEmailNotifications: settings.receiveEmailNotifications,
        notificationFrequency: settings.notificationFrequency,
        categorySettings: {
          series: settings.seriesNotifications,
          character: settings.characterNotifications,
          waiting: settings.waitingNotifications,
          points: settings.pointsNotifications,
          coupons: settings.couponNotifications,
        },
        pointsNotificationSettings: {
          pointsEarned: settings.pointsEarnedNotifications,
          pointsExpiring: settings.pointsExpiringNotifications,
          daysBeforeExpiryNotice: settings.pointsExpiryNoticeDays,
        },
        couponNotificationSettings: {
          couponIssued: settings.couponIssuedNotifications,
          couponExpiring: settings.couponExpiringNotifications,
          daysBeforeExpiryNotice: settings.couponExpiryNoticeDays,
        },
      };

      return res.status(200).json(clientFormatSettings);
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
        pointsNotificationSettings,
        couponNotificationSettings,
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

      // 現在のユーザーデータを取得
      // Userモデルにはmetadataフィールドが存在しないため、別の方法で通知設定を保存する必要があります
      // 例えば、別のテーブルを作成して通知設定を保存するなど
      /* 修正前のコード
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { metadata: true },
      });
      */

      // カテゴリ設定を展開
      const {
        series = true,
        character = true,
        waiting = true,
        points = true,
        coupons = true,
      } = categorySettings;

      // ポイント通知設定を展開
      const {
        pointsEarned = true,
        pointsExpiring = true,
        daysBeforeExpiryNotice: pointsExpiryNoticeDays = 14,
      } = pointsNotificationSettings || {};

      // クーポン通知設定を展開
      const {
        couponIssued = true,
        couponExpiring = true,
        daysBeforeExpiryNotice: couponExpiryNoticeDays = 7,
      } = couponNotificationSettings || {};

      // 既存の設定を確認
      const existingSettings = await prisma.userNotificationSettings.findUnique({
        where: { userId },
      });

      if (existingSettings) {
        // 既存の設定を更新
        await prisma.userNotificationSettings.update({
          where: { userId },
          data: {
            receiveAllNotifications,
            receiveSiteNotifications,
            receiveEmailNotifications,
            notificationFrequency,
            // カテゴリ設定
            seriesNotifications: series,
            characterNotifications: character,
            waitingNotifications: waiting,
            pointsNotifications: points,
            couponNotifications: coupons,
            // ポイント通知設定
            pointsEarnedNotifications: pointsEarned,
            pointsExpiringNotifications: pointsExpiring,
            pointsExpiryNoticeDays,
            // クーポン通知設定
            couponIssuedNotifications: couponIssued,
            couponExpiringNotifications: couponExpiring,
            couponExpiryNoticeDays,
          },
        });
      } else {
        // 新規設定を作成
        await prisma.userNotificationSettings.create({
          data: {
            userId,
            receiveAllNotifications,
            receiveSiteNotifications,
            receiveEmailNotifications,
            notificationFrequency,
            // カテゴリ設定
            seriesNotifications: series,
            characterNotifications: character,
            waitingNotifications: waiting,
            pointsNotifications: points,
            couponNotifications: coupons,
            // ポイント通知設定
            pointsEarnedNotifications: pointsEarned,
            pointsExpiringNotifications: pointsExpiring,
            pointsExpiryNoticeDays,
            // クーポン通知設定
            couponIssuedNotifications: couponIssued,
            couponExpiringNotifications: couponExpiring,
            couponExpiryNoticeDays,
          },
        });
      }

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
