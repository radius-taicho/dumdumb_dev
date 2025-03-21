import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    // パスワードの長さチェック
    if (password.length < 8) {
      return res.status(400).json({ message: 'パスワードは8文字以上必要です' });
    }

    // パスワードの複雑性チェック
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const passwordStrength = [hasUpperCase, hasLowerCase, hasDigit].filter(Boolean).length;

    if (passwordStrength < 2) {
      return res.status(400).json({ 
        message: 'パスワードは大文字(A-Z)、小文字(a-z)、数字(0-9)のうち少なくとも2種類を含める必要があります' 
      });
    }

    // 既存のユーザーチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'このメールアドレスは既に使用されています' });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        role: 'USER',
      },
    });

    // 成功レスポンス
    return res.status(201).json({
      message: 'ユーザー登録に成功しました',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: '登録処理中にエラーが発生しました' });
  }
}