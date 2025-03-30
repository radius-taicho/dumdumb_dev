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
    const { itemId, size, seriesId } = req.query;

    // アイテムの在庫通知を確認する場合
    if (itemId && size) {
      // サイズ情報を取得
      const itemSize = await prisma.itemSize.findFirst({
        where: {
          itemId: itemId as string,
          size: size as any,
        },
      });

      if (!itemSize) {
        return res.status(404).json({ message: "指定されたサイズが見つかりません" });
      }

      // 通知登録状態を確認
      const subscription = await prisma.restockSubscription.findFirst({
        where: {
          userId,
          itemSizeId: itemSize.id,
          isActive: true,
        },
      });

      return res.status(200).json({
        isSubscribed: !!subscription,
      });
    }
    
    // シリーズの通知を確認する場合
    else if (seriesId) {
      // 通知登録状態を確認
      const subscription = await prisma.seriesSubscription.findFirst({
        where: {
          userId,
          characterSeriesId: seriesId as string,
          isActive: true,
        },
      });

      return res.status(200).json({
        isSubscribed: !!subscription,
      });
    }
    
    else {
      return res.status(400).json({ message: "itemIdとsizeまたはseriesIdが必要です" });
    }

  } catch (error) {
    console.error("通知登録状態確認エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}
