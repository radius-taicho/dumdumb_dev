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
    const { itemId, size } = req.body;

    // データ検証
    if (!itemId || !size) {
      return res.status(400).json({ message: "アイテムIDとサイズが必要です" });
    }

    // アイテムが存在するか確認
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        itemSizes: {
          where: { size },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ message: "アイテムが見つかりません" });
    }

    if (!item.hasSizes) {
      return res.status(400).json({ message: "このアイテムにはサイズがありません" });
    }

    if (item.itemSizes.length === 0) {
      return res.status(404).json({ message: "指定されたサイズが見つかりません" });
    }

    const itemSize = item.itemSizes[0];

    // 在庫がある場合は登録不要
    if (itemSize.inventory > 0) {
      return res.status(400).json({ message: "このサイズは在庫があります" });
    }

    // 既に登録されているか確認
    const existingSubscription = await prisma.restockSubscription.findFirst({
      where: {
        userId,
        itemSize: {
          itemId,
          size,
        },
      },
    });

    if (existingSubscription) {
      // 既存のサブスクリプションがある場合は、アクティブ状態をトグル
      const updated = await prisma.restockSubscription.update({
        where: { id: existingSubscription.id },
        data: { 
          isActive: !existingSubscription.isActive 
        },
      });

      return res.status(200).json({
        message: updated.isActive 
          ? "再入荷通知を登録しました" 
          : "再入荷通知を解除しました",
        isSubscribed: updated.isActive,
      });
    }

    // 新しいサブスクリプションを作成
    await prisma.restockSubscription.create({
      data: {
        userId,
        itemSize: {
          connect: {
            id: itemSize.id,
          },
        },
      },
    });

    return res.status(201).json({
      message: "再入荷通知を登録しました",
      isSubscribed: true,
    });
  } catch (error) {
    console.error("再入荷通知登録エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}
