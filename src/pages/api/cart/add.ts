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
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { userId, itemId, quantity } = req.body;

    if (!userId || !itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 商品の存在と在庫確認
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "商品が見つかりません",
      });
    }

    if (item.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: "在庫が不足しています",
      });
    }

    // カートの存在確認、なければ作成
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { item: true } } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { item: true } } },
      });
    }

    // カート内に既に同じ商品があるか確認
    const existingItem = cart.items.find(
      (item) => item.itemId === itemId
    );

    if (existingItem) {
      // 既存のアイテムを更新
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // 新しいアイテムを追加
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemId,
          quantity,
        },
      });
    }

    // 更新されたカートを取得
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { item: true } } },
    });

    return res.status(200).json({
      success: true,
      message: "カートに商品を追加しました",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
