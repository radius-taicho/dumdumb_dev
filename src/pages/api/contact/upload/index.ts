import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { ensureUploadDir, validateFileExtension, validateFileSize, validateFileMimeType } from '@/utils/fileUpload';

// Prismaクライアントをシングルトンとして初期化
const prisma = new PrismaClient();

// ファイルアップロードのディレクトリ設定
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'contacts');

// アップロードファイルの制約
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
];

// API設定をオーバーライドしてファイルアップロードを許可
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // アップロードディレクトリの確認
  ensureUploadDir(UPLOAD_DIR);

  try {
    const form = new IncomingForm({
      maxFileSize: MAX_FILE_SIZE,
      multiples: true,
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
    });

    // フォームデータをパース
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'Failed to parse form data' });
      }

      // ファイル情報を格納する配列
      const fileInfos = [];

      // ファイルオブジェクトを処理（単一またはサイズやファイル配列の場合を考慮）
      const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];

      for (const file of uploadedFiles) {
        if (!file) continue;

        // ファイル拡張子の検証
        const fileExt = path.extname(file.originalFilename || '').toLowerCase();
        if (!validateFileExtension(file.originalFilename || '', ALLOWED_EXTENSIONS)) {
          fs.unlinkSync(file.filepath); // 無効なファイルを削除
          return res.status(400).json({
            error: `Unsupported file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
          });
        }

        // ファイルサイズの検証
        if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
          fs.unlinkSync(file.filepath); // 無効なファイルを削除
          return res.status(400).json({
            error: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          });
        }

        // ファイルのMIMEタイプの検証
        if (!validateFileMimeType(file.mimetype || '', ALLOWED_MIME_TYPES)) {
          fs.unlinkSync(file.filepath); // 無効なファイルを削除
          return res.status(400).json({
            error: `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
          });
        }

        // 一意のファイル名を生成
        const uniqueFilename = `${uuidv4()}${fileExt}`;
        const newPath = path.join(UPLOAD_DIR, uniqueFilename);

        // 既存のパスから新しいパスにファイルを移動
        fs.renameSync(file.filepath, newPath);

        // アップロードされたファイル情報を保存
        const fileInfo = {
          filename: file.originalFilename || 'unknown',
          path: uniqueFilename, // publicからの相対パス
          mimetype: file.mimetype || 'application/octet-stream',
          size: file.size,
        };

        fileInfos.push(fileInfo);
      }

      // 一時的に生成されたファイル情報を返す
      return res.status(200).json({
        success: true,
        files: fileInfos,
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
}
