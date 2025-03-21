import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type Data = {
  success: boolean;
  message?: string;
  cartItem?: any;
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
    const { cartItemId, quantity } = req.body;

    if (!cartItemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // カートアイテムの存在確認
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { 
        item: {
          include: {
            itemSizes: true
          }
        } 
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "カートアイテムが見つかりません",
      });
    }

    // 在庫確認
    if (cartItem.item.hasSizes && cartItem.size) {
      // サイズ別在庫確認
      const sizeItem = cartItem.item.itemSizes.find(
        (s) => s.size === cartItem.size
      );

      if (!sizeItem) {
        return res.status(400).json({
          success: false,
          message: "選択されたサイズは存在しません",
        });
      }

      if (sizeItem.inventory < quantity) {
        return res.status(400).json({
          success: false,
          message: "選択されたサイズの在庫が不足しています",
        });
      }
    } else {
      // 通常の在庫確認
      if (cartItem.item.inventory < quantity) {
        return res.status(400).json({
          success: false,
          message: "在庫が不足しています",
        });
      }
    }

    // カートアイテムの数量を更新
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { item: true },
    });

    return res.status(200).json({
      success: true,
      message: "カートアイテムを更新しました",
      cartItem: updatedCartItem,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
