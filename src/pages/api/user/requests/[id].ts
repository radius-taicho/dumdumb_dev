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
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, message: '有効なIDが必要です' });
  }

  // GETメソッド：特定の要望詳細を取得
  if (req.method === 'GET') {
    try {
      // ユーザーの要望を取得
      const request = await prisma.userRequest.findFirst({
        where: {
          id,
          userId, // 自分の要望のみアクセス可能
        },
      });

      if (!request) {
        return res.status(404).json({ success: false, message: '要望が見つかりません' });
      }

      return res.status(200).json({ success: true, request });
    } catch (error) {
      console.error('Error fetching user request:', error);
      return res.status(500).json({ success: false, message: '要望の取得中にエラーが発生しました' });
    }
  }

  // PUTメソッド：要望を更新（ステータスが「受付中」の場合のみ編集可能）
  if (req.method === 'PUT') {
    try {
      // まず要望を取得して編集可能か確認
      const existingRequest = await prisma.userRequest.findFirst({
        where: {
          id,
          userId, // 自分の要望のみ
        },
      });

      if (!existingRequest) {
        return res.status(404).json({ success: false, message: '要望が見つかりません' });
      }

      // 「受付中」の場合のみ編集可能
      if (existingRequest.status !== 'pending') {
        return res.status(403).json({ 
          success: false, 
          message: '処理が開始された要望は編集できません' 
        });
      }

      const { title, description, type } = req.body;

      // バリデーション
      if (!title || !description || !type) {
        return res.status(400).json({ success: false, message: '種類、タイトル、詳細は必須項目です' });
      }

      // 要望を更新
      const updatedRequest = await prisma.userRequest.update({
        where: { id },
        data: {
          title,
          description,
          type,
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({ success: true, request: updatedRequest });
    } catch (error) {
      console.error('Error updating request:', error);
      return res.status(500).json({ success: false, message: '要望の更新中にエラーが発生しました' });
    }
  }

  // DELETEメソッド：要望をキャンセル（ステータスが「受付中」の場合のみ）
  if (req.method === 'DELETE') {
    try {
      // まず要望を取得して削除可能か確認
      const existingRequest = await prisma.userRequest.findFirst({
        where: {
          id,
          userId, // 自分の要望のみ
        },
      });

      if (!existingRequest) {
        return res.status(404).json({ success: false, message: '要望が見つかりません' });
      }

      // 「受付中」の場合のみキャンセル可能
      if (existingRequest.status !== 'pending') {
        return res.status(403).json({ 
          success: false, 
          message: '処理が開始された要望はキャンセルできません' 
        });
      }

      // 要望を削除
      await prisma.userRequest.delete({
        where: { id },
      });

      return res.status(200).json({ success: true, message: '要望をキャンセルしました' });
    } catch (error) {
      console.error('Error cancelling request:', error);
      return res.status(500).json({ success: false, message: '要望のキャンセル中にエラーが発生しました' });
    }
  }

  // その他のメソッドは許可しない
  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
