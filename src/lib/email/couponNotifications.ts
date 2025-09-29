import { sendEmail } from "../mail";

interface CouponEmailData {
  userName: string;
  couponCode: string;
  discountType: string;
  discountValue: number;
  minimumPurchase: number | null;
  expiryDate: Date;
  description: string;
}

/**
 * クーポン発行通知メールを送信する
 * @param email 送信先メールアドレス
 * @param data クーポン情報
 */
export const sendCouponIssuedEmail = async (
  email: string,
  data: CouponEmailData
) => {
  const formattedExpiryDate = data.expiryDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const discountText =
    data.discountType === "percentage"
      ? `${data.discountValue}%オフ`
      : `${data.discountValue.toLocaleString()}円オフ`;

  const minimumPurchaseText = data.minimumPurchase
    ? `${data.minimumPurchase.toLocaleString()}円以上のご購入が対象です。`
    : "最低購入金額の条件はありません。";

  const subject = `【DumDumb】${data.description}クーポンが発行されました`;

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
        .coupon-card { border: 2px dashed #5c6ac4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; background-color: #f5f7ff; }
        .coupon-code { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #5c6ac4; padding: 10px; }
        .discount { font-size: 20px; font-weight: bold; color: #5c6ac4; margin: 10px 0; }
        .expiry { color: #e53e3e; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DumDumb</h1>
        </div>
        
        <p>${data.userName} 様</p>
        
        <p>${data.description}として、特別クーポンをお送りします。</p>
        
        <div class="coupon-card">
          <h2>特別クーポン</h2>
          <p class="discount">${discountText}</p>
          <p>クーポンコード</p>
          <div class="coupon-code">${data.couponCode}</div>
          <p>${minimumPurchaseText}</p>
          <p class="expiry">有効期限: ${formattedExpiryDate}</p>
        </div>
        
        <p>ご利用方法:</p>
        <ol>
          <li>アイテムをカートに入れる</li>
          <li>決済画面でクーポンコードを入力</li>
          <li>「適用」ボタンをクリックして割引を適用</li>
        </ol>
        
        <p>※クーポンのご利用は1回限りとなります。</p>
        <p>※一部アイテムには適用されない場合があります。</p>
        
        <p>DumDumbをご利用いただき、誠にありがとうございます。</p>
        
        <div class="footer">
          <p>このメールは配信専用です。ご返信いただいてもお答えできません。</p>
          <p>© 2025 DumDumb All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
${data.userName} 様

${data.description}として、特別クーポンをお送りします。

■ 特別クーポン ■
${discountText}
クーポンコード: ${data.couponCode}
${minimumPurchaseText}
有効期限: ${formattedExpiryDate}

ご利用方法:
1. アイテムをカートに入れる
2. 決済画面でクーポンコードを入力
3. 「適用」ボタンをクリックして割引を適用

※クーポンのご利用は1回限りとなります。
※一部アイテムには適用されない場合があります。

DumDumbをご利用いただき、誠にありがとうございます。

このメールは配信専用です。ご返信いただいてもお答えできません。
© 2025 DumDumb All Rights Reserved.
  `;

  return sendEmail({
    to: email,
    subject,
    text: textContent,
    html: htmlContent,
  });
};

/**
 * 誕生日クーポン発行通知メールを送信する
 * @param email 送信先メールアドレス
 * @param data クーポン情報
 */
export const sendBirthdayCouponEmail = async (
  email: string,
  data: CouponEmailData
) => {
  // 誕生日専用のテンプレートを使用
  const subject = `【DumDumb】お誕生日おめでとうございます！特別クーポンをお贈りします`;

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
        .birthday-header { text-align: center; font-size: 24px; color: #d53f8c; margin: 20px 0; }
        .coupon-card { border: 2px dashed #d53f8c; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; background-color: #fdf2f8; }
        .coupon-code { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #d53f8c; padding: 10px; }
        .discount { font-size: 20px; font-weight: bold; color: #d53f8c; margin: 10px 0; }
        .expiry { color: #e53e3e; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DumDumb</h1>
        </div>
        
        <div class="birthday-header">
          🎂 お誕生日おめでとうございます！ 🎉
        </div>
        
        <p>${data.userName} 様</p>
        
        <p>お誕生日を心よりお祝い申し上げます。<br>特別な日を祝うために、誕生日限定クーポンをご用意しました。</p>
        
        <div class="coupon-card">
          <h2>お誕生日特別クーポン</h2>
          <p class="discount">${data.discountValue}%オフ</p>
          <p>クーポンコード</p>
          <div class="coupon-code">${data.couponCode}</div>
          <p>${
            data.minimumPurchase
              ? `${data.minimumPurchase.toLocaleString()}円以上のご購入が対象です。`
              : "最低購入金額の条件はありません。"
          }</p>
          <p class="expiry">有効期限: ${data.expiryDate.toLocaleDateString(
            "ja-JP",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}</p>
        </div>
        
        <p>ご利用方法:</p>
        <ol>
          <li>アイテムをカートに入れる</li>
          <li>決済画面でクーポンコードを入力</li>
          <li>「適用」ボタンをクリックして割引を適用</li>
        </ol>
        
        <p>※クーポンのご利用は1回限りとなります。</p>
        <p>※一部アイテムには適用されない場合があります。</p>
        
        <p>素敵なお誕生日をお過ごしください。<br>DumDumbをご利用いただき、誠にありがとうございます。</p>
        
        <div class="footer">
          <p>このメールは配信専用です。ご返信いただいてもお答えできません。</p>
          <p>© 2025 DumDumb All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // テキスト版は省略（htmlContentと同様の内容で作成）

  return sendEmail({
    to: email,
    subject,
    html: htmlContent,
  });
};
