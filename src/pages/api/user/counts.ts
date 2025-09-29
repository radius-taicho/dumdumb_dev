import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma-client";

type Data = {
  success: boolean;
  message?: string;
  cartCount?: number;
  favoritesCount?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  try {
    // 認証確認
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      // 認証されていなくてもエラーではなく0カウントを返す
      return res.status(200).json({
        success: true,
        cartCount: 0,
        favoritesCount: 0,
        message: "Not authenticated",
      });
    }

    const userId = session.user.id;
    console.log("Fetching counts for user ID:", userId);

    try {
      // 安全なクエリを使用する
      // カートアイテムの数を取得
      const cartItems = await prisma.cartItem.findMany({
        where: {
          cart: {
            userId,
          },
        },
        select: {
          quantity: true,
        },
      });

      // お気に入りの数を取得
      const favoritesCount = await prisma.favorite.count({
        where: {
          userId,
        },
      });

      // カート内のアイテム数を計算
      const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );

      return res.status(200).json({
        success: true,
        cartCount,
        favoritesCount,
      });
    } catch (dbError) {
      console.error("Database error in user counts API:", dbError);
      // データベースエラーの場合も0カウントを返す
      return res.status(200).json({
        success: true,
        cartCount: 0,
        favoritesCount: 0,
        message: "Error fetching counts",
      });
    }
  } catch (error) {
    console.error("Error fetching user counts:", error);
    // エラー時も正常レスポンスを返して、クライアント側のエラーを防ぐ
    return res.status(200).json({
      success: true,
      cartCount: 0,
      favoritesCount: 0,
      message: "Error processing request",
    });
  }
}
