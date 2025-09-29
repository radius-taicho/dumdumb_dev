import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/redis";

// キャッシュTTL
const CACHE_TTL = 5 * 60; // 5分間（秒単位）
const MAX_DATES_PER_ITEM = 10; // 各アイテムに対して最大10件の履歴を返す

type ViewHistoryDetails = {
  [itemId: string]: {
    dates: string[]; // ISO形式の日付文字列の配列
    count: number;
  };
};

type Data = {
  success: boolean;
  message?: string;
  viewHistoryDetails?: ViewHistoryDetails;
  fromCache?: boolean;
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
    // リクエストからパラメータを取得
    const { anonymousSessionToken, limit = '20' } = req.query;
    const limitNum = parseInt(limit as string, 10) || 20;

    // アクセス情報の取得
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;

    let viewCondition: any = {};
    let anonymousSessionId: string | null = null;

    // ログインユーザーの場合
    if (userId) {
      viewCondition = { userId };
    }
    // 匿名セッションの場合
    else if (
      anonymousSessionToken &&
      typeof anonymousSessionToken === "string"
    ) {
      // 匿名セッションの確認
      const anonymousSession = await prisma.anonymousSession.findUnique({
        where: { token: anonymousSessionToken },
      });

      if (!anonymousSession) {
        return res
          .status(404)
          .json({ success: false, message: "Anonymous session not found" });
      }

      anonymousSessionId = anonymousSession.id;
      viewCondition = { anonymousSessionId };
    } else {
      // どちらも指定されていない場合
      return res.status(400).json({
        success: false,
        message:
          "Either authenticated user or anonymous session token is required",
      });
    }

    // キャッシュキー
    const userIdentifier = userId || anonymousSessionToken;
    const cacheKey = `view_history_details_${userIdentifier}_${limitNum}`;
    
    // Redisからキャッシュチェック
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        viewHistoryDetails: cachedData,
        fromCache: true
      });
    }

    // 全アイテムの視聴履歴を取得（制限あり）
    const viewHistories = await prisma.itemViewHistory.findMany({
      where: viewCondition,
      orderBy: {
        viewedAt: "desc",
      },
      take: limitNum, // 最新20件に制限
      include: {
        item: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 各アイテムの視聴履歴をグループ化
    const viewHistoryDetails: ViewHistoryDetails = {};

    viewHistories.forEach((history) => {
      const itemId = history.itemId;

      if (!viewHistoryDetails[itemId]) {
        viewHistoryDetails[itemId] = {
          dates: [],
          count: 0,
        };
      }

      // 日付をISO形式の文字列で保存（JSONでのシリアライズに対応）
      viewHistoryDetails[itemId].dates.push(history.viewedAt.toISOString());
      viewHistoryDetails[itemId].count++;
    });

    // 各アイテムの記録を制限する
    Object.keys(viewHistoryDetails).forEach(itemId => {
      if (viewHistoryDetails[itemId].dates.length > MAX_DATES_PER_ITEM) {
        viewHistoryDetails[itemId].dates = viewHistoryDetails[itemId].dates.slice(0, MAX_DATES_PER_ITEM);
      }
    });

    // キャッシュに保存
    await cacheSet(cacheKey, viewHistoryDetails, CACHE_TTL);

    return res.status(200).json({
      success: true,
      viewHistoryDetails,
    });
  } catch (error) {
    console.error("Error getting view history details:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
