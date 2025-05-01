import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";
import { sendRestockNotificationEmail } from "@/utils/email/sendgrid";
import { NotificationType } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POSTリクエストのみを受け付ける
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // セッションからユーザーを取得し、管理者かどうか確認
    const session = await getSession({ req });
    if (!session || !session.user?.id) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "この操作には管理者権限が必要です" });
    }

    const { itemId, size } = req.body;

    // データ検証
    if (!itemId) {
      return res.status(400).json({ message: "アイテムIDが必要です" });
    }

    // アイテムが存在するか確認
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        itemSizes: size
          ? {
              where: { size },
            }
          : true,
      },
    });

    if (!item) {
      return res.status(404).json({ message: "アイテムが見つかりません" });
    }

    // 通知対象のサイズがない場合は全てのサイズを対象にする
    const targetSizes = size ? item.itemSizes : item.itemSizes;

    // 通知済みユーザー数をカウント
    let notifiedCount = 0;

    // 各サイズについて処理
    for (const itemSize of targetSizes) {
      // 在庫があるサイズのみ通知処理
      if (itemSize.inventory > 0) {
        // 該当するサイズの通知登録を持つユーザーを検索
        const subscriptions = await prisma.restockSubscription.findMany({
          where: {
            itemSizeId: itemSize.id,
            isActive: true,
          },
          include: {
            user: true,
          },
        });

        console.log(
          `サイズ ${itemSize.size} の通知登録ユーザー数: ${subscriptions.length}`
        );

        // 各ユーザーに通知
        for (const subscription of subscriptions) {
          const user = subscription.user;

          if (!user.email) continue;

          // DBに通知を作成
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `${item.name} ${itemSize.size}サイズが再入荷しました`,
              content: `お気に入りに登録していたアイテムが入荷されました。`,
              type: NotificationType.RESTOCK,
              itemId: item.id,
            },
          });

          // メール通知を送信
          if (user.email) {
            try {
              const itemUrl = `${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/items/${item.id}`;
              await sendRestockNotificationEmail(
                user.email,
                item.name,
                itemSize.size.toString(),
                itemUrl
              );
            } catch (emailError) {
              // メール送信に失敗しても処理を続行
              console.error("メール送信エラー:", emailError);
            }
          }

          // 通知登録を非アクティブに変更（一度通知したら再度通知しない）
          await prisma.restockSubscription.update({
            where: { id: subscription.id },
            data: { isActive: false },
          });

          notifiedCount++;
        }
      }
    }

    return res.status(200).json({
      message: `再入荷通知を送信しました（${notifiedCount}人）`,
      notifiedCount,
    });
  } catch (error) {
    console.error("再入荷通知送信エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}
