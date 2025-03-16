import { NextApiRequest, NextApiResponse } from 'next';
import { validateResetToken } from '@/lib/password-reset';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GETリクエスト以外は許可しない
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    // 必須パラメータのバリデーション
    if (!token || Array.isArray(token)) {
      return res.status(400).json({ message: '無効なトークンです' });
    }

    // トークンを検証
    const isValid = await validateResetToken(token);

    if (!isValid) {
      return res.status(400).json({ message: 'トークンが無効または期限切れです' });
    }

    // 成功レスポンス
    return res.status(200).json({ message: '有効なトークンです' });
  } catch (error) {
    console.error('Validate token error:', error);
    return res.status(500).json({ message: 'トークン検証中にエラーが発生しました' });
  }
}
