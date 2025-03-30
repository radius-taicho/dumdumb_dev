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
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { anonymousSessionToken, itemId, size } = req.body;

    if (!anonymousSessionToken || !itemId) {
      return res.status(400).json({ 
        success: false, 
        message: "Anonymous session token and item ID are required" 
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

    // カートアイテムを取得
    const cartItems = await prisma.cartItem.findMany({
      where: {
        cartId: anonymousSession.cart.id,
        itemId,
        size: size as Size | null,
      },
    });

    if (cartItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
      });
    }

    // カートアイテムを削除
    await prisma.cartItem.deleteMany({
      where: {
        cartId: anonymousSession.cart.id,
        itemId,
        size: size as Size | null,
      },
    });

    // 更新後のカートを取得
    const updatedCart = await prisma.cart.findUnique({
      where: { id: anonymousSession.cart.id },
      include: { items: { include: { item: true } } },
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error removing from anonymous cart:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
