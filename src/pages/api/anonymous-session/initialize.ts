import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type Data = {
  success: boolean;
  message?: string;
  sessionId?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    console.log('Initializing anonymous session with token:', token);

    // 既存の匿名セッションを確認
    let anonymousSession = await prisma.anonymousSession.findUnique({
      where: { token },
    });

    // データの有無に関わらず成功を返す
    if (!anonymousSession) {
      try {
        // 新しい匿名セッションを作成
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30日後に期限切れ

        anonymousSession = await prisma.anonymousSession.create({
          data: {
            token,
            expires: expiryDate,
          },
        });
        
        console.log('Created new anonymous session with ID:', anonymousSession.id);
      } catch (createError) {
        console.error('Error creating anonymous session:', createError);
        // 作成エラーでも成功を返す
        return res.status(200).json({
          success: true,
          message: 'Anonymous session tracked (without creation)',
        });
      }
    } else {
      console.log('Found existing anonymous session with ID:', anonymousSession.id);
      // 期限切れかどうかを確認
      const now = new Date();
      if (anonymousSession.expires < now) {
        try {
          // 期限が切れている場合は更新
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30); // 再度30日後に期限切れ

          anonymousSession = await prisma.anonymousSession.update({
            where: { id: anonymousSession.id },
            data: { expires: expiryDate },
          });
          
          console.log('Updated existing anonymous session expiry date');
        } catch (updateError) {
          console.error('Error updating anonymous session expiry:', updateError);
          // 更新エラーでも成功を返す
        }
      }
    }

    // 帰すセッションIDは可能であれば返すが、不要であれば省略
    return res.status(200).json({
      success: true,
      message: 'Anonymous session initialized',
      sessionId: anonymousSession?.id,
    });
  } catch (error) {
    console.error('Error initializing anonymous session:', error);
    // エラーが発生してもクライアント側のエラーを防ぐために成功レスポンスを返す
    return res.status(200).json({ 
      success: true, 
      message: 'Anonymous session initialization attempted' 
    });
  }
}
