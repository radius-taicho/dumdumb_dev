import { PrismaClient } from '@prisma/client';

// PrismaClientをグローバルに拡張する
declare global {
  var prisma: PrismaClient | undefined;
}

// 開発環境ではホットリロードでPrismaClientのインスタンスを複数生成することを防ぐ
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;