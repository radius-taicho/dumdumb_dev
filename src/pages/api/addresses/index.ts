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

  // GET: ユーザーの住所情報を取得
  if (req.method === 'GET') {
    try {
      const addresses = await prisma.address.findMany({
        where: {
          userId,
        },
        orderBy: {
          isDefault: 'desc',
        },
      });

      return res.status(200).json(addresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return res.status(500).json({ error: '住所情報の取得に失敗しました' });
    }
  }

  // POST: 新しい住所を追加
  if (req.method === 'POST') {
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
      console.log('Creating address with data:', {
        userId,
        name,
        postalCode,
        prefecture,
        city,
        line1,
        line2: line2 || null,
        phoneNumber,
        isDefault
      });
      
      // もしこの住所がデフォルトとして設定される場合、他のデフォルト住所をリセット
      if (isDefault) {
        await prisma.address.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // 新しい住所を作成
      const newAddress = await prisma.address.create({
        data: {
          userId,
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

      return res.status(201).json(newAddress);
    } catch (error) {
      console.error('Error creating address:', error);
      
      // エラーの詳細情報をログに出力
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if ('code' in error) {
          console.error('Error code:', (error as any).code);
        }
      }
      
      // クライアントに返すエラーメッセージ
      const errorMessage = error instanceof Error ? `住所の追加に失敗しました: ${error.message}` : '住所の追加に失敗しました';
      return res.status(500).json({ error: errorMessage });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
