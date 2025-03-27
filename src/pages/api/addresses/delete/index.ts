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

  const { addressId } = req.body;

  if (!addressId) {
    return res.status(400).json({ success: false, message: 'Address ID is required' });
  }

  try {
    // 指定されたアドレスが認証されたユーザーのものか確認
    const address = await prisma.address.findUnique({
      where: { 
        id: addressId,
      },
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.userId !== session.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this address' });
    }

    // このアドレスがデフォルトかチェック
    if (address.isDefault) {
      // ユーザーの他のアドレスを取得
      const otherAddresses = await prisma.address.findMany({
        where: {
          userId: session.user.id,
          id: {
            not: addressId
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // 他にアドレスがある場合は最も古いものを新しいデフォルトに設定
      if (otherAddresses.length > 0) {
        await prisma.address.update({
          where: { id: otherAddresses[0].id },
          data: { isDefault: true }
        });
      }
    }

    // アドレスを削除
    await prisma.address.delete({
      where: { id: addressId }
    });

    return res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
