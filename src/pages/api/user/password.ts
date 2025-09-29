import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

type Data = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // セッションを取得して認証チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: '現在のパスワードと新しいパスワードは必須です' });
    }

    // 最小パスワード長のチェック
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'パスワードは8文字以上で設定してください' });
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        hashedPassword: true,
      },
    });

    if (!user || !user.hashedPassword) {
      return res.status(404).json({ success: false, error: 'ユーザーが見つかりません' });
    }

    // 現在のパスワードを検証
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, error: '現在のパスワードが正しくありません' });
    }

    // 新しいパスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // パスワードを更新
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        hashedPassword,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
