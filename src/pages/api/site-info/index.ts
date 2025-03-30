import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GETメソッドのみ許可
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    // サイト情報一覧を取得
    const siteInfoItems = await prisma.siteInfo.findMany({
      where: { isActive: true },
      orderBy: [
        { slideIndex: 'asc' },
        { columnIndex: 'asc' },
        { displayOrder: 'asc' }
      ],
      include: {
        media: {
          select: {
            url: true,
          },
        },
      },
    });
    
    // メディアURLの追加処理
    const formattedItems = siteInfoItems.map(item => ({
      ...item,
      imageUrl: item.media?.url || item.imageUrl,
    }));
    
    return res.status(200).json(formattedItems);
  } catch (error) {
    console.error('サイト情報取得エラー:', error);
    return res.status(500).json({ message: 'サイト情報の取得中にエラーが発生しました' });
  }
}
