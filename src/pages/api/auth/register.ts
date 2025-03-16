import { NextApiRequest, NextApiResponse } from 'next';
import { registerUser, generateToken } from '@/lib/auth';
import { setCookie } from 'cookies-next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POSTリクエスト以外は許可しない
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // 必須フィールドのバリデーション
    if (!email || !password) {
      return res.status(400).json({ message: 'メールアドレスとパスワードは必須です' });
    }

    // パスワードの詳細なバリデーション
    if (password.length < 8) {
      return res.status(400).json({ message: 'パスワードは8文字以上必要です' });
    }

    // パスワードの複雑性チェック
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const passwordStrength = [hasUpperCase, hasLowerCase, hasDigit, hasSpecialChar].filter(Boolean).length;

    if (passwordStrength < 3) {
      return res.status(400).json({ 
        message: 'パスワードは大文字、小文字、数字、記号のうち少なくとも3種類を含める必要があります' 
      });
    }

    // ユーザー登録
    const user = await registerUser(email, password);

    // 登録失敗（メールアドレス重複など）
    if (!user) {
      return res.status(409).json({ message: 'このメールアドレスは既に使用されています' });
    }

    // JWTトークン生成
    const token = generateToken(user);

    // Cookie設定
    setCookie('auth_token', token, { 
      req, 
      res, 
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict'
    });

    // 成功レスポンス
    return res.status(201).json({
      message: 'ユーザー登録に成功しました',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: '登録処理中にエラーが発生しました' });
  }
}
