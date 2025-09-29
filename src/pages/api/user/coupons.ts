import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userEmail = session.user?.email;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found in session' });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's coupons
    const coupons = await prisma.coupon.findMany({
      where: { userId: user.id },
      orderBy: [
        { isUsed: 'asc' },
        { expiresAt: 'asc' },
      ],
    });

    return res.status(200).json({
      coupons,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
