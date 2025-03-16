import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type Data = {
  success: boolean;
  message?: string;
  cart?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { userId, cartItemId, quantity } = req.body;

    if (!userId || !cartItemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // カートアイテムの存在確認
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { item: true, cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "カートアイテムが見つかりません",
      });
    }

    // カートの所有者確認
    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "不正なアクセスです",
      });
    }

    // 在庫確認
    if (cartItem.item.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: "在庫が不足しています",
      });
    }

    if (quantity <= 0) {
      // 数量が0以下の場合は削除
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      // 数量を更新
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    // 更新されたカートを取得
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { item: true } } },
    });

    return res.status(200).json({
      success: true,
      message: "カートを更新しました",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
