import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET リクエストのみ許可
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // カテゴリーの取得（関連するアイテム数を含む）
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    // 各カテゴリーのアイテム数を取得
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const itemCount = await prisma.item.count({
          where: { categoryId: category.id },
        });
        return {
          ...category,
          itemCount,
        };
      })
    );

    return res.status(200).json(categoriesWithCounts);
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    return res
      .status(500)
      .json({ message: "カテゴリーの取得中にエラーが発生しました" });
  }
}
