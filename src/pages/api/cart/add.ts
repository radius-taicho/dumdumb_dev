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
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed: このAPIはPOSTリクエストのみ受け付けます" });
  }

  try {
    // リクエストボディをログに記録（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('カート追加APIリクエスト:', req.body);
    }
    
    const { userId, itemId, quantity, size } = req.body;

    // 必須フィールドの検証を詳細に行う
    const missingFields = [];
    if (!userId) missingFields.push('userId');
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

    // カート内に既に同じアイテム（同じサイズ）があるか確認
    const existingItem = cart.items.find(
      (cartItem) => cartItem.itemId === itemId && cartItem.size === size
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
          size: size as Size | null,
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
      message: "カートにアイテムを追加しました",
      cart: updatedCart,
    });
  } catch (error) {
    // エラーを詳細にログ出力
    console.error("カート追加処理エラー:", error);
    
    let errorMessage = "サーバー内部エラーが発生しました";
    let statusCode = 500;
    
    // エラータイプに応じてより具体的なメッセージを提供
    if (error instanceof Error) {
      // 特定のエラータイプをチェック
      if (error.name === 'PrismaClientKnownRequestError') {
        // Prismaの既知のエラー
        errorMessage = `データベースエラー: ${error.message}`;
      } else if (error.name === 'PrismaClientValidationError') {
        // バリデーションエラー
        errorMessage = `入力データが不正です: ${error.message}`;
      } else {
        // その他の一般的なエラー
        errorMessage = `エラー: ${error.message}`;
      }
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      errorDetail: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}
