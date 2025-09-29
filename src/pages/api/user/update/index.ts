import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  user?: any;
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
    const { name, image } = req.body;
    
    // 入力データの希望値をログ出力
    console.log('API received update data - name:', name, 'image:', image);
    
    // 現在のユーザー情報を取得
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true }
    });
    
    console.log('Current user data in DB:', currentUser);
    
    const updateData: any = {};
    
    // nameの処理（空文字列も含む）
    if (name !== undefined) {
      // 空白を取り除いて、空白のみの場合は空文字列にする
      updateData.name = typeof name === 'string' ? name.trim() : name;
      console.log('Setting name to:', updateData.name);
    }
    
    // imageの処理
    if (image !== undefined) {
      updateData.image = image;
      console.log('Setting image to:', updateData.image);
    }
    
    // 更新データが空ならエラー
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'No update data provided' });
    }

    // ユーザー情報を更新
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });

    // 更新後のユーザー情報をログ出力
    console.log('Updated user data:', updatedUser);
    
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
