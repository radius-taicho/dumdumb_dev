import nodemailer from 'nodemailer';

// メール送信用のトランスポーター設定
// 本番環境では実際のSMTPサーバー情報を使用
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// メール送信機能
export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    // 開発環境では実際にメールを送信せず、コンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.log('Sending email in development mode');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', html);
      return true;
    }

    // 本番環境では実際にメールを送信
    const info = await transporter.sendMail({
      from: `"DumDumb" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// パスワードリセットメールのテンプレート
export const getPasswordResetEmailTemplate = (resetUrl: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">DumDumb - パスワードリセット</h2>
      <p>パスワードリセットのリクエストを受け付けました。</p>
      <p>以下のリンクをクリックして、新しいパスワードを設定してください：</p>
      
      <div style="margin: 20px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          パスワードをリセット
        </a>
      </div>
      
      <p>このリンクは24時間有効です。</p>
      <p>リクエストした覚えがない場合は、このメールを無視してください。</p>
      <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} DumDumb. All rights reserved.</p>
      </div>
    </div>
  `;
};

// 注文確認メールのテンプレート
export const getOrderConfirmationEmailTemplate = (order: any, user: any) => {
  // 商品リストの生成
  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.item?.name || '商品名なし'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.size || '-'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">&#165;${Number(item.price).toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">&#165;${(Number(item.price) * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">DumDumb - ご注文ありがとうございます</h2>
      
      <p>お客様のご注文を承りました。以下がご注文の詳細です。</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p><strong>注文番号:</strong> ${order.id}</p>
        <p><strong>注文日時:</strong> ${new Date(order.createdAt).toLocaleString('ja-JP')}</p>
      </div>
      
      <h3 style="border-bottom: 2px solid #f97316; padding-bottom: 10px;">注文内容</h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">商品名</th>
            <th style="padding: 10px; text-align: center;">サイズ</th>
            <th style="padding: 10px; text-align: right;">価格</th>
            <th style="padding: 10px; text-align: center;">数量</th>
            <th style="padding: 10px; text-align: right;">小計</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px;">小計</td>
            <td style="padding: 5px; text-align: right;">&#165;${Number(order.subtotal).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">送料</td>
            <td style="padding: 5px; text-align: right;">&#165;${Number(order.shippingFee || 0).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>合計</strong></td>
            <td style="padding: 5px; text-align: right;"><strong>&#165;${Number(order.totalAmount).toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>
      
      <h3 style="border-bottom: 2px solid #f97316; padding-bottom: 10px;">お届け先情報</h3>
      <p>${order.address}</p>
      
      <div style="margin-top: 30px; background-color: #fff8f3; padding: 15px; border-radius: 4px;">
        <p>ご注文に関するご不明な点がございましたら、お気軽にお問い合わせください。</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} DumDumb. All rights reserved.</p>
      </div>
    </div>
  `;
};

// 注文確認メール送信機能
export const sendOrderConfirmationEmail = async (order: any, user: any) => {
  const subject = `DumDumb - ご注文確認 [注文番号: ${order.id}]`;
  const html = getOrderConfirmationEmailTemplate(order, user);
  return await sendMail(user.email, subject, html);
};
