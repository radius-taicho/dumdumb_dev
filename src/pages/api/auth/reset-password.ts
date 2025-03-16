import { NextApiRequest, NextApiResponse } from 'next';
import { resetPasswordWithToken } from '@/lib/password-reset';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POSTリクエスト以外は許可しない
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, password, confirmPassword } = req.body;

    // 必須フィールドのバリデーション
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'すべての項目を入力してください' });
    }

    // パスワード一致の確認
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'パスワードが一致しません' });
    }

    // パスワードの長さチェック
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

    // パスワードをリセット
    const success = await resetPasswordWithToken(token, password);

    if (!success) {
      return res.status(400).json({ message: 'パスワードのリセットに失敗しました。トークンが無効または期限切れの可能性があります。' });
    }

    // 成功レスポンス
    return res.status(200).json({ message: 'パスワードが正常にリセットされました。新しいパスワードでログインしてください。' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'パスワードリセット処理中にエラーが発生しました' });
  }
}
