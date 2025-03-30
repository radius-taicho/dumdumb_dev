import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Size } from "@prisma/client";

type Data = {
  success: boolean;
  message?: string;
  cart?: any;
  errorDetail?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed: このAPIはPOSTリクエストのみ受け付けます" });
  }

  try {
    const { anonymousSessionToken, itemId, quantity, size } = req.body;

    // 必須フィールドの検証
    const missingFields = [];
    if (!anonymousSessionToken) missingFields.push('anonymousSessionToken');
    if (!itemId) missingFields.push('itemId');
    if (!quantity) missingFields.push('quantity');
    
    if (missingFields.length > 0) {
      const errorMessage = `必須フィールドが不足しています: ${missingFields.join(', ')}`;
      console.error(errorMessage, req.body);
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    // 匿名セッションの取得
    const anonymousSession = await prisma.anonymousSession.findUnique({
      where: { token: anonymousSessionToken },
    });

    if (!anonymousSession) {
      return res.status(404).json({
        success: false,
        message: "匿名セッションが見つかりません。再読み込みをお試しください。",
      });
    }

    // アイテムの取得と在庫確認
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        itemSizes: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "アイテムが見つかりません",
      });
    }

    // サイズごとの在庫管理をしている場合
    if (item.hasSizes) {
      if (!size) {
        return res.status(400).json({
          success: false,
          message: "このアイテムにはサイズを選択する必要があります",
        });
      }

      // 選択されたサイズの在庫を確認
      const sizeItem = item.itemSizes.find((s) => s.size === size);

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
      // 通常の在庫管理
      if (item.inventory < quantity) {
        return res.status(400).json({
          success: false,
          message: "在庫が不足しています",
        });
      }
    }

    // 匿名ユーザーのカートの存在確認、なければ作成
    let cart = await prisma.cart.findUnique({
      where: { anonymousSessionId: anonymousSession.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { anonymousSessionId: anonymousSession.id },
      });
    }

    // トランザクションを使用して安全にupsert操作を実行
    await prisma.$transaction(async (tx) => {
      // 同じアイテムとサイズの組み合わせがカートにあるか確認
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          itemId: itemId,
          size: size as Size | null,
        },
      });

      if (existingItem) {
        // 既存アイテムを更新
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        // 新規アイテムを作成
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            itemId: itemId,
            quantity: quantity,
            size: size as Size | null,
          },
        });
      }
    });

    // 更新後のカートを取得
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { item: true } } },
    });

    return res.status(200).json({
      success: true,
      message: "カートにアイテムを追加しました",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("匿名カート追加処理エラー:", error);
    
    let errorMessage = "サーバー内部エラーが発生しました";
    let errorDetail = '';
    
    if (error instanceof Error) {
      errorDetail = error.stack || error.message;
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      errorDetail: process.env.NODE_ENV === 'development' ? errorDetail : undefined,
    });
  }
}
