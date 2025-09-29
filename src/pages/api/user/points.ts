import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

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

    // Get points history
    const pointHistory = await prisma.point.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total active points
    const now = new Date();
    const totalPoints = pointHistory
      .filter(point => new Date(point.expiresAt) > now)
      .reduce((total, point) => total + point.amount, 0);

    return res.status(200).json({
      totalPoints,
      pointHistory,
    });
  } catch (error) {
    console.error('Error fetching points:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
