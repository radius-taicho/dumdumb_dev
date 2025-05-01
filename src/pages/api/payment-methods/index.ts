import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma-client';

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
    let { type, cardNumber, cardHolderName, expiryMonth, expiryYear, isDefault, stripePaymentMethodId } = req.body;
    
    console.log('受信した支払い方法データ:', { type, isDefault, hasCardInfo: !!cardNumber });
    
    // 支払い方法タイプの正規化 - 大文字に統一
    if (typeof type === 'string') {
      const upperType = type.toUpperCase();
      
      if (upperType === 'CREDIT_CARD') {
        type = 'CREDIT_CARD';
      } else if (upperType === 'AMAZON_PAY') {
        type = 'AMAZON_PAY';
      } else if (upperType === 'OTHER') {
        type = 'OTHER';
      } else {
        // 不明なタイプの場合はデフォルト値を設定
        console.warn('不明な支払い方法タイプ:', type);
        type = 'OTHER';
      }
    } else {
      // typeが文字列でない場合、デフォルト値を設定
      console.warn('支払い方法タイプが無効です:', type);
      type = 'OTHER';
    }
    
    console.log('正規化後の支払い方法タイプ:', type);

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
    
    console.log('新しい支払い方法が作成されました:', { id: paymentMethod.id, type: paymentMethod.type });

    return res.status(201).json({ 
      success: true, 
      paymentMethod: {
        ...paymentMethod,
        // クライアント側での型変換問題を避けるため、型を文字列として明示的に返す
        type: String(paymentMethod.type)
      } 
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
