import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/server';

type Data = {
  success: boolean;
  order?: any;
  error?: string;
  clientSecret?: string;
  requiresAction?: boolean;
  paymentIntentId?: string;
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
    const { 
      addressId, 
      paymentMethodId, 
      deliveryDate, 
      deliveryTimeSlot, 
      items, 
      subtotal,
      shippingFee,
      tax,
      total
    } = req.body;

    // 必須フィールドのバリデーション
    if (!addressId) {
      return res.status(400).json({ success: false, error: 'お届け先が選択されていません' });
    }

    if (!paymentMethodId) {
      return res.status(400).json({ success: false, error: '支払い方法が選択されていません' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: '商品情報が見つかりません' });
    }

    // 支払い方法を取得
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId }
    });

    if (!paymentMethod) {
      return res.status(400).json({ success: false, error: '支払い方法が見つかりません' });
    }

    // 住所を取得
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address) {
      return res.status(400).json({ success: false, error: 'お届け先が見つかりません' });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true }
    });

    // 支払い処理（決済方法によって異なる）
    if (paymentMethod.type === 'CREDIT_CARD' && paymentMethod.stripePaymentMethodId) {
      // Stripeでの決済処理
      try {
        // JPYは小数点を持たない通貨なので、整数に変換
        const amountInYen = Math.round(total);

        // アプリのドメイン（環境変数から取得するか、デフォルト値を使用）
        const appDomain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        // PaymentIntentの作成時にリダイレクトを許可しない設定を追加
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInYen,
          currency: 'jpy',
          payment_method: paymentMethod.stripePaymentMethodId,
          confirm: true,
          return_url: `${appDomain}/checkout/complete`,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
          },
          metadata: {
            userId: session.user.id,
            addressId: addressId,
            orderType: 'ecommerce'
          },
          receipt_email: user?.email || undefined,
        });

        // 決済ステータスに応じた処理
        if (paymentIntent.status === 'succeeded') {
          // 支払い成功の場合、注文を作成
          const order = await createOrder(
            session.user.id,
            address,
            items,
            total,
            paymentIntent.id
          );

          // カートをクリア
          await clearCart(session.user.id);

          return res.status(201).json({
            success: true,
            order,
          });
        } else if (paymentIntent.status === 'requires_action') {
          // 追加認証が必要な場合
          return res.status(200).json({
            success: true,
            requiresAction: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
          });
        } else {
          // その他の状態（処理中、失敗など）
          return res.status(400).json({
            success: false,
            error: `決済処理に失敗しました: ${paymentIntent.status}`
          });
        }
      } catch (stripeError) {
        console.error('Stripe決済エラー:', stripeError);
        const errorMessage = stripeError.message || 'クレジットカード決済に失敗しました。カード情報をご確認ください。';
        return res.status(400).json({ 
          success: false, 
          error: errorMessage
        });
      }
    } else if (paymentMethod.type === 'AmazonPay' && paymentMethod.amazonPayId) {
      // Amazon Pay処理（将来的な実装用）
      console.log('Amazon Pay処理: ', paymentMethod.amazonPayId);
      
      // 注文データを作成
      const order = await createOrder(
        session.user.id,
        address,
        items,
        total,
        `amazon_pay_${paymentMethod.amazonPayId}`
      );

      // カートをクリア
      await clearCart(session.user.id);

      return res.status(201).json({ success: true, order });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: '対応していない支払い方法です' 
      });
    }
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ success: false, error: '注文処理中にエラーが発生しました' });
  }
}

// 注文データを作成する関数
async function createOrder(userId, address, items, total, paymentReferenceId) {
  return await prisma.order.create({
    data: {
      userId: userId,
      totalAmount: total,
      paymentReferenceId: paymentReferenceId,
      address: `${address.postalCode} ${address.prefecture}${address.city}${address.line1} ${address.line2 || ''} ${address.name}`,
      items: {
        create: items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}

// カートをクリアする関数
async function clearCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId: userId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}