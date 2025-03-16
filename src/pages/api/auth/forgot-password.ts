import { NextApiRequest, NextApiResponse } from 'next';
import { sendPasswordResetEmail } from '@/lib/password-reset';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POSTリクエスト以外は許可しない
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // 必須フィールドのバリデーション
    if (!email) {
      return res.status(400).json({ message: 'メールアドレスは必須です' });
    }

    // メールアドレスの形式検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '有効なメールアドレスを入力してください' });
    }

    // リクエストのホストを取得
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // パスワードリセットメールを送信
    await sendPasswordResetEmail(email, baseUrl);

    // セキュリティ上の理由から、メールが存在しなくても成功レスポンスを返す
    return res.status(200).json({
      message: 'パスワードリセット手順をメールで送信しました（メールが登録されている場合）'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'パスワードリセット処理中にエラーが発生しました' });
  }
}
