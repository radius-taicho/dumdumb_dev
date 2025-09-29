import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { pointsToUse, orderId } = req.body;

    if (pointsToUse < 0) {
      return res.status(400).json({
        success: false,
        message: "ポイント数は0以上である必要があります",
      });
    }

    // ユーザーの利用可能ポイントを取得
    const userId = session.user.id;
    const now = new Date();

    // 有効期限内のポイントを集計
    const pointRecords = await prisma.Point.findMany({
      where: {
        userId,
        expiresAt: { gt: now },
      },
    });

    // 合計ポイントを計算
    const totalAvailablePoints = pointRecords.reduce(
      (sum, point) => sum + point.amount,
      0
    );

    // 利用可能ポイントが足りない場合
    if (pointsToUse > totalAvailablePoints) {
      return res.status(400).json({
        success: false,
        message: `利用可能なポイントは${totalAvailablePoints}ポイントです`,
      });
    }

    // ポイント使用履歴の作成 (実際の注文時に消費する)
    // このAPIは単に検証だけを行い、実際の消費は注文処理時に行う

    return res.status(200).json({
      success: true,
      validatedPoints: pointsToUse,
      message: `${pointsToUse}ポイントの使用が検証されました`,
    });
  } catch (error) {
    console.error("Error validating points:", error);
    return res.status(500).json({
      success: false,
      message: "ポイント検証中にエラーが発生しました",
    });
  }
}
