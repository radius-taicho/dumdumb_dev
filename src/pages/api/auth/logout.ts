import { NextApiRequest, NextApiResponse } from 'next';
import { deleteCookie } from 'cookies-next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POSTリクエスト以外は許可しない
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Cookie削除
    deleteCookie('auth_token', { req, res, path: '/' });

    // 成功レスポンス
    return res.status(200).json({ message: 'ログアウトしました' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'ログアウト処理中にエラーが発生しました' });
  }
}
