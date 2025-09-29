import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { ContactResponse } from '@/types/contact';

// Prismaクライアントをシングルトンとして初期化
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse | { error: string }>
) {
  // GETリクエストのみを処理
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  // パラメータからIDを取得
  const { id, email } = req.query;

  if (!id || !email || typeof id !== 'string' || typeof email !== 'string') {
    return res.status(400).json({
      error: 'Missing required parameters: id and email',
    });
  }

  try {
    // お問い合わせを検索
    const contact = await prisma.contact.findFirst({
      where: {
        id,
        email,
      },
      include: {
        response: true,
      },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
        error: '指定されたお問い合わせが見つかりませんでした。IDとメールアドレスをご確認ください。',
      });
    }

    // レスポンスデータを整形
    return res.status(200).json({
      success: true,
      message: 'お問い合わせ情報を取得しました',
      contactId: contact.id,
      data: {
        status: contact.status,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        hasResponse: !!contact.response,
        responseDate: contact.response?.respondedAt || null,
      },
    });

  } catch (error) {
    console.error('Contact status error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'サーバーエラーが発生しました。時間をおいて再度お試しください。',
    });
  }
}
