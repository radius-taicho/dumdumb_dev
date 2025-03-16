import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import { verifyToken, getUserById } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GETリクエスト以外は許可しない
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // トークンの取得
    const token = getCookie('auth_token', { req, res }) as string | undefined;

    if (!token) {
      return res.status(401).json({ message: '認証されていません' });
    }

    // トークンの検証
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: '無効なトークンです' });
    }

    // ユーザー情報の取得
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    // 成功レスポンス
    return res.status(200).json({ user });
  } catch (error) {
    console.error('User info error:', error);
    return res.status(500).json({ message: 'ユーザー情報の取得中にエラーが発生しました' });
  }
}
