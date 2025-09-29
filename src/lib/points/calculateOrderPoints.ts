import { Order, OrderItem, Product } from "@prisma/client";

type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product;
  })[];
};

interface PointCalculationResult {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  breakdown: {
    itemId: string;
    itemName: string;
    basePoints: number;
    bonusPoints: number;
    bonusReason?: string;
  }[];
}

/**
 * 注文に対するポイント計算を行う
 * @param order 注文情報（アイテム情報を含む）
 * @returns 計算されたポイント情報
 */
export const calculateOrderPoints = (
  order: OrderWithItems
): PointCalculationResult => {
  const result: PointCalculationResult = {
    basePoints: 0,
    bonusPoints: 0,
    totalPoints: 0,
    breakdown: [],
  };

  // 各アイテムごとにポイントを計算
  order.items.forEach((item) => {
    const price = item.price;
    const quantity = item.quantity;
    const subtotal = price * quantity;

    // 基本ポイント: アイテム金額の1%（1円 = 1ポイント）
    const basePoints = Math.floor(subtotal * 0.01);

    // ボーナスポイント計算（アイテムの特性によってボーナスポイントが変わる場合）
    let bonusPoints = 0;
    let bonusReason = undefined;

    // セールアイテムの場合は追加ポイント（例: 通常の2倍）
    if (item.product.onSale) {
      bonusPoints = basePoints; // 通常ポイントと同額をボーナスとして追加
      bonusReason = "セールアイテム: 2倍ポイント";
    }

    // 特定のキャンペーン対象アイテムの場合
    if (item.product.campaignId) {
      // キャンペーンに応じたボーナスポイント（例: 5%追加）
      const campaignBonus = Math.floor(subtotal * 0.05);
      bonusPoints += campaignBonus;
      bonusReason = bonusReason
        ? `${bonusReason}、キャンペーン対象: +5%ポイント`
        : "キャンペーン対象: +5%ポイント";
    }

    // アイテムごとの内訳を追加
    result.breakdown.push({
      itemId: item.productId,
      itemName: item.product.name,
      basePoints,
      bonusPoints,
      bonusReason,
    });

    // 合計に加算
    result.basePoints += basePoints;
    result.bonusPoints += bonusPoints;
  });

  // 注文全体の合計ポイント
  result.totalPoints = result.basePoints + result.bonusPoints;

  return result;
};

/**
 * ポイントに有効期限を設定する (デフォルト: 1年)
 * @returns ポイントの有効期限日
 */
export const calculatePointExpiryDate = (): Date => {
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  return expiryDate;
};
