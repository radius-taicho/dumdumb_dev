/**
 * ユニークなクーポンコードを生成する
 * @param prefix クーポンコードの接頭辞
 * @param length クーポンコード全体の長さ (接頭辞を含まない部分)
 * @returns 生成されたクーポンコード
 */
export const generateCouponCode = (prefix: string = 'DUM', length: number = 8): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字（O, 0, I, 1）を除外
  let code = prefix;
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars.charAt(randomIndex);
  }
  
  return code;
};

/**
 * クーポンの有効期限を計算する (デフォルト: 3ヶ月)
 * @param months 有効期限の月数
 * @returns 有効期限の日付
 */
export const calculateCouponExpiryDate = (months: number = 3): Date => {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + months);
  return expiryDate;
};
