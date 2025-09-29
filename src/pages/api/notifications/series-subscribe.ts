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
    const { seriesId } = req.body;

    // データ検証
    if (!seriesId) {
      return res.status(400).json({ message: "シリーズIDが必要です" });
    }

    // シリーズが存在するか確認
    const series = await prisma.characterSeries.findUnique({
      where: { id: seriesId },
    });

    if (!series) {
      return res.status(404).json({ message: "シリーズが見つかりません" });
    }

    // 既に登録されているか確認
    const existingSubscription = await prisma.seriesSubscription.findFirst({
      where: {
        userId,
        characterSeriesId: seriesId,
      },
    });

    if (existingSubscription) {
      // 既存のサブスクリプションがある場合は、アクティブ状態をトグル
      const updated = await prisma.seriesSubscription.update({
        where: { id: existingSubscription.id },
        data: { 
          isActive: !existingSubscription.isActive 
        },
      });

      return res.status(200).json({
        message: updated.isActive 
          ? "シリーズの新着通知を登録しました" 
          : "シリーズの新着通知を解除しました",
        isSubscribed: updated.isActive,
      });
    }

    // 新しいサブスクリプションを作成
    await prisma.seriesSubscription.create({
      data: {
        userId,
        characterSeries: {
          connect: {
            id: seriesId,
          },
        },
      },
    });

    return res.status(201).json({
      message: "シリーズの新着通知を登録しました",
      isSubscribed: true,
    });
  } catch (error) {
    console.error("シリーズ通知登録エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}
