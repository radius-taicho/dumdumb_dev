import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendMail, getPasswordResetEmailTemplate } from './mail';

const prisma = new PrismaClient();

// パスワードリセットトークンの作成
export async function createPasswordResetToken(email: string): Promise<string | null> {
  try {
    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // ユーザーが存在しない場合もセキュリティのため成功を装う
      return null;
    }

    // 以前の未使用トークンを無効化
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // 新しいトークンを生成
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24時間後に期限切れ

    // データベースにトークンを保存
    await prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    return token;
  } catch (error) {
    console.error('Password reset token creation error:', error);
    return null;
  }
}

// パスワードリセットメールの送信
export async function sendPasswordResetEmail(email: string, baseUrl: string): Promise<boolean> {
  try {
    const token = await createPasswordResetToken(email);
    
    if (!token) {
      // トークン作成失敗またはユーザーが存在しない
      // セキュリティのため成功を装う
      return true;
    }

    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
    const emailTemplate = getPasswordResetEmailTemplate(resetUrl);
    
    return await sendMail(
      email,
      'DumDumb - パスワードリセット',
      emailTemplate
    );
  } catch (error) {
    console.error('Send password reset email error:', error);
    return false;
  }
}

// トークンの検証とパスワードリセット
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  try {
    // トークンの検証
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return false;
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // トランザクションを使用してパスワード更新とトークン使用済みマークを一緒に行う
    await prisma.$transaction([
      // ユーザーのパスワードを更新 - NextAuthではhashedPasswordフィールドを使用
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { hashedPassword },
      }),
      // トークンを使用済みにマーク
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return true;
  } catch (error) {
    console.error('Reset password error:', error);
    return false;
  }
}

// トークンの検証のみ（パスワードリセットフォーム表示前に検証するため）
export async function validateResetToken(token: string): Promise<boolean> {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    return !!(resetToken && !resetToken.used && resetToken.expiresAt > new Date());
  } catch (error) {
    console.error('Validate reset token error:', error);
    return false;
  }
}