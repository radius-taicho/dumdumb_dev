import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { itemIds, characterIds } = req.body;

    // 推奨アイテムのクエリを構築
    let recommendedItems = [];

    // 1. まずはキャラクターベースのレコメンド取得 (最大3件)
    if (characterIds && characterIds.length > 0) {
      const characterBasedItems = await prisma.item.findMany({
        where: {
          // 指定されたキャラクターが関連するアイテム
          characters: {
            some: {
              characterId: {
                in: characterIds,
              },
            },
          },
          // すでにカートやお気に入りにあるアイテムは除外
          id: {
            notIn: itemIds || [],
          },
          // 在庫が1以上のアイテムのみ
          inventory: {
            gt: 0,
          },
        },
        include: {
          characters: {
            include: {
              character: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // 新しいアイテム優先
        },
        take: 3,
      });

      // レスポンス用にフォーマット
      recommendedItems.push(
        ...characterBasedItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          images: item.images,
          characters: item.characters.map((ic) => ({
            id: ic.character.id,
            name: ic.character.name,
          })),
        }))
      );
    }

    // 2. 人気アイテム（購入回数が多い）のレコメンド (足りない分を補充)
    if (recommendedItems.length < 5) {
      const popularItems = await prisma.item.findMany({
        where: {
          // すでにカートやお気に入り、またはレコメンド済みのアイテムは除外
          id: {
            notIn: [
              ...(itemIds || []),
              ...recommendedItems.map((item) => item.id),
            ],
          },
          // 在庫が1以上のアイテムのみ
          inventory: {
            gt: 0,
          },
        },
        include: {
          characters: {
            include: {
              character: true,
            },
          },
          orderItems: true, // 注文情報を含める
        },
        orderBy: {
          orderItems: {
            _count: "desc", // 注文数順（人気順）
          },
        },
        take: 5 - recommendedItems.length,
      });

      // レスポンス用にフォーマット
      recommendedItems.push(
        ...popularItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          images: item.images,
          characters: item.characters.map((ic) => ({
            id: ic.character.id,
            name: ic.character.name,
          })),
        }))
      );
    }

    // 3. それでも5件未満ならランダムなアイテムで補充
    if (recommendedItems.length < 5) {
      const randomItems = await prisma.item.findMany({
        where: {
          // すでにカートやお気に入り、またはレコメンド済みのアイテムは除外
          id: {
            notIn: [
              ...(itemIds || []),
              ...recommendedItems.map((item) => item.id),
            ],
          },
          // 在庫が1以上のアイテムのみ
          inventory: {
            gt: 0,
          },
        },
        include: {
          characters: {
            include: {
              character: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // 新着順
        },
        take: 5 - recommendedItems.length,
      });

      // レスポンス用にフォーマット
      recommendedItems.push(
        ...randomItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          images: item.images,
          characters: item.characters.map((ic) => ({
            id: ic.character.id,
            name: ic.character.name,
          })),
        }))
      );
    }

    // BigInt型をJSON化するために文字列に変換
    const serializedItems = JSON.parse(
      JSON.stringify(recommendedItems, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return res.status(200).json({
      recommendedItems: serializedItems,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res
      .status(500)
      .json({ message: "レコメンドアイテムの取得中にエラーが発生しました" });
  }
}
