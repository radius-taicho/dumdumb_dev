import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // セッションを取得して認証チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { paymentMethodId } = req.body;

  if (!paymentMethodId) {
    return res.status(400).json({ success: false, message: 'Payment Method ID is required' });
  }

  try {
    // 指定された支払い方法が認証されたユーザーのものか確認
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { 
        id: paymentMethodId,
      },
    });

    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    if (paymentMethod.userId !== session.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this payment method' });
    }

    // この支払い方法がデフォルトかチェック
    if (paymentMethod.isDefault) {
      // ユーザーの他の支払い方法を取得
      const otherPaymentMethods = await prisma.paymentMethod.findMany({
        where: {
          userId: session.user.id,
          id: {
            not: paymentMethodId
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // 他に支払い方法がある場合は最も古いものを新しいデフォルトに設定
      if (otherPaymentMethods.length > 0) {
        await prisma.paymentMethod.update({
          where: { id: otherPaymentMethods[0].id },
          data: { isDefault: true }
        });
      }
    }

    // 支払い方法を削除
    await prisma.paymentMethod.delete({
      where: { id: paymentMethodId }
    });

    return res.status(200).json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
