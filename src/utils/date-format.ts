// 視聴日時のフォーマット
export const formatViewDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'たった今';
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}日前`;
  
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 画像URL処理（カンマ区切りの場合は最初の画像を使用）
export const getImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) return "/images/placeholder.jpg";
  if (imageUrl.startsWith('/path/to/')) return "/images/placeholder.jpg";
  
  // カンマ区切りの場合は最初の画像を使用
  if (imageUrl.includes(',')) {
    return imageUrl.split(',')[0].trim();
  }
  
  return imageUrl;
};
