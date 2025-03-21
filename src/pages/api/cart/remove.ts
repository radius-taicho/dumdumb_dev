import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type Data = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { cartItemId } = req.body;

    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: "Missing cartItemId",
      });
    }

    // カートアイテムの存在確認
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "カートアイテムが見つかりません",
      });
    }

    // カートアイテムを削除
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return res.status(200).json({
      success: true,
      message: "カートアイテムを削除しました",
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
