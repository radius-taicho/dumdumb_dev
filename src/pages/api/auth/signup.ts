import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma-client';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'メールアドレスとパスワードは必須です' 
      });
    }

    // 既存ユーザーチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'このメールアドレスは既に使用されています' 
      });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー作成（簡略化バージョン）
    try {
      const user = await prisma.user.create({
        data: {
          email,
          hashedPassword,
          role: 'USER',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'ユーザー登録に成功しました',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (createError) {
      console.error('User creation error:', createError);
      return res.status(500).json({ 
        success: false, 
        message: 'ユーザー作成に失敗しました' 
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: '登録処理中にエラーが発生しました' 
    });
  }
}