import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 表示状態がtrueかつ表示順でソートされたスライダー画像を取得
    const sliderImages = await prisma.sliderImage.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        media: true,
      },
    });

    // レスポンス用に整形
    const formattedImages = sliderImages.map(image => ({
      id: image.id,
      title: image.title,
      alt: image.alt,
      url: image.url || image.media?.url,
      link: image.link,
    }));

    return res.status(200).json(formattedImages);
  } catch (error) {
    console.error('Error fetching slider images:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
