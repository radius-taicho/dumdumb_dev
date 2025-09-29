import sendgrid from '@sendgrid/mail';

// SendGridのAPIキーを設定
const apiKey = process.env.SENDGRID_API_KEY || '';
sendgrid.setApiKey(apiKey);

/**
 * お問い合わせ自動返信メールを送信する
 * @param to 宛先メールアドレス
 * @param name 宛先名
 * @param subject お問い合わせの件名
 */
export async function sendContactConfirmationEmail(
  to: string,
  name: string,
  subject: string
): Promise<void> {
  const msg = {
    to,
    from: process.env.MAIL_FROM || 'support@dumdumb.co.jp',
    subject: '【dumdumb】お問い合わせを受け付けました',
    text: `
${name} 様

この度はdumdumbへお問い合わせいただき、誠にありがとうございます。
下記の内容でお問い合わせを受け付けました。

■お問い合わせ内容
件名: ${subject}

担当者が内容を確認次第、改めてご連絡いたします。
通常、お問い合わせから1～2営業日以内にご返信いたしますが、
内容によっては回答までにお時間をいただく場合がございます。

なお、このメールは自動返信メールとなっております。
このメールへの返信はお控えくださいますようお願いいたします。

※営業時間：平日10:00～18:00（土日祝日・年末年始を除く）

---------------------------------------------------------------------------
株式会社dumdumb カスタマーサポート
TEL: 03-1234-5678
Email: support@dumdumb.co.jp
WEB: https://dumdumb.co.jp
---------------------------------------------------------------------------
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お問い合わせを受け付けました</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 20px; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
    .note { background-color: #fffde7; padding: 10px; border-left: 4px solid #ffd600; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h2>お問い合わせを受け付けました</h2>
  </div>
  
  <div class="content">
    <p>${name} 様</p>
    
    <p>この度はdumdumbへお問い合わせいただき、誠にありがとうございます。<br>
    下記の内容でお問い合わせを受け付けました。</p>
    
    <p><strong>■お問い合わせ内容</strong><br>
    件名: ${subject}</p>
    
    <p>担当者が内容を確認次第、改めてご連絡いたします。<br>
    通常、お問い合わせから1～2営業日以内にご返信いたしますが、<br>
    内容によっては回答までにお時間をいただく場合がございます。</p>
    
    <div class="note">
      <p>なお、このメールは自動返信メールとなっております。<br>
      このメールへの返信はお控えくださいますようお願いいたします。</p>
    </div>
    
    <p>※営業時間：平日10:00～18:00（土日祝日・年末年始を除く）</p>
  </div>
  
  <div class="footer">
    <p>
      株式会社dumdumb カスタマーサポート<br>
      TEL: 03-1234-5678<br>
      Email: support@dumdumb.co.jp<br>
      WEB: <a href="https://dumdumb.co.jp">https://dumdumb.co.jp</a>
    </p>
  </div>
</body>
</html>
    `,
  };

  try {
    await sendgrid.send(msg);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
}

/**
 * お問い合わせの回答メールを送信する
 * @param to 宛先メールアドレス
 * @param name 宛先名
 * @param subject メールの件名
 * @param message メールの本文
 * @param contactId お問い合わせID
 */
export async function sendContactResponseEmail(
  to: string,
  name: string,
  subject: string,
  message: string,
  contactId: string
): Promise<void> {
  const msg = {
    to,
    from: process.env.MAIL_FROM || 'support@dumdumb.co.jp',
    subject: `【dumdumb】${subject}`,
    text: `
${name} 様

この度はdumdumbへお問い合わせいただき、誠にありがとうございます。
お問い合わせの件について、以下のご回答をお送りいたします。

------------------------------
${message}
------------------------------

ご不明な点がございましたら、お気軽にご返信ください。
※お問い合わせID: ${contactId}

---------------------------------------------------------------------------
株式会社dumdumb カスタマーサポート
TEL: 03-1234-5678
Email: support@dumdumb.co.jp
WEB: https://dumdumb.co.jp
---------------------------------------------------------------------------
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 20px; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
    .message { background-color: #fff; padding: 15px; border: 1px solid #eee; border-radius: 5px; margin: 15px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
    .contact-id { font-size: 11px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${subject}</h2>
  </div>
  
  <div class="content">
    <p>${name} 様</p>
    
    <p>この度はdumdumbへお問い合わせいただき、誠にありがとうございます。<br>
    お問い合わせの件について、以下のご回答をお送りいたします。</p>
    
    <div class="message">
      ${message.replace(/\n/g, '<br>')}
    </div>
    
    <p>ご不明な点がございましたら、お気軽にご返信ください。</p>
    <p class="contact-id">※お問い合わせID: ${contactId}</p>
  </div>
  
  <div class="footer">
    <p>
      株式会社dumdumb カスタマーサポート<br>
      TEL: 03-1234-5678<br>
      Email: support@dumdumb.co.jp<br>
      WEB: <a href="https://dumdumb.co.jp">https://dumdumb.co.jp</a>
    </p>
  </div>
</body>
</html>
    `,
  };

  try {
    await sendgrid.send(msg);
  } catch (error) {
    console.error('Failed to send response email:', error);
    throw error;
  }
}
