import prisma from '../prisma';
import { calculateOrderPoints, calculatePointExpiryDate } from './calculateOrderPoints';

/**
 * 注文完了時に自動的にポイントを付与する
 * @param orderId 注文ID
 * @returns 付与されたポイント情報
 */
export const awardOrderPoints = async (orderId: string) => {
  try {
    // 注文情報を取得（必要な関連データを含む）
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order || !order.userId) {
      throw new Error('注文が見つからないか、ユーザーに紐づいていません');
    }

    // ポイント計算
    const pointsCalculation = calculateOrderPoints(order);
    
    // ポイント有効期限の設定
    const expiryDate = calculatePointExpiryDate();

    // ポイント付与処理
    const pointRecord = await prisma.point.create({
      data: {
        userId: order.userId,
        amount: pointsCalculation.totalPoints,
        orderId: order.id,
        expiresAt: expiryDate,
        meta: {
          basePoints: pointsCalculation.basePoints,
          bonusPoints: pointsCalculation.bonusPoints,
          breakdown: pointsCalculation.breakdown,
        },
      },
    });

    // 注文レコードにポイント付与済みフラグを設定
    await prisma.order.update({
      where: { id: order.id },
      data: { pointsAwarded: true },
    });

    // ユーザーに通知を送信
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'POINTS_EARNED',
        title: 'ポイントが付与されました',
        content: `注文(${order.orderNumber})に対して${pointsCalculation.totalPoints}ポイントが付与されました。`,
        isRead: false,
        meta: {
          orderId: order.id,
          points: pointsCalculation.totalPoints,
        },
      },
    });

    return {
      success: true,
      pointsAwarded: pointsCalculation.totalPoints,
      pointRecord,
    };
  } catch (error) {
    console.error('ポイント付与処理中にエラーが発生しました:', error);
    return {
      success: false,
      error: `ポイント付与処理中にエラーが発生しました: ${error.message}`,
    };
  }
};

/**
 * 注文キャンセル/返品時にポイントを取り消す
 * @param orderId 注文ID
 */
export const cancelOrderPoints = async (orderId: string) => {
  try {
    // 対象の注文に対して付与したポイントを検索
    const pointRecords = await prisma.point.findMany({
      where: { 
        orderId,
        // 負のポイント（取消済み）を除外
        amount: { gt: 0 },
      },
    });

    if (pointRecords.length === 0) {
      return { success: true, message: 'この注文に対するポイントはありません' };
    }

    // 各ポイントレコードに対して取消処理
    const cancelResults = await Promise.all(
      pointRecords.map(async (record) => {
        // 取消用の負のポイントレコードを作成
        const cancelRecord = await prisma.point.create({
          data: {
            userId: record.userId,
            amount: -record.amount, // 負の値で相殺
            orderId,
            expiresAt: record.expiresAt,
            meta: {
              canceledPointId: record.id,
              reason: '注文キャンセル',
            },
          },
        });

        // ユーザーに通知を送信
        await prisma.notification.create({
          data: {
            userId: record.userId,
            type: 'POINTS_CANCELED',
            title: 'ポイントが取り消されました',
            content: `注文(${orderId})のキャンセルにより${record.amount}ポイントが取り消されました。`,
            isRead: false,
            meta: {
              orderId,
              points: record.amount,
            },
          },
        });

        return cancelRecord;
      })
    );

    return {
      success: true,
      canceledRecords: cancelResults,
    };
  } catch (error) {
    console.error('ポイント取り消し処理中にエラーが発生しました:', error);
    return {
      success: false,
      error: `ポイント取り消し処理中にエラーが発生しました: ${error.message}`,
    };
  }
};
