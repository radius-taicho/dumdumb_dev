// お問い合わせのカテゴリ
export type ContactCategory = 
  | '商品について' 
  | '注文・決済について' 
  | '配送・受取について' 
  | '返品・交換について' 
  | 'アカウントについて' 
  | '不具合・エラーについて' 
  | 'その他';

// お問い合わせフォームの入力データ
export interface ContactFormData {
  name: string;
  email: string;
  category: ContactCategory;
  subject: string;
  message: string;
  orderNumber?: string;
  agreedToTerms: boolean;
  attachments?: File[]; // 添付ファイル
}

// お問い合わせAPIレスポンス
export interface ContactResponse {
  success: boolean;
  message: string;
  contactId?: string;
  error?: string;
}

// 添付ファイル情報
export interface AttachmentInfo {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  createdAt: string;
}

// 添付ファイルのプレビュー情報（クライアント側で使用）
export interface AttachmentPreview {
  file: File;
  id?: string;
  previewUrl: string;
}
