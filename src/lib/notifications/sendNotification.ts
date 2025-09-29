import prisma from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

export type NotificationType =
  | "POINTS_EARNED"
  | "POINTS_EXPIRING"
  | "COUPON_ISSUED"
  | "COUPON_EXPIRING"
  | "PRODUCT_RESTOCK"
  | "ORDER_STATUS"
  | "PRICE_DROP"
  | "SYSTEM";

interface NotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  meta?: any;
  sendEmail?: boolean;
}

/**
 * 通知を送信する（サイト内通知とオプションでメール通知）
 */
export const sendNotification = async (options: NotificationOptions) => {
  const {
    userId,
    type,
    title,
    content,
    meta = {},
    sendEmail = false,
  } = options;

  try {
    // 1. ユーザーの通知設定を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        // 実際の実装では通知設定も取得
      },
    });

    if (!user) {
      throw new Error("ユーザーが見つかりません");
    }

    // 2. データベースに通知を保存（サイト内通知）
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        isRead: false,
        meta,
      },
    });

    // 3. ユーザーが通知の種類に対応するメール通知を希望している場合、メールを送信
    if (sendEmail && user.email) {
      // ここでは簡易的な実装。実際にはユーザーの設定を確認する
      await sendNotificationEmail(user.email, title, content, type, meta);
    }

    return { success: true, notification };
  } catch (error) {
    console.error("通知送信中にエラーが発生しました:", error);
    return { success: false, error: error.message };
  }
};

/**
 * 通知用のメールを送信
 */
const sendNotificationEmail = async (
  email: string,
  title: string,
  content: string,
  type: NotificationType,
  meta: any
) => {
  // 通知タイプに応じたメールテンプレートの選択
  let html = getBasicEmailTemplate(title, content);

  // 特定のタイプに応じた専用テンプレートを使用
  if (type === "POINTS_EARNED") {
    html = getPointsEarnedEmailTemplate(title, content, meta);
  } else if (type === "COUPON_ISSUED") {
    html = getCouponIssuedEmailTemplate(title, content, meta);
  } else if (type === "POINTS_EXPIRING") {
    html = getPointsExpiringEmailTemplate(title, content, meta);
  }

  return sendMail(email, title, html);
};

/**
 * 基本的な通知メールテンプレート
 */
const getBasicEmailTemplate = (title: string, content: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">${title}</h2>
      <p>${content}</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} DumDumb. All rights reserved.</p>
        <p>このメールは配信専用です。ご返信いただいてもお答えできません。</p>
      </div>
    </div>
  `;
};

/**
 * ポイント獲得通知用のメールテンプレート
 */
const getPointsEarnedEmailTemplate = (
  title: string,
  content: string,
  meta: any
) => {
  const points = meta.points || 0;
  const orderId = meta.orderId || "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">${title}</h2>
      
      <div style="background-color: #f8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #e9d8fd;">
        <p style="font-size: 18px; margin-bottom: 10px;">おめでとうございます！</p>
        <p style="font-size: 24px; font-weight: bold; color: #805ad5; margin: 10px 0;">
          ${points.toLocaleString()} ポイント獲得
        </p>
        <p style="margin-top: 10px;">${content}</p>
      </div>
      
      <p>獲得したポイントは次回のお買い物からご利用いただけます。</p>
      <p>ポイントの詳細はマイページの「ポイント履歴」からご確認いただけます。</p>
      
      <div style="margin: 20px 0; text-align: center;">
        <a href="https://dumdumb.example.com/mypage/coupons-points" 
           style="display: inline-block; background-color: #805ad5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          ポイント履歴を確認する
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} DumDumb. All rights reserved.</p>
        <p>このメールは配信専用です。ご返信いただいてもお答えできません。</p>
      </div>
    </div>
  `;
};

/**
 * クーポン発行通知用のメールテンプレート
 */
const getCouponIssuedEmailTemplate = (
  title: string,
  content: string,
  meta: any
) => {
  const couponCode = meta.couponCode || "COUPON";
  const discountType = meta.discountType || "percentage";
  const discountValue = meta.discountValue || 0;
  const expiryDate = meta.expiryDate ? new Date(meta.expiryDate) : new Date();
  const minimumPurchase = meta.minimumPurchase || null;

  const discountText =
    discountType === "percentage"
      ? `${discountValue}%オフ`
      : `${discountValue.toLocaleString()}円オフ`;

  const minimumPurchaseText = minimumPurchase
    ? `${minimumPurchase.toLocaleString()}円以上のご購入が対象です。`
    : "最低購入金額の条件はありません。";

  const formattedExpiryDate = expiryDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">${title}</h2>
      
      <p>${content}</p>
      
      <div style="border: 2px dashed #f97316; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; background-color: #fff7ed;">
        <h3 style="color: #f97316; margin-top: 0;">DumDumbクーポン</h3>
        <p style="font-size: 20px; font-weight: bold; color: #f97316; margin: 10px 0;">${discountText}</p>
        <p>クーポンコード</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #f97316; padding: 10px; background-color: #ffedd5; border-radius: 4px; margin: 10px 0;">${couponCode}</div>
        <p>${minimumPurchaseText}</p>
        <p style="color: #dc2626; font-weight: bold;">有効期限: ${formattedExpiryDate}</p>
      </div>
      
      <p>ご利用方法:</p>
      <ol>
        <li>アイテムをカートに入れる</li>
        <li>決済画面でクーポンコードを入力</li>
        <li>「適用」ボタンをクリックして割引を適用</li>
      </ol>
      
      <p>※クーポンのご利用は1回限りとなります。</p>
      <p>※一部アイテムには適用されない場合があります。</p>
      
      <div style="margin: 20px 0; text-align: center;">
        <a href="https://dumdumb.example.com/mypage/coupons-points" 
           style="display: inline-block; background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          クーポン一覧を確認する
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} DumDumb. All rights reserved.</p>
        <p>このメールは配信専用です。ご返信いただいてもお答えできません。</p>
      </div>
    </div>
  `;
};

/**
 * ポイント失効通知用のメールテンプレート
 */
const getPointsExpiringEmailTemplate = (
  title: string,
  content: string,
  meta: any
) => {
  const points = meta.points || 0;
  const expiryDate = meta.expiryDate ? new Date(meta.expiryDate) : new Date();

  const formattedExpiryDate = expiryDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">${title}</h2>
      
      <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #fed7d7;">
        <p style="font-size: 18px; margin-bottom: 10px;">ポイント失効のお知らせ</p>
        <p style="font-size: 24px; font-weight: bold; color: #e53e3e; margin: 10px 0;">
          ${points.toLocaleString()} ポイントが間もなく失効します
        </p>
        <p style="margin-top: 10px; font-weight: bold;">有効期限: ${formattedExpiryDate}</p>
      </div>
      
      <p>${content}</p>
      
      <div style="margin: 20px 0; text-align: center;">
        <a href="https://dumdumb.example.com/products" 
           style="display: inline-block; background-color: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-right: 10px;">
          今すぐお買い物する
        </a>
        <a href="https://dumdumb.example.com/mypage/coupons-points" 
           style="display: inline-block; background-color: #718096; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          ポイント履歴を確認する
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} DumDumb. All rights reserved.</p>
        <p>このメールは配信専用です。ご返信いただいてもお答えできません。</p>
      </div>
    </div>
  `;
};
