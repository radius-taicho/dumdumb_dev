import { PrismaClient } from '@prisma/client'

// グローバルスコープの宣言（Next.jsの開発モードでの複数インスタンス化を防止）
declare global {
  var prisma: PrismaClient | undefined
}

// シングルトンパターンでPrismaClientを初期化
export const prisma = global.prisma || new PrismaClient({
  log: ['error', 'warn'],
})

// 開発モードの場合のみ、グローバル変数にPrismaClientを保存
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
