import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Size } from "@prisma/client";

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
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { anonymousSessionToken, itemId, quantity, size } = req.body;

    if (!anonymousSessionToken || !itemId || quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Anonymous session token, item ID, and quantity are required" 
      });
    }

    // 数量が0以下の場合はエラー
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // 匿名セッションを取得
    const anonymousSession = await prisma.anonymousSession.findUnique({
      where: { token: anonymousSessionToken },
      include: { cart: true },
    });

    if (!anonymousSession || !anonymousSession.cart) {
      return res.status(404).json({ 
        success: false, 
        message: "Anonymous session or cart not found" 
      });
    }

    // アイテムの在庫を確認
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { itemSizes: true },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // サイズごとの在庫管理をしている場合
    if (item.hasSizes) {
      if (!size) {
        return res.status(400).json({
          success: false,
          message: "Size is required for this item",
        });
      }

      // 選択されたサイズの在庫を確認
      const sizeItem = item.itemSizes.find((s) => s.size === size);

      if (!sizeItem) {
        return res.status(400).json({
          success: false,
          message: "Size not found",
        });
      }

      if (sizeItem.inventory < quantity) {
        return res.status(400).json({
          success: false,
          message: "Not enough inventory for the selected size",
        });
      }
    } else {
      // 通常の在庫管理
      if (item.inventory < quantity) {
        return res.status(400).json({
          success: false,
          message: "Not enough inventory",
        });
      }
    }

    // カートアイテムを取得
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: anonymousSession.cart.id,
        itemId,
        size: size as Size | null,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // カートアイテムを更新
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    // 更新後のカートを取得
    const updatedCart = await prisma.cart.findUnique({
      where: { id: anonymousSession.cart.id },
      include: { items: { include: { item: true } } },
    });

    return res.status(200).json({
      success: true,
      message: "Cart item updated",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error updating anonymous cart:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
