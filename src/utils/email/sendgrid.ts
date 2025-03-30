import sgMail from '@sendgrid/mail';

// SendGridのAPIキーを設定
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

type EmailData = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * SendGridを使用してメールを送信する
 */
export async function sendEmail({ to, subject, text, html }: EmailData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.info('SendGrid API Keyが設定されていません。メール送信をスキップします。');
    console.info('送信予定だったメール:', { to, subject });
    return true; // APIキーがなくても成功として処理
  }

  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@dumdumb.com',
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('メール送信エラー:', error);
    return false;
  }
}

/**
 * 再入荷通知メールを送信する
 */
export async function sendRestockNotificationEmail(
  to: string,
  itemName: string,
  itemSize: string,
  itemUrl: string
): Promise<boolean> {
  const subject = `【dumdumb】${itemName} ${itemSize}サイズが再入荷しました`;
  
  const text = `
${itemName} ${itemSize}サイズが再入荷しました。

お気に入りに登録していた商品が入荷されましたのでお知らせします。
以下のリンクから商品ページにアクセスできます。

${itemUrl}

※このメールは配信専用です。ご返信いただいてもお答えできません。
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f8f8; padding: 15px; border-bottom: 2px solid #ddd; }
    .content { padding: 20px 0; }
    .button { display: inline-block; padding: 10px 20px; background-color: #ff6600; color: white; text-decoration: none; border-radius: 4px; }
    .footer { font-size: 12px; color: #999; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>dumdumb 再入荷のお知らせ</h2>
    </div>
    <div class="content">
      <p>お気に入りに登録していた商品が入荷されましたのでお知らせします。</p>
      <h3>${itemName}</h3>
      <p><strong>サイズ:</strong> ${itemSize}</p>
      <p>
        <a href="${itemUrl}" class="button">商品を見る</a>
      </p>
      <p>※商品は在庫がなくなり次第、販売終了となります。お早めにご検討ください。</p>
    </div>
    <div class="footer">
      <p>※このメールは配信専用です。ご返信いただいてもお答えできません。</p>
      <p>通知設定を変更するには、<a href="${process.env.NEXT_PUBLIC_BASE_URL}/mypage/notificationsManagement">通知管理ページ</a>にアクセスしてください。</p>
      <p>&copy; ${new Date().getFullYear()} dumdumb All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({ to, subject, text, html });
}

/**
 * シリーズの新着通知メールを送信する
 */
export async function sendNewSeriesItemNotificationEmail(
  to: string,
  seriesName: string,
  itemName: string,
  itemUrl: string
): Promise<boolean> {
  const subject = `【dumdumb】${seriesName}の新商品が入荷されました`;
  
  const text = `
${seriesName}の新商品「${itemName}」が入荷されました。

購読登録しているシリーズに新商品が追加されましたのでお知らせします。
以下のリンクから商品ページにアクセスできます。

${itemUrl}

※このメールは配信専用です。ご返信いただいてもお答えできません。
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f8f8; padding: 15px; border-bottom: 2px solid #ddd; }
    .content { padding: 20px 0; }
    .button { display: inline-block; padding: 10px 20px; background-color: #ff6600; color: white; text-decoration: none; border-radius: 4px; }
    .footer { font-size: 12px; color: #999; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>dumdumb 新商品のお知らせ</h2>
    </div>
    <div class="content">
      <p>購読登録している<strong>${seriesName}</strong>に新商品が追加されましたのでお知らせします。</p>
      <h3>${itemName}</h3>
      <p>
        <a href="${itemUrl}" class="button">商品を見る</a>
      </p>
    </div>
    <div class="footer">
      <p>※このメールは配信専用です。ご返信いただいてもお答えできません。</p>
      <p>通知設定を変更するには、<a href="${process.env.NEXT_PUBLIC_BASE_URL}/mypage/notificationsManagement">通知管理ページ</a>にアクセスしてください。</p>
      <p>&copy; ${new Date().getFullYear()} dumdumb All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({ to, subject, text, html });
}
