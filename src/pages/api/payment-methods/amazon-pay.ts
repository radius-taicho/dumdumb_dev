import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

// 注意: これは実際のAmazon Pay統合ではなく、概念的な実装例です
// 実際にはAmazon Payの公式SDKと適切な認証フローを使用する必要があります

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'ログインが必要です' });
  }

  const userId = session.user.id;

  if (req.method === 'POST') {
    try {
      // 実際のAmazon Pay統合では、ここでAmazonからのトークンを検証し、
      // 支払い情報と配送先情報を取得します

      // 仮のデータ
      const { amazonOrderReferenceId } = req.body;

      if (!amazonOrderReferenceId) {
        return res.status(400).json({ error: 'Amazon注文参照IDが必要です' });
      }

      // 模擬的にAmazonから取得した情報
      const amazonPaymentData = {
        paymentMethodType: 'AMAZON_PAY',
        amazonOrderReferenceId,
        // 実際には追加の詳細情報がここに含まれます
      };

      const amazonAddressData = {
        name: 'Amazon経由の配送先',
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '渋谷区',
        line1: '代々木1-2-3',
        line2: 'アパート101',
        phoneNumber: '03-1234-5678',
        // これもAmazonから取得した情報になります
      };

      // 新しい支払い方法を登録
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          userId,
          type: 'AMAZON_PAY',
          amazonPayId: amazonOrderReferenceId,
          isDefault: true, // Amazon Payを選択した場合はデフォルトにする
        },
      });

      // デフォルトの支払い方法を更新
      await prisma.paymentMethod.updateMany({
        where: {
          userId,
          id: { not: paymentMethod.id },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      // 新しい住所を登録
      const address = await prisma.address.create({
        data: {
          userId,
          ...amazonAddressData,
          isDefault: true, // Amazon Payを選択した場合は配送先もデフォルトにする
        },
      });

      // デフォルトの住所を更新
      await prisma.address.updateMany({
        where: {
          userId,
          id: { not: address.id },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      return res.status(200).json({
        success: true,
        paymentMethod,
        address,
      });
    } catch (error) {
      console.error('Error processing Amazon Pay:', error);
      return res.status(500).json({ error: 'Amazon Payの処理中にエラーが発生しました' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
