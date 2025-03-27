import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { getAmazonAddress, getAmazonPaymentMethod } from '@/lib/amazon-pay/amazonPayClient';

type ResponseData = {
  success: boolean;
  address?: any;
  paymentMethod?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
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
    const userId = session.user.id;
    const { amazonOrderReferenceId, billingAgreementId } = req.body;

    if (!amazonOrderReferenceId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amazon注文リファレンスIDが必要です' 
      });
    }

    // 実際にはここでAmazon Pay APIを呼び出して情報を取得
    // このサンプルではモックデータを使用
    
    // Amazonからの住所情報を取得
    const amazonAddress = await getAmazonAddress(amazonOrderReferenceId);
    
    // 住所をデータベースに保存
    const address = await prisma.address.create({
      data: {
        userId,
        name: amazonAddress.name,
        postalCode: amazonAddress.postalCode,
        prefecture: amazonAddress.prefecture,
        city: amazonAddress.city,
        line1: amazonAddress.line1,
        line2: amazonAddress.line2,
        phoneNumber: amazonAddress.phoneNumber,
        isDefault: false, // 既存のデフォルト設定を変更しない
      },
    });

    // Amazonの支払い方法情報を取得
    const amazonPayment = await getAmazonPaymentMethod(billingAgreementId || amazonOrderReferenceId);
    
    // 支払い方法をデータベースに保存
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type: 'AmazonPay',
        amazonPayId: amazonPayment.amazonPayId,
        isDefault: false, // 既存のデフォルト設定を変更しない
      },
    });

    return res.status(200).json({
      success: true,
      address,
      paymentMethod,
    });
  } catch (error) {
    console.error('Amazon Pay処理エラー:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Amazon Pay処理中にエラーが発生しました' 
    });
  }
}
