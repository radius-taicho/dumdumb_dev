import prisma from "@/lib/prisma";

interface UsePointsOptions {
  userId: string;
  orderId: string;
  pointsToUse: number;
}

interface UsePointsResult {
  success: boolean;
  usedPoints: number;
  error?: string;
  transaction?: any;
}

/**
 * 注文時にポイントを消費する
 * 最も早く失効するポイントから優先的に使用する
 */
export const usePoints = async (
  options: UsePointsOptions
): Promise<UsePointsResult> => {
  const { userId, orderId, pointsToUse } = options;

  if (pointsToUse <= 0) {
    return {
      success: false,
      usedPoints: 0,
      error: "使用ポイント数は0より大きい必要があります",
    };
  }

  try {
    // 現在の有効なポイントを取得（有効期限の早い順）
    const now = new Date();
    const availablePoints = await prisma.Point.findMany({
      where: {
        userId,
        amount: { gt: 0 }, // 正のポイントのみ（以前のポイント消費操作でマイナスのレコードがある可能性があるため）
        expiresAt: { gt: now }, // 有効期限内のポイントのみ
        isUsed: false,
      },
      orderBy: { expiresAt: "asc" }, // 有効期限の早いものから先に使う
    });

    // 利用可能なポイント合計
    const totalAvailablePoints = availablePoints.reduce(
      (sum, point) => sum + point.amount,
      0
    );

    if (totalAvailablePoints < pointsToUse) {
      return {
        success: false,
        usedPoints: 0,
        error: `利用可能なポイントが足りません（利用可能: ${totalAvailablePoints}ポイント）`,
      };
    }

    // ポイント使用処理（トランザクション内で実行）
    const transaction = await prisma.$transaction(async (tx) => {
      let remainingPointsToUse = pointsToUse;
      const usedPointRecords = [];

      // 有効期限の早いポイントから順に消費
      for (const point of availablePoints) {
        if (remainingPointsToUse <= 0) break;

        const pointsToUseFromThis = Math.min(
          point.amount,
          remainingPointsToUse
        );

        // ポイント使用記録を作成（負の値で記録）
        const usedPointRecord = await tx.Point.create({
          data: {
            userId,
            amount: -pointsToUseFromThis,
            orderId,
            expiresAt: point.expiresAt, // 同じ有効期限を持たせる
            isUsed: true,
            meta: {
              usedFromPointId: point.id,
            },
          },
        });

        // 元のポイントレコードを使用済みに更新
        await tx.Point.update({
          where: { id: point.id },
          data: { isUsed: true },
        });

        usedPointRecords.push(usedPointRecord);
        remainingPointsToUse -= pointsToUseFromThis;
      }

      // 注文にポイント使用情報を記録
      await tx.order.update({
        where: { id: orderId },
        data: {
          pointsUsed: pointsToUse,
          pointsUsedIds: usedPointRecords.map((record) => record.id),
        },
      });

      return { usedPointRecords, totalUsed: pointsToUse };
    });

    return {
      success: true,
      usedPoints: pointsToUse,
      transaction,
    };
  } catch (error) {
    console.error("ポイント消費処理中にエラーが発生しました:", error);
    return {
      success: false,
      usedPoints: 0,
      error: `ポイント消費処理中にエラーが発生しました: ${error.message}`,
    };
  }
};

/**
 * 注文キャンセル時などにポイント使用を取り消す
 */
export const cancelUsedPoints = async (orderId: string): Promise<boolean> => {
  try {
    // 注文情報を取得
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        pointsUsed: true,
        pointsUsedIds: true,
      },
    });

    if (!order || !order.pointsUsed || order.pointsUsed <= 0) {
      return true; // ポイント使用がなければ何もしない
    }

    // トランザクション内でポイント消費取消を実行
    await prisma.$transaction(async (tx) => {
      // 使用済みポイントレコードを取得
      const usedPointRecords = await tx.Point.findMany({
        where: {
          id: { in: order.pointsUsedIds || [] },
        },
      });

      for (const record of usedPointRecords) {
        // 元のポイントのIDが記録されている場合
        if (record.meta?.usedFromPointId) {
          // 元のポイントレコードを未使用に戻す
          await tx.Point.update({
            where: { id: record.meta.usedFromPointId },
            data: { isUsed: false },
          });
        }

        // ポイント消費の記録を取り消し状態に更新
        await tx.Point.update({
          where: { id: record.id },
          data: {
            isUsed: false,
            meta: {
              ...record.meta,
              cancelled: true,
              cancelledAt: new Date(),
            },
          },
        });
      }

      // 注文のポイント使用情報をリセット
      await tx.order.update({
        where: { id: orderId },
        data: {
          pointsUsed: 0,
          pointsUsedIds: [],
        },
      });
    });

    return true;
  } catch (error) {
    console.error("ポイント使用取消処理中にエラーが発生しました:", error);
    return false;
  }
};
