import prisma from "@/lib/prisma";
import { Coupon } from "@prisma/client";

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}

interface ValidationOptions {
  userId: string;
  cartTotal: number;
  cartItems?: {
    productId: string;
    quantity: number;
    price: number;
    categoryIds?: string[];
  }[];
}

/**
 * クーポンの有効性を検証する
 * @param couponCode クーポンコード
 * @param options 検証に必要なカート情報など
 * @returns 検証結果
 */
export const validateCoupon = async (
  couponCode: string,
  options: ValidationOptions
): Promise<CouponValidationResult> => {
  try {
    const { userId, cartTotal, cartItems = [] } = options;

    // クーポンコードからクーポン情報を取得
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode,
        isActive: true,
      },
    });

    // クーポンが存在しない場合
    if (!coupon) {
      return {
        isValid: false,
        message: "クーポンが見つかりません。",
      };
    }

    // 有効期限チェック
    const currentDate = new Date();
    if (coupon.expiryDate && new Date(coupon.expiryDate) < currentDate) {
      return {
        isValid: false,
        coupon,
        message: "このクーポンは有効期限が切れています。",
      };
    }

    // ユーザー制限チェック
    if (coupon.userId && coupon.userId !== userId) {
      return {
        isValid: false,
        message: "このクーポンは他のユーザーに発行されたものです。",
      };
    }

    // 使用済みチェック
    if (coupon.isUsed) {
      return {
        isValid: false,
        coupon,
        message: "このクーポンはすでに使用されています。",
      };
    }

    // 最低購入金額チェック
    if (coupon.minimumPurchase && cartTotal < coupon.minimumPurchase) {
      return {
        isValid: false,
        coupon,
        message: `このクーポンは${coupon.minimumPurchase.toLocaleString()}円以上のお買い物で使用できます。`,
      };
    }

    // 対象アイテム/カテゴリーチェック
    if (
      coupon.applicableProductIds?.length ||
      coupon.applicableCategoryIds?.length
    ) {
      // 適用可能なアイテムIDとカテゴリーID
      const applicableProductIds = coupon.applicableProductIds || [];
      const applicableCategoryIds = coupon.applicableCategoryIds || [];

      // カート内で適用可能なアイテムを含むかチェック
      const hasApplicableItems = cartItems.some((item) => {
        // アイテムIDが適用対象か
        const productApplicable = applicableProductIds.includes(item.productId);

        // カテゴリIDが適用対象か
        const categoryApplicable =
          item.categoryIds &&
          item.categoryIds.some((catId) =>
            applicableCategoryIds.includes(catId)
          );

        return productApplicable || categoryApplicable;
      });

      if (!hasApplicableItems) {
        return {
          isValid: false,
          coupon,
          message: "このクーポンはカート内のアイテムには適用できません。",
        };
      }
    }

    // 除外アイテム/カテゴリーチェック
    if (
      coupon.excludedProductIds?.length ||
      coupon.excludedCategoryIds?.length
    ) {
      // 除外対象のアイテムIDとカテゴリーID
      const excludedProductIds = coupon.excludedProductIds || [];
      const excludedCategoryIds = coupon.excludedCategoryIds || [];

      // カート内に除外対象のアイテムを含むかチェック
      const hasExcludedItems = cartItems.some((item) => {
        // アイテムIDが除外対象か
        const productExcluded = excludedProductIds.includes(item.productId);

        // カテゴリIDが除外対象か
        const categoryExcluded =
          item.categoryIds &&
          item.categoryIds.some((catId) => excludedCategoryIds.includes(catId));

        return productExcluded || categoryExcluded;
      });

      if (hasExcludedItems) {
        return {
          isValid: false,
          coupon,
          message: "このクーポンはカート内の一部アイテムに適用できません。",
        };
      }
    }

    // 割引金額を計算
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      // パーセント割引の場合
      discountAmount = Math.floor(cartTotal * (coupon.discountValue / 100));

      // 最大割引額の制限がある場合
      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // 固定金額割引の場合
      discountAmount = coupon.discountValue;

      // 割引額がカート合計を超えないように
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    // クーポンは有効
    return {
      isValid: true,
      coupon,
      discountAmount,
      message: "クーポンが適用されました。",
    };
  } catch (error) {
    console.error("クーポン検証中にエラーが発生しました:", error);
    return {
      isValid: false,
      message: "クーポンの検証中にエラーが発生しました。",
    };
  }
};

/**
 * クーポン使用後の処理（使用済みフラグの設定）
 * @param couponId クーポンID
 * @param userId ユーザーID
 * @param orderId 注文ID
 */
export const markCouponAsUsed = async (
  couponId: string,
  userId: string,
  orderId: string
): Promise<boolean> => {
  try {
    await prisma.coupon.update({
      where: { id: couponId },
      data: {
        isUsed: true,
        usedAt: new Date(),
        usedByOrderId: orderId,
      },
    });

    // クーポン使用履歴を記録
    await prisma.couponUsageHistory.create({
      data: {
        couponId,
        userId,
        orderId,
        usedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("クーポン使用状態の更新中にエラーが発生しました:", error);
    return false;
  }
};
