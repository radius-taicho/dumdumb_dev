import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { stripe } from '@/lib/stripe/server';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
    const { amount, paymentMethodId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: '有効な金額を指定してください' });
    }

    // Stripe APIキーが設定されているか確認
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY 環境変数が設定されていません');
      return res.status(500).json({ success: false, error: 'Stripe APIの設定が不完全です' });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true }
    });

    // Stripe PaymentIntent作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'jpy',
      payment_method_types: ['card'],
      metadata: {
        userId: session.user.id,
        paymentMethodId: paymentMethodId || ''
      },
      receipt_email: user?.email || undefined,
    });
    
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe PaymentIntent creation error:', error);
    return res.status(500).json({
      success: false,
      error: '決済の初期化中にエラーが発生しました'
    });
  }
}