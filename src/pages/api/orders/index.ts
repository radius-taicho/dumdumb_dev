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

  // POST: 新しい注文を作成
  if (req.method === 'POST') {
    const {
      addressId,
      paymentMethodId,
      deliveryDate,
      deliveryTimeSlot,
      items,
      subtotal,
      shippingFee,
      tax,
      total,
    } = req.body;

    // 基本的なバリデーション
    if (!addressId || !paymentMethodId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '必要な情報が不足しています' });
    }

    try {
      // トランザクションを使用して、注文処理を確実に行う
      const result = await prisma.$transaction(async (prisma) => {
        // 1. 注文の作成
        const order = await prisma.order.create({
          data: {
            userId,
            addressId,
            paymentMethodId,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            deliveryTimeSlot,
            subtotal,
            shippingFee,
            tax,
            total,
            status: 'PENDING', // 初期状態は保留
          },
        });

        // 2. 注文アイテムの作成
        const orderItems = await Promise.all(
          items.map(async (item) => {
            return prisma.orderItem.create({
              data: {
                orderId: order.id,
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price,
                size: item.size || null,
              },
            });
          })
        );

        // 3. ユーザーのカートから商品を削除
        const cart = await prisma.cart.findUnique({
          where: { userId },
          select: { id: true },
        });

        if (cart) {
          await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
          });
        }

        // 4. 在庫の更新（実際のアプリケーションでは在庫チェックも実施）
        for (const item of items) {
          if (item.size) {
            // サイズがある場合はItemSizeの在庫を更新
            await prisma.itemSize.updateMany({
              where: {
                itemId: item.itemId,
                size: item.size,
              },
              data: {
                inventory: {
                  decrement: item.quantity,
                },
              },
            });
          } else {
            // サイズがない場合はItemの在庫を更新
            await prisma.item.update({
              where: {
                id: item.itemId,
              },
              data: {
                inventory: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }

        return { order, orderItems };
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ error: '注文の処理中にエラーが発生しました' });
    }
  }

  // GET: ユーザーの注文履歴を取得
  if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId,
        },
        include: {
          orderItems: {
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
          address: true,
          paymentMethod: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: '注文履歴の取得に失敗しました' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
