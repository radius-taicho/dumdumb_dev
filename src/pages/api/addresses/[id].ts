import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'ログインが必要です' });
  }

  const userId = session.user.id;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '住所IDが必要です' });
  }

  // PUT: 住所の更新
  if (req.method === 'PUT') {
    const {
      name,
      postalCode,
      prefecture,
      city,
      line1,
      line2,
      phoneNumber,
      isDefault,
    } = req.body;

    // 基本的なバリデーション
    if (!name || !postalCode || !prefecture || !city || !line1 || !phoneNumber) {
      return res.status(400).json({ error: '必須項目が未入力です' });
    }

    try {
      // 更新する住所がユーザーのものか確認
      const address = await prisma.address.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!address) {
        return res.status(404).json({ error: '住所が見つかりません' });
      }

      if (address.userId !== userId) {
        return res.status(403).json({ error: '権限がありません' });
      }

      // もしこの住所がデフォルトとして設定される場合、他のデフォルト住所をリセット
      if (isDefault) {
        await prisma.address.updateMany({
          where: {
            userId,
            isDefault: true,
            id: { not: id },
          },
          data: {
            isDefault: false,
          },
        });
      }

      // 住所を更新
      const updatedAddress = await prisma.address.update({
        where: { id },
        data: {
          name,
          postalCode,
          prefecture,
          city,
          line1,
          line2: line2 || null,
          phoneNumber,
          isDefault: isDefault || false,
        },
      });

      return res.status(200).json(updatedAddress);
    } catch (error) {
      console.error('Error updating address:', error);
      return res.status(500).json({ error: '住所の更新に失敗しました' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
