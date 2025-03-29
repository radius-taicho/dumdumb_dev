import sgMail from '@sendgrid/mail';

// SendGrid APIキーの設定
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SendGrid API Key is not set. Email functionality will be limited to development mode.');
}

export type EmailData = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

/**
 * SendGridを使用してメールを送信する関数
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  // 開発環境ではメールを実際に送信せず、コンソールにログ出力
  if (process.env.NODE_ENV === 'development') {
    console.log('===== DEVELOPMENT EMAIL =====');
    console.log(`To: ${Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    console.log('HTML Content:');
    console.log(emailData.html);
    console.log('===== END EMAIL =====');
    return true;
  }

  // SendGrid APIキーが設定されていない場合
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key is not set');
    return false;
  }

  // 送信元メールアドレスが設定されていない場合
  const fromEmail = emailData.from || process.env.EMAIL_FROM;
  if (!fromEmail) {
    console.error('Sender email address is not set');
    return false;
  }

  try {
    const msg = {
      to: emailData.to,
      from: fromEmail,
      subject: emailData.subject,
      text: emailData.text || '',
      html: emailData.html,
      replyTo: emailData.replyTo || fromEmail,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${typeof emailData.to === 'string' ? emailData.to : 'multiple recipients'}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid API error response:', error.response.body);
    }
    return false;
  }
}

/**
 * SendGridで送信するメールをカスタマイズするヘルパー関数
 */
export function createEmailTemplate(content: string, appName: string = 'DumDumb'): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${appName}</title>
      <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; line-height: 1.5; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { padding: 20px 0; text-align: center; }
        .content { background-color: #ffffff; padding: 20px; border-radius: 4px; }
        .footer { padding: 20px 0; text-align: center; font-size: 12px; color: #666666; }
      </style>
    </head>
    <body style="background-color: #f7f7f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; color: #333333;">
      <div class="container">
        <div class="header">
          <h1 style="color: #f97316; margin: 0;">${appName}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
