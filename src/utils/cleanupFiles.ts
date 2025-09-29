import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// アップロードディレクトリの設定
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'contacts');

/**
 * 未使用の添付ファイルを削除する
 * 例: クローンジョブで定期的に実行する
 */
export const cleanupUnusedAttachments = async () => {
  try {
    // データベースに保存されているファイルパスを取得
    const attachments = await prisma.contactAttachment.findMany({
      select: {
        path: true,
      },
    });

    const dbFilePaths = new Set(attachments.map((a) => a.path));

    // アップロードディレクトリのファイル一覧を取得
    const filesOnDisk = fs.readdirSync(UPLOAD_DIR);

    // データベースに存在しないファイルを削除
    for (const file of filesOnDisk) {
      if (!dbFilePaths.has(file)) {
        const filePath = path.join(UPLOAD_DIR, file);
        // ファイルの作成時間を確認（例: 1時間以上前のファイルのみ削除）
        const stats = fs.statSync(filePath);
        const fileAge = Date.now() - stats.birthtimeMs;
        const ONE_HOUR = 60 * 60 * 1000;

        if (fileAge > ONE_HOUR) {
          try {
            fs.unlinkSync(filePath);
            console.log(`Removed unused file: ${file}`);
          } catch (err) {
            console.error(`Error removing file ${file}:`, err);
          }
        }
      }
    }

    console.log('Cleanup completed');
  } catch (error) {
    console.error('Error during file cleanup:', error);
  }
};

/**
 * アップロードディレクトリからファイルを削除する
 */
export const removeFile = (filePath: string) => {
  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error removing file ${filePath}:`, error);
    return false;
  }
};
