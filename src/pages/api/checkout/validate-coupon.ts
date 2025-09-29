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
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        valid: false,
        message: "クーポンコードが必要です",
      });
    }

    // クーポンコードを検索
    const coupon = await prisma.Coupon.findUnique({
      where: { code },
    });

    // クーポンが存在しないか、既に使用済みの場合
    if (!coupon) {
      return res.status(200).json({
        valid: false,
        message: "無効なクーポンコードです",
      });
    }

    // クーポンが既に使用済みの場合
    if (coupon.isUsed) {
      return res.status(200).json({
        valid: false,
        message: "このクーポンは既に使用されています",
      });
    }

    // クーポンの有効期限が切れている場合
    const now = new Date();
    if (new Date(coupon.expiresAt) < now) {
      return res.status(200).json({
        valid: false,
        message: "このクーポンの有効期限が切れています",
      });
    }

    // 最低購入金額を満たしていない場合
    if (coupon.minimumPurchase && subtotal < coupon.minimumPurchase) {
      return res.status(200).json({
        valid: false,
        message: `最低購入金額（${coupon.minimumPurchase.toLocaleString()}円）を満たしていません`,
      });
    }

    // クーポンが他のユーザーのものである場合
    if (coupon.userId !== session.user.id) {
      return res.status(200).json({
        valid: false,
        message: "このクーポンは別のユーザーに紐づいています",
      });
    }

    // クーポンが有効である場合
    return res.status(200).json({
      valid: true,
      coupon,
      message: "クーポンが適用されました",
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return res.status(500).json({
      valid: false,
      message: "クーポン検証中にエラーが発生しました",
    });
  }
}
