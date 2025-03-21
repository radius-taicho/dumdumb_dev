import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GETリクエスト以外は許可しない
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // NextAuthのセッションを取得
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: '認証されていません' });
    }

    // ユーザー情報の取得（必要に応じて追加情報を取得）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

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