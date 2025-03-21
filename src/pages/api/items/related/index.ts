import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type Data = {
  success: boolean;
  message?: string;
  items?: any[];
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
    const { characterId, categoryId, limit = "5" } = req.query;

    // characterIdまたはcategoryIdのいずれかが必要
    if (!characterId && !categoryId) {
      return res.status(400).json({
        success: false,
        message: "characterIdまたはcategoryIdが必要です",
      });
    }

    const limitNum = parseInt(limit as string) || 5;

    let items = [];

    // キャラクターIDが指定されている場合は同じキャラクターのアイテムを取得
    if (characterId) {
      items = await prisma.item.findMany({
        where: {
          characterId: characterId as string,
        },
        take: limitNum,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          character: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }
    // カテゴリーIDが指定されている場合は同じカテゴリーのアイテムを取得
    else if (categoryId) {
      items = await prisma.item.findMany({
        where: {
          categoryId: categoryId as string,
        },
        take: limitNum,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          character: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    // BigInt型をJSON化するために文字列に変換
    const serializedItems = JSON.parse(
      JSON.stringify(items, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return res.status(200).json({
      success: true,
      items: serializedItems,
    });
  } catch (error) {
    console.error("Error fetching related items:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
