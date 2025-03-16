import { NextApiRequest, NextApiResponse } from 'next';
import { loginUser, generateToken } from '@/lib/auth';
import { setCookie } from 'cookies-next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POSTリクエスト以外は許可しない
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, rememberMe } = req.body;

    // 必須フィールドのバリデーション
    if (!email || !password) {
      return res.status(400).json({ message: 'メールアドレスとパスワードは必須です' });
    }

    // ユーザーログイン
    const user = await loginUser(email, password);

    // ログイン失敗
    if (!user) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // JWTトークン生成
    const token = generateToken(user);

    // Cookie設定（rememberMeによって有効期限を変える）
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30日 or 1日
    setCookie('auth_token', token, { 
      req, 
      res, 
      maxAge, 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // 成功レスポンス
    return res.status(200).json({
      message: 'ログインに成功しました',
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'ログイン処理中にエラーが発生しました' });
  }
}
