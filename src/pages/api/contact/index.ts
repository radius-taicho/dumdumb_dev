import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { ContactFormData, ContactResponse, AttachmentInfo } from '@/types/contact';
import { getSession } from 'next-auth/react';
import { sendContactConfirmationEmail } from '@/lib/emailService';

// Prismaクライアントをシングルトンとして初期化
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>
) {
  // POSTリクエストのみを処理
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST method is allowed for this endpoint',
    });
  }

  try {
    const formData: ContactFormData = req.body;
    
    // 添付ファイル情報があれば解析
    let attachments: AttachmentInfo[] = [];
    if (formData.attachments && typeof formData.attachments === 'string') {
      try {
        attachments = JSON.parse(formData.attachments as unknown as string);
      } catch (e) {
        console.error('Failed to parse attachments:', e);
        // エラーでも処理は続行
      }
    }
    
    // 必須項目の検証
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'すべての必須フィールドを入力してください',
      });
    }

    if (!formData.agreedToTerms) {
      return res.status(400).json({
        success: false,
        message: 'Terms not agreed',
        error: 'プライバシーポリシーに同意していただく必要があります',
      });
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email',
        error: '有効なメールアドレスを入力してください',
      });
    }

    // セッションからユーザー情報を取得（ログイン中の場合）
    const session = await getSession({ req });
    const userId = session?.user?.id;

    // 添付ファイル情報を取得
    const attachments = formData.attachments || [];
    
    // お問い合わせをデータベースに保存（トランザクションで添付ファイルも同時に保存）
    const contact = await prisma.$transaction(async (tx) => {
      // お問い合わせ情報を保存
      const newContact = await tx.contact.create({
        data: {
          name: formData.name,
          email: formData.email,
          category: formData.category,
          subject: formData.subject,
          message: formData.message,
          orderNumber: formData.orderNumber || null,
          userId: userId || null, // ユーザーがログインしている場合はIDを関連付け
          status: 'pending',
          priority: 'medium',
        },
      });
      
      // 添付ファイル情報をデータベースに保存
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          await tx.contactAttachment.create({
            data: {
              contactId: newContact.id,
              filename: attachment.filename,
              path: attachment.path,
              mimetype: attachment.mimetype,
              size: attachment.size,
            },
          });
        }
      }
      
      return newContact;
    });

    // 自動返信メールの送信
    try {
      await sendContactConfirmationEmail(formData.email, formData.name, formData.subject);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // メール送信の失敗はクリティカルではないのでエラーレスポンスは返さない
    }

    // 成功レスポンス
    return res.status(200).json({
      success: true,
      message: 'お問い合わせを受け付けました。担当者からの返信をお待ちください。',
      contactId: contact.id,
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'サーバーエラーが発生しました。時間をおいて再度お試しください。',
    });
  }
}
