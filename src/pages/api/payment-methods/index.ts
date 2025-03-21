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

  // GET: ユーザーの支払い方法を取得
  if (req.method === 'GET') {
    try {
      const paymentMethods = await prisma.paymentMethod.findMany({
        where: {
          userId,
        },
        orderBy: {
          isDefault: 'desc',
        },
      });

      return res.status(200).json(paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return res.status(500).json({ error: '支払い方法の取得に失敗しました' });
    }
  }

  // POST: 新しい支払い方法を追加
  if (req.method === 'POST') {
    const {
      type,
      cardNumber,
      cardHolderName,
      expiryMonth,
      expiryYear,
      isDefault,
    } = req.body;

    // 基本的なバリデーション
    if (type === 'CREDIT_CARD') {
      if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear) {
        return res.status(400).json({ error: '必須項目が未入力です' });
      }
    }

    try {
      // もしこの支払い方法がデフォルトとして設定される場合、他のデフォルト支払い方法をリセット
      if (isDefault) {
        await prisma.paymentMethod.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // 新しい支払い方法を作成
      const newPaymentMethod = await prisma.paymentMethod.create({
        data: {
          userId,
          type,
          // クレジットカード情報は実際には安全に保存する必要があります
          // 実運用では決済代行サービスのトークンなどを使用することを推奨
          cardNumber: cardNumber ? `xxxx-xxxx-xxxx-${cardNumber.slice(-4)}` : null,
          cardHolderName: cardHolderName || null,
          expiryMonth: expiryMonth || null,
          expiryYear: expiryYear || null,
          isDefault: isDefault || false,
        },
      });

      return res.status(201).json(newPaymentMethod);
    } catch (error) {
      console.error('Error creating payment method:', error);
      return res.status(500).json({ error: '支払い方法の追加に失敗しました' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
