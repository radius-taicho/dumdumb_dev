import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // アクティブなユーザーアイコンのみを取得
    const userIcons = await prisma.userIcon.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { isDefault: 'desc' }, // デフォルトアイコンを先頭に
        { displayOrder: 'asc' }
      ],
      include: {
        media: {
          select: {
            url: true,
            width: true,
            height: true
          }
        }
      }
    });

    // デフォルトアイコンを見つける
    const defaultIcon = userIcons.find(icon => icon.isDefault);

    // フロントエンド用のデータ構造に変換
    const formattedIcons = userIcons.map(icon => ({
      id: icon.id,
      name: icon.name,
      url: icon.media.url,
      width: icon.media.width || 200,
      height: icon.media.height || 200,
      isDefault: icon.isDefault
    }));

    return res.status(200).json({ 
      icons: formattedIcons,
      defaultIcon: defaultIcon ? {
        id: defaultIcon.id,
        name: defaultIcon.name,
        url: defaultIcon.media.url
      } : null,
      defaultIconUrl: defaultIcon ? defaultIcon.media.url : null
    });
  } catch (error) {
    console.error('Error fetching user icons:', error);
    return res.status(500).json({ error: 'ユーザーアイコンの取得に失敗しました' });
  }
}
