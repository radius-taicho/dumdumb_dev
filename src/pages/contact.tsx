import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Info, Mail, Phone, Check, Loader, X, Upload, File, FileText, Image, AlertTriangle } from 'lucide-react';
import { ContactCategory, ContactFormData, ContactResponse, AttachmentPreview, AttachmentInfo } from '@/types/contact';
import { useSession } from 'next-auth/react';

export default function Contact() {
  const { data: session } = useSession();
  
  // フォーム状態
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [category, setCategory] = useState<ContactCategory>('商品について');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // 送信状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // ファイルアップロード関連
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // ファイルアップロードの制約
  const MAX_FILES = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ];
  
  // FAQ開閉状態
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  
  // よくある質問リスト
  const faqs = [
    {
      question: '注文した商品がまだ届きません',
      answer: 'ご注文から3営業日以内に発送いたします。発送後、お届けまでの日数は地域によって異なります。マイページの注文履歴から配送状況をご確認いただけます。10日以上経過しても商品が届かない場合は、お問い合わせフォームよりご連絡ください。'
    },
    {
      question: '商品が破損して届きました',
      answer: '大変申し訳ございません。商品到着後7日以内に、お問い合わせフォームより商品名、注文番号、破損状況がわかる写真を添えてご連絡ください。迅速に対応させていただきます。'
    },
    {
      question: 'パスワードを忘れてしまいました',
      answer: 'ログインページの「パスワードをお忘れの方はこちら」からパスワードのリセットが可能です。登録済みのメールアドレスにリセット用のリンクをお送りします。'
    },
    {
      question: '注文後のキャンセルは可能ですか',
      answer: '商品発送前であればキャンセル可能です。マイページの注文履歴からキャンセル手続きをお願いします。既に発送済みの場合は、商品到着後に返品の手続きとなります。'
    },
    {
      question: '請求書や領収書は発行できますか',
      answer: 'はい、マイページの注文履歴から電子版の領収書をダウンロードできます。紙の領収書や請求書が必要な場合は、お問い合わせフォームよりご依頼ください。'
    }
  ];
  
  // ログイン中のユーザー情報を事前設定
  React.useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) {
        setName(session.user.name);
      }
      if (session.user.email && !email) {
        setEmail(session.user.email);
      }
    }
  }, [session]);
  
  // ファイル拡張子の取得
  const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 1).toLowerCase();
  };
  
  // ファイルのバリデーション
  const validateFile = (file: File): string | null => {
    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return `ファイルサイズが制限（${MAX_FILE_SIZE / (1024 * 1024)}MB）を超えています。`;
    }
    
    // ファイルのMIMEタイプチェック
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `サポートされていないファイル形式です。対応形式: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    
    // ファイル拡張子チェック
    const ext = `.${getFileExtension(file.name)}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `サポートされていないファイル拡張子です。対応拡張子: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    
    return null;
  };

  // ファイル選択処理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    // ファイル数の制限チェック
    if (attachments.length + files.length > MAX_FILES) {
      setUploadError(`添付ファイルは最大${MAX_FILES}個までです。`);
      return;
    }
    
    // 新しい添付ファイルを処理
    Array.from(files).forEach(file => {
      // バリデーション
      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        return;
      }
      
      // プレビュー用URLを生成
      const previewUrl = URL.createObjectURL(file);
      
      // 添付ファイル配列に追加
      setAttachments(prev => [...prev, { file, previewUrl }]);
    });
    
    // ファイル入力をリセット（同じファイルを再度選択できるように）
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 添付ファイルの削除
  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      // プレビューURLを解放
      URL.revokeObjectURL(newAttachments[index].previewUrl);
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };
  
  // ファイルアップロード処理
  const uploadFiles = async (): Promise<AttachmentInfo[]> => {
    if (attachments.length === 0) return [];
    
    setIsUploading(true);
    const uploadedFiles: AttachmentInfo[] = [];
    
    try {
      // 各ファイルをアップロード
      for (const attachment of attachments) {
        const formData = new FormData();
        formData.append('file', attachment.file);
        
        const response = await fetch('/api/contact/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'ファイルアップロード中にエラーが発生しました');
        }
        
        const data = await response.json();
        if (data.files && data.files.length > 0) {
          uploadedFiles.push(data.files[0]);
        }
      }
      
      return uploadedFiles;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // お問い合わせ送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力バリデーション
    if (!name || !email || !subject || !message) {
      setSubmitError('必須項目をすべて入力してください');
      return;
    }
    
    if (!agreedToTerms) {
      setSubmitError('個人情報の取り扱いについて同意してください');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // 添付ファイルがあればアップロード
      let uploadedAttachments: AttachmentInfo[] = [];
      if (attachments.length > 0) {
        uploadedAttachments = await uploadFiles();
      }
      
      // フォームデータの準備
      const formData: ContactFormData = {
        name,
        email,
        category,
        subject,
        message,
        orderNumber: orderNumber || undefined,
        agreedToTerms,
        attachments: uploadedAttachments
      };
      
      // APIエンドポイントを呼び出す
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data: ContactResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '送信に失敗しました。時間をおいて再度お試しください。');
      }
      
      // 送信成功
      setSubmitSuccess(true);
      
      // プレビューURLを解放
      attachments.forEach(attachment => {
        URL.revokeObjectURL(attachment.previewUrl);
      });
      
      // フォームリセット
      setName('');
      setEmail('');
      setOrderNumber('');
      setCategory('商品について');
      setSubject('');
      setMessage('');
      setAgreedToTerms(false);
      setAttachments([]);
      
    } catch (error) {
      console.error('Contact submission error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : '送信中にエラーが発生しました。時間をおいて再度お試しください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // FAQの開閉を切り替え
  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-center">お問い合わせ</h1>
      <p className="text-center text-gray-600 mb-8">
        商品やご注文に関するお問い合わせは、以下のフォームよりお気軽にご連絡ください。
      </p>
      
      {/* 成功メッセージ */}
      {submitSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-2 rounded-full">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">お問い合わせを受け付けました</h2>
          <p className="text-green-700 mb-4">
            内容を確認次第、担当者よりご連絡いたします。
            お送りいただいたメールアドレス宛に自動返信メールをお送りしておりますので、ご確認ください。
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            新しいお問い合わせを作成
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* お問い合わせフォーム */}
          <div className="lg:w-2/3">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-6">お問い合わせフォーム</h2>
              
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 flex items-start">
                  <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{submitError}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 required">
                    お名前
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    required
                    disabled={isSubmitting}
                    placeholder="例：山田 太郎"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 required">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    required
                    disabled={isSubmitting}
                    placeholder="例：example@mail.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ご入力いただいたメールアドレス宛に返信いたします。
                  </p>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    注文番号（お持ちの場合）
                  </label>
                  <input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    disabled={isSubmitting}
                    placeholder="例：ORD123456789"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 required">
                    お問い合わせカテゴリー
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ContactCategory)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="商品について">商品について</option>
                    <option value="注文・決済について">注文・決済について</option>
                    <option value="配送・受取について">配送・受取について</option>
                    <option value="返品・交換について">返品・交換について</option>
                    <option value="アカウントについて">アカウントについて</option>
                    <option value="不具合・エラーについて">不具合・エラーについて</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1 required">
                    件名
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    required
                    disabled={isSubmitting}
                    maxLength={100}
                    placeholder="例：商品について質問があります"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 required">
                    お問い合わせ内容
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                    rows={6}
                    required
                    disabled={isSubmitting}
                    maxLength={2000}
                    placeholder="できるだけ具体的にご記入ください。商品に関するお問い合わせの場合は、商品名も記載いただけますとスムーズです。"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/2000文字
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    添付ファイル（最大{MAX_FILES}ファイル、各{MAX_FILE_SIZE / (1024 * 1024)}MBまで）
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">クリックしてファイルを選択</span> または
                            ドラッグ＆ドロップ
                          </p>
                          <p className="text-xs text-gray-500">
                            対応形式: {ALLOWED_EXTENSIONS.join(', ')}
                          </p>
                        </div>
                        <input
                          id="file-upload"
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={ALLOWED_EXTENSIONS.join(',')}
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={isSubmitting || attachments.length >= MAX_FILES}
                        />
                      </label>
                    </div>
                  </div>
                  
                  {uploadError && (
                    <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-lg flex items-start text-sm">
                      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <p>{uploadError}</p>
                    </div>
                  )}
                  
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">添付済みファイル:</p>
                      <div className="space-y-2">
                        {attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              {attachment.file.type.startsWith('image/') ? (
                                <Image className="w-5 h-5 mr-2 text-gray-600" />
                              ) : (
                                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                              )}
                              <div>
                                <p className="text-sm font-medium truncate max-w-xs">{attachment.file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(attachment.file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                              disabled={isSubmitting}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 mr-2"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      <span className="required-label">
                        当サイトの<a href="/policies" className="text-blue-600 hover:underline">プライバシーポリシー</a>を読み、お問い合わせのために個人情報を提供することに同意します。
                      </span>
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    '送信する'
                  )}
                </button>
              </form>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg border">
              <h3 className="font-semibold text-gray-700 mb-3">
                お問い合わせに関する注意事項
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>
                  お問い合わせ内容によっては、回答までにお時間をいただく場合がございます。
                </li>
                <li>
                  営業時間（平日10:00～18:00）外のお問い合わせは、翌営業日以降の対応となります。
                </li>
                <li>
                  お送りいただくメールアドレスは、必ず受信可能なものをご記入ください。
                </li>
                <li>
                  添付ファイルは送信できません。画像等を送りたい場合は、お問い合わせ後の返信メールに添付してください。
                </li>
                <li>
                  新商品や取り扱いブランドに関するご要望は、<a href="/mypage/requests" className="text-blue-600 hover:underline">マイページの「ご要望」機能</a>からお送りください。
                </li>
              </ul>
            </div>
          </div>
          
          {/* サイドバー */}
          <div className="lg:w-1/3">
            {/* よくある質問 */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4">よくある質問</h2>
              
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex justify-between items-center p-3 text-left focus:outline-none"
                    >
                      <span className="font-medium text-sm pr-2">{faq.question}</span>
                      {openFAQIndex === index ? (
                        <ChevronUp className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openFAQIndex === index && (
                      <div className="p-3 bg-gray-50 border-t text-sm text-gray-700">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <a
                  href="/faq"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  すべてのFAQを見る
                </a>
              </div>
            </div>
            
            {/* その他の連絡先 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">その他の連絡先</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">電話によるお問い合わせ</p>
                    <p className="text-gray-700">03-1234-5678</p>
                    <p className="text-sm text-gray-500">受付時間：平日10:00～18:00</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">メールアドレス</p>
                    <p className="text-gray-700">support@dumdumb.co.jp</p>
                    <p className="text-sm text-gray-500">24時間受付（返信は営業時間内）</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <p className="font-medium mb-2">法人のお客様</p>
                  <p className="text-sm text-gray-700 mb-1">
                    メディア掲載、取材、コラボレーションなどのご相談は企業向け専用フォームをご利用ください。
                  </p>
                  <a
                    href="#"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    企業向けお問い合わせはこちら
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .required::after {
          content: " *";
          color: #e53e3e;
        }
        
        .required-label::after {
          content: " *";
          color: #e53e3e;
        }
      `}</style>
    </div>
  );
}
