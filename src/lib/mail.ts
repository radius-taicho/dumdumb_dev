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
