import prisma from '../prisma';
import { generateCouponCode, calculateCouponExpiryDate } from './generateCouponCode';
import { sendCouponIssuedEmail } from '../email/couponNotifications';

interface CouponTemplate {
  prefix: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumPurchase: number | null;
  expiryMonths: number;
  description: string;
}

const COUPON_TEMPLATES = {
  WELCOME: {
    prefix: 'WELCOME',
    discountType: 'percentage',
    discountValue: 10,
    minimumPurchase: 2000,
    expiryMonths: 1,
    description: '新規会員登録特典',
  },
  BIRTHDAY: {
    prefix: 'BDAY',
    discountType: 'percentage',
    discountValue: 15,
    minimumPurchase: null,
    expiryMonths: 1,
    description: 'お誕生日特典',
  },
  FIRST_ORDER: {
    prefix: 'FIRST',
    discountType: 'fixed',
    discountValue: 1000,
    minimumPurchase: 5000,
    expiryMonths: 2,
    description: '初回購入特典',
  },
  REACTIVATION: {
    prefix: 'COMEBACK',
    discountType: 'percentage',
    discountValue: 20,
    minimumPurchase: 3000,
    expiryMonths: 1,
    description: '復活特典',
  },
  LAUNCH: {
    prefix: 'LAUNCH',
    discountType: 'percentage',
    discountValue: 15,
    minimumPurchase: 3000,
    expiryMonths: 1,
    description: 'サービス開始記念',
  },
} as const;

/**
 * ユーザーにクーポンを発行する
 * @param userId ユーザーID
 * @param templateKey クーポンテンプレートのキー
 * @param sendEmail メール通知を送信するかどうか
 * @returns 発行されたクーポン情報
 */
export const issueCoupon = async (
  userId: string,
  templateKey: keyof typeof COUPON_TEMPLATES,
  sendEmail: boolean = true
) => {
  try {
    const template = COUPON_TEMPLATES[templateKey];
    
    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    
    // クーポンコードを生成
    const code = generateCouponCode(template.prefix);
    
    // クーポン有効期限を計算
    const expiryDate = calculateCouponExpiryDate(template.expiryMonths);
    
    // クーポンをデータベースに保存
    const coupon = await prisma.coupon.create({
      data: {
        userId,
        code,
        discountType: template.discountType,
        discountValue: template.discountValue,
        minimumPurchase: template.minimumPurchase,
        expiresAt: expiryDate,
        isUsed: false,
        meta: {
          description: template.description,
          templateKey,
        },
      },
    });
    
    // ユーザーに通知を送信
    await prisma.notification.create({
      data: {
        userId,
        type: 'COUPON_ISSUED',
        title: 'クーポンが発行されました',
        content: `${template.description}クーポン「${code}」が発行されました。有効期限: ${expiryDate.toLocaleDateString()}`,
        isRead: false,
        meta: {
          couponId: coupon.id,
          couponCode: code,
        },
      },
    });
    
    // メール通知を送信（オプション）
    if (sendEmail && user.email) {
      await sendCouponIssuedEmail(user.email, {
        userName: user.name || 'お客様',
        couponCode: code,
        discountType: template.discountType,
        discountValue: template.discountValue,
        minimumPurchase: template.minimumPurchase,
        expiryDate,
        description: template.description,
      });
    }
    
    return {
      success: true,
      coupon,
    };
  } catch (error) {
    console.error('クーポン発行処理中にエラーが発生しました:', error);
    return {
      success: false,
      error: `クーポン発行処理中にエラーが発生しました: ${error.message}`,
    };
  }
};

/**
 * 条件に応じて適切なクーポンを発行する
 * @param userId ユーザーID
 * @returns 発行されたクーポン情報（条件に合わない場合はnull）
 */
export const issueCouponIfEligible = async (userId: string) => {
  try {
    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          where: { status: 'COMPLETED' },
        },
        coupons: true,
      },
    });
    
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    
    // 新規登録ユーザーでまだウェルカムクーポンを持っていない場合
    const hasWelcomeCoupon = user.coupons.some(
      (coupon) => coupon.meta?.templateKey === 'WELCOME'
    );
    
    const userCreatedRecently = (
      new Date().getTime() - new Date(user.createdAt).getTime()
    ) < 7 * 24 * 60 * 60 * 1000; // 7日以内に作成されたアカウント
    
    if (userCreatedRecently && !hasWelcomeCoupon) {
      return issueCoupon(userId, 'WELCOME');
    }
    
    // 初回購入の場合（現在の注文を含めて注文数が1の場合）
    if (user.orders.length === 1) {
      return issueCoupon(userId, 'FIRST_ORDER');
    }
    
    // 長期未利用ユーザー（最終注文から3ヶ月以上経過）の場合
    if (user.orders.length > 0) {
      const lastOrder = user.orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      const daysSinceLastOrder = 
        (new Date().getTime() - new Date(lastOrder.createdAt).getTime()) 
        / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastOrder > 90) { // 3ヶ月（90日）以上購入がない
        return issueCoupon(userId, 'REACTIVATION');
      }
    }
    
    // 誕生日月の場合（ユーザープロファイルに誕生日が登録されている場合）
    if (user.birthdate) {
      const birthdate = new Date(user.birthdate);
      const currentMonth = new Date().getMonth();
      
      if (birthdate.getMonth() === currentMonth) {
        // 当月にまだ誕生日クーポンを発行していない場合
        const hasCurrentYearBirthdayCoupon = user.coupons.some(coupon => {
          const currentYear = new Date().getFullYear();
          const couponCreatedYear = new Date(coupon.createdAt).getFullYear();
          
          return coupon.meta?.templateKey === 'BIRTHDAY' && couponCreatedYear === currentYear;
        });
        
        if (!hasCurrentYearBirthdayCoupon) {
          return issueCoupon(userId, 'BIRTHDAY');
        }
      }
    }
    
    // サービス開始記念クーポン（全ユーザー対象）
    // 特定のフラグや条件をチェックしてサービス開始期間中かを判断
    const isLaunchPeriod = process.env.COUPON_LAUNCH_PERIOD === 'true';
    
    if (isLaunchPeriod) {
      const hasLaunchCoupon = user.coupons.some(
        (coupon) => coupon.meta?.templateKey === 'LAUNCH'
      );
      
      if (!hasLaunchCoupon) {
        return issueCoupon(userId, 'LAUNCH');
      }
    }
    
    // 条件に合うものがない場合
    return {
      success: true,
      couponIssued: false,
      message: 'クーポン発行条件を満たしていません',
    };
  } catch (error) {
    console.error('クーポン発行条件チェック中にエラーが発生しました:', error);
    return {
      success: false,
      error: `クーポン発行条件チェック中にエラーが発生しました: ${error.message}`,
    };
  }
};
