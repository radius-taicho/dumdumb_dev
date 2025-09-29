import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma-client';

type Data = {
  success: boolean;
  paymentMethods?: any[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // セッションを取得して認証チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  try {
    // ユーザーの支払い方法を取得
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    // クライアント側で型の比較が正しく行われるよう、型を必ず文字列として返す
    const serializedPaymentMethods = paymentMethods.map(method => ({
      ...method,
      type: String(method.type)
    }));
    
    console.log(`支払い方法一覧を返します: ${serializedPaymentMethods.length}件`);

    return res.status(200).json({ success: true, paymentMethods: serializedPaymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
