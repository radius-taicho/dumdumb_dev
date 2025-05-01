import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma-client";
import { awardOrderPoints } from "../../../lib/points/awardOrderPoints";
import { issueCouponIfEligible } from "../../../lib/coupons/issueCoupon";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = session.user.id;

      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });

      // BigInt型をJSON化できるように変換
      const serializedOrders = JSON.parse(
        JSON.stringify(orders, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      return res.status(200).json(serializedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = session.user.id;

      const {
        addressId,
        paymentMethodId,
        deliveryDate,
        deliveryTimeSlot,
        items,
        subtotal,
        shippingFee,
        tax,
        total,
        usedPoints = 0,
        appliedCouponId = null,
      } = req.body;

      // 入力検証
      if (!addressId || !paymentMethodId || !items || items.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // トランザクション内で複数の処理を実行
      const result = await prisma.$transaction(async (tx) => {
        // ポイント使用の処理
        let pointsUsed = 0;

        if (usedPoints > 0) {
          // 利用可能なポイント残高をチェック
          const now = new Date();
          const availablePoints = await tx.Point.findMany({
            where: {
              userId,
              expiresAt: { gt: now },
            },
          });

          const totalAvailablePoints = availablePoints.reduce(
            (sum, point) => sum + point.amount,
            0
          );

          if (usedPoints > totalAvailablePoints) {
            throw new Error(
              `利用可能なポイントは${totalAvailablePoints}ポイントです`
            );
          }

          // ポイント使用記録を作成（マイナス値で記録）
          await tx.point.create({
            data: {
              userId,
              amount: -usedPoints,
              expiresAt: new Date(
                new Date().getFullYear() + 1,
                new Date().getMonth(),
                new Date().getDate()
              ),
              type: "use",
              description: "注文時に使用",
            },
          });

          pointsUsed = usedPoints;
        }

        // クーポン使用の処理
        let couponDiscount = 0;

        if (appliedCouponId) {
          const coupon = await tx.Coupon.findUnique({
            where: { id: appliedCouponId },
          });

          if (!coupon || coupon.userId !== userId || coupon.isUsed) {
            throw new Error("無効なクーポンです");
          }

          // クーポンを使用済みにマーク
          await tx.Coupon.update({
            where: { id: appliedCouponId },
            data: { isUsed: true },
          });

          // 割引額を計算
          if (coupon.discountType === "percentage") {
            couponDiscount = Math.floor(
              (subtotal * coupon.discountValue) / 100
            );
          } else {
            couponDiscount = Math.min(subtotal, coupon.discountValue);
          }
        }

        // 最終的な支払い金額を計算
        const finalTotal = Math.max(0, total - pointsUsed - couponDiscount);

        // 注文番号は使用しないのでコメントアウト
        // const orderNumber = generateOrderNumber();

        // 注文を作成
        const order = await tx.order.create({
          data: {
            userId,
            // orderNumberフィールドはスキーマに存在しないため除去
            totalAmount: finalTotal,
            status: "PENDING",
            address: addressId,
            paymentReferenceId: null, // 支払い処理で後ほど更新
            // metaの代わりに必要な情報を直接カラムに保存するか、別の関連テーブルを使用する
            items: {
              create: items.map((item) => ({
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        // カートを空にする
        await tx.cartItem.deleteMany({
          where: { cart: { userId } },
        });

        return {
          order,
          pointsUsed,
          couponDiscount,
        };
      });

      // 注文作成後の処理

      // 購入ポイント付与
      const pointsResult = await awardOrderPoints(result.order.id);

      // 条件に応じた自動クーポン発行
      const couponResult = await issueCouponIfEligible(userId);

      // 注文データをシリアライズ
      const serializedOrder = JSON.parse(
        JSON.stringify(result.order, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      return res.status(201).json({
        success: true,
        order: serializedOrder,
        pointsUsed: result.pointsUsed,
        couponDiscount: result.couponDiscount,
        pointsAwarded: pointsResult.success ? pointsResult.pointsAwarded : 0,
        couponIssued: couponResult.success && couponResult.couponIssued,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// 注意: 現在のスキーマには注文番号フィールドが存在しないので、この関数は使用していません
/*
// 注文番号生成関数
function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().substr(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${year}${month}${day}-${random}`;
}
*/
