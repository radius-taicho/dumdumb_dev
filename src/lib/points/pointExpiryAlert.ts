import prisma from "../prisma";
import { sendEmail } from "../mail";

interface PointExpiryData {
  userId: string;
  email: string;
  name: string;
  expiringPoints: number;
  expiryDate: Date;
}

/**
 * ポイント失効アラートを処理するメイン関数
 * @param daysUntilExpiry アラートを送信する失効日までの残り日数
 */
export const processPointExpiryAlerts = async (
  daysUntilExpiry: number = 14
) => {
  try {
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysUntilExpiry);

    // 今日から指定日数後に期限切れになるポイントを持つユーザーを特定
    const expiryDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );

    const nextDay = new Date(expiryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // ポイント期限切れが近いユーザーとそのポイント情報を取得
    const expiringPointsData = await prisma.$queryRaw`
      SELECT 
        u.id as "userId", 
        u.email, 
        u.name, 
        SUM(dp.amount) as "expiringPoints", 
        dp."expiresAt" as "expiryDate"
      FROM 
        "User" u
      JOIN 
        "Point" dp ON u.id = dp."userId"
      WHERE 
        dp."expiresAt" >= ${expiryDate} AND
        dp."expiresAt" < ${nextDay} AND
        dp.amount > 0
      GROUP BY 
        u.id, u.email, u.name, dp."expiresAt"
      HAVING 
        SUM(dp.amount) > 0
    `;

    if (
      !expiringPointsData ||
      !Array.isArray(expiringPointsData) ||
      expiringPointsData.length === 0
    ) {
      console.log("期限切れが近いポイントを持つユーザーはいません");
      return {
        success: true,
        message: "期限切れが近いポイントを持つユーザーはいません",
        count: 0,
      };
    }

    // 各ユーザーに対してアラートを送信
    const results = await Promise.all(
      (expiringPointsData as PointExpiryData[]).map(async (data) => {
        // アプリ内通知を作成
        await prisma.notification.create({
          data: {
            userId: data.userId,
            type: "POINTS_EXPIRING",
            title: "ポイント有効期限のお知らせ",
            content: `${
              data.expiringPoints
            }ポイントが${daysUntilExpiry}日後（${data.expiryDate.toLocaleDateString()}）に有効期限を迎えます。`,
            isRead: false,
            meta: {
              expiringPoints: data.expiringPoints,
              expiryDate: data.expiryDate,
            },
          },
        });

        // メール通知を送信
        await sendPointExpiryEmail(data, daysUntilExpiry);

        return {
          userId: data.userId,
          email: data.email,
          expiringPoints: data.expiringPoints,
          notified: true,
        };
      })
    );

    return {
      success: true,
      message: `${results.length}人のユーザーにポイント期限アラートを送信しました`,
      count: results.length,
      details: results,
    };
  } catch (error) {
    console.error("ポイント期限アラート処理中にエラーが発生しました:", error);
    return {
      success: false,
      error: `ポイント期限アラート処理中にエラーが発生しました: ${error.message}`,
    };
  }
};

/**
 * ポイント期限切れアラートメールを送信
 * @param data ポイント期限データ
 * @param daysUntilExpiry 失効までの日数
 */
const sendPointExpiryEmail = async (
  data: PointExpiryData,
  daysUntilExpiry: number
) => {
  const formattedExpiryDate = data.expiryDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `【DumDumb】ポイント有効期限のお知らせ（${daysUntilExpiry}日後に失効）`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .points-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; background-color: #f7fafc; }
        .points-amount { font-size: 24px; font-weight: bold; color: #3182ce; margin: 10px 0; }
        .expiry-alert { color: #e53e3e; font-weight: bold; }
        .cta-button { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 15px; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DumDumb</h1>
        </div>
        
        <p>${data.name || "お客様"} 様</p>
        
        <p>いつもDumDumbをご利用いただき、誠にありがとうございます。</p>
        <p>お持ちのポイントの一部が間もなく有効期限を迎えますのでお知らせいたします。</p>
        
        <div class="points-card">
          <h2>もうすぐ期限切れになるポイント</h2>
          <div class="points-amount">${data.expiringPoints.toLocaleString()} ポイント</div>
          <p class="expiry-alert">有効期限: ${formattedExpiryDate}（あと${daysUntilExpiry}日）</p>
        </div>
        
        <p>期限切れになる前にぜひご利用ください。</p>
        <p>ポイントはアイテムのご購入時に1ポイント＝1円として使用できます。</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://dumdumb.example.com/mypage/coupons-points" class="cta-button">
            ポイントを確認する
          </a>
        </div>
        
        <p>ポイントの利用方法:</p>
        <ol>
          <li>アイテムをカートに入れる</li>
          <li>決済画面で「ポイントを使用する」にチェックを入れる</li>
          <li>使用するポイント数を入力して割引を適用</li>
        </ol>
        
        <p>何かご不明な点がございましたら、お気軽にお問い合わせください。</p>
        
        <div class="footer">
          <p>このメールは配信専用です。ご返信いただいてもお答えできません。</p>
          <p>© 2025 DumDumb All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
${data.name || "お客様"} 様

いつもDumDumbをご利用いただき、誠にありがとうございます。
お持ちのポイントの一部が間もなく有効期限を迎えますのでお知らせいたします。

■ もうすぐ期限切れになるポイント ■
${data.expiringPoints.toLocaleString()} ポイント
有効期限: ${formattedExpiryDate}（あと${daysUntilExpiry}日）

期限切れになる前にぜひご利用ください。
ポイントはアイテムのご購入時に1ポイント＝1円として使用できます。

ポイントを確認する: https://dumdumb.example.com/mypage/coupons-points

ポイントの利用方法:
1. アイテムをカートに入れる
2. 決済画面で「ポイントを使用する」にチェックを入れる
3. 使用するポイント数を入力して割引を適用

何かご不明な点がございましたら、お気軽にお問い合わせください。

このメールは配信専用です。ご返信いただいてもお答えできません。
© 2025 DumDumb All Rights Reserved.
  `;

  return sendEmail({
    to: data.email,
    subject,
    text: textContent,
    html: htmlContent,
  });
};

// 複数の期限日でアラートを設定するためのヘルパー関数
export const scheduleMultipleExpiryAlerts = async () => {
  // 7日前、14日前、30日前にアラートを送信
  const results = await Promise.all([
    processPointExpiryAlerts(7),
    processPointExpiryAlerts(14),
    processPointExpiryAlerts(30),
  ]);

  return {
    success: true,
    results,
  };
};
