import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // セッションからユーザー情報を取得（認証済みのみアクセス可能）
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: '認証が必要です' });
  }

  const userId = session.user.id;

  // GETメソッド：ユーザーの要望一覧を取得
  if (req.method === 'GET') {
    try {
      // ユーザーの要望を取得（新しい順）
      const requests = await prisma.userRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ success: true, requests });
    } catch (error) {
      console.error('Error fetching user requests:', error);
      return res.status(500).json({ success: false, message: '要望の取得中にエラーが発生しました' });
    }
  }

  // POSTメソッド：新しい要望を作成
  if (req.method === 'POST') {
    try {
      const { type, title, description } = req.body;

      // バリデーション
      if (!type || !title || !description) {
        return res.status(400).json({ success: false, message: '種類、タイトル、詳細は必須項目です' });
      }

      // 要望を作成
      const newRequest = await prisma.userRequest.create({
        data: {
          userId,
          type,
          title,
          description,
          status: 'pending', // 初期ステータスは「受付中」
        },
      });

      return res.status(201).json({ success: true, request: newRequest });
    } catch (error) {
      console.error('Error creating request:', error);
      return res.status(500).json({ success: false, message: '要望の作成中にエラーが発生しました' });
    }
  }

  // その他のメソッドは許可しない
  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
