import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// アップロードディレクトリの作成（存在しない場合）
export const ensureUploadDir = (dir: string) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw new Error('Failed to create upload directory');
  }
};

// アップロードされたファイルの保存
export const saveFile = async (file: File, uploadDir: string): Promise<{
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}> => {
  try {
    // ディレクトリの存在確認
    ensureUploadDir(uploadDir);

    // ファイル名の生成（元のファイル名を維持しつつ一意にする）
    const fileExtension = path.extname(file.name);
    const baseFilename = path.basename(file.name, fileExtension);
    const sanitizedFilename = baseFilename.replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFilename = `${sanitizedFilename}_${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // ファイルをArrayBufferとして読み込む
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ファイルを保存
    fs.writeFileSync(filePath, buffer);

    return {
      filename: file.name,
      path: uniqueFilename, // データベースには相対パスのみを保存
      mimetype: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
};

// ファイル拡張子の検証
export const validateFileExtension = (filename: string, allowedExtensions: string[]): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
};

// ファイルサイズの検証
export const validateFileSize = (fileSize: number, maxSizeInBytes: number): boolean => {
  return fileSize <= maxSizeInBytes;
};

// ファイルのMIMEタイプの検証
export const validateFileMimeType = (mimeType: string, allowedMimeTypes: string[]): boolean => {
  return allowedMimeTypes.includes(mimeType);
};
