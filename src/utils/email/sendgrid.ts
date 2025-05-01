// ダミーの型定義（実際のSendGridクライアントに合わせて変更してください）
interface EmailTemplate {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * SendGridを使用してメールを送信する関数
 * 注意: この関数は開発環境ではダミー実装として使用し、実際の送信処理はコメントアウトしています
 */
export async function sendEmail(template: EmailTemplate): Promise<void> {
  try {
    // 開発環境ではメール送信をシミュレートするだけ
    console.log('Email would be sent:', template);

    // 実際の環境では、以下のようなコードでSendGridを使用してメールを送信します
    /*
    import sgMail from '@sendgrid/mail';
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    await sgMail.send(template);
    */

    return Promise.resolve();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * メールアドレスの有効性を簡易的にチェックする関数
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
