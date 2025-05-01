import { PrismaClient } from '@prisma/client';

// PrismaClientのインスタンスをグローバルに保存するための宣言
declare global {
  var prisma: PrismaClient | undefined;
}

// 開発環境では同じPrismaClientインスタンスを再利用し、本番環境では新しいインスタンスを作成
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export { prisma };
export default prisma;
