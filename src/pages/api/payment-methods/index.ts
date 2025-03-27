import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  paymentMethod?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // セッションを取得して認証チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  try {
    const { type, cardNumber, cardHolderName, expiryMonth, expiryYear, isDefault, stripePaymentMethodId } = req.body;

    // 既存のデフォルト支払い方法の処理
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    // 支払い方法をデータベースに保存
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        type,
        cardNumber,
        cardHolderName,
        expiryMonth,
        expiryYear,
        stripePaymentMethodId, // Stripe Payment Method IDを保存
        isDefault,
      },
    });

    return res.status(201).json({ success: true, paymentMethod });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
