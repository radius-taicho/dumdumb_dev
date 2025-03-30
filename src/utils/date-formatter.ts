import { format, parseISO, addDays } from 'date-fns';
import { ja, zhCN, ko, th } from 'date-fns/locale';

/**
 * 対応している言語コードとロケールのマッピング
 */
const locales = {
  ja: ja,     // 日本語
  zh: zhCN,   // 中国語（簡体字）
  ko: ko,     // 韓国語
  th: th,     // タイ語
  en: undefined // 英語（デフォルト）
};

/**
 * 言語コードに基づいてロケールを取得する
 * @param lang 言語コード (ja, zh, ko, th, en)
 */
export const getLocale = (lang?: string) => {
  if (!lang) return undefined;
  return locales[lang] || undefined;
};

/**
 * 日付をフォーマットする
 * @param dateString ISO形式の日付文字列
 * @param lang 言語コード (ja, zh, ko, th, en)
 * @param formatStr フォーマット文字列 (デフォルト: 'yyyy/MM/dd')
 */
export const formatDate = (dateString: string, lang?: string, formatStr: string = 'yyyy/MM/dd') => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: getLocale(lang) });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

/**
 * 配送予定日を計算する（注文日から5日後）
 * @param orderDateString ISO形式の注文日
 * @param lang 言語コード
 * @param formatStr フォーマット文字列
 */
export const calculateDeliveryDate = (orderDateString: string, lang?: string, formatStr: string = 'yyyy/MM/dd') => {
  try {
    const orderDate = parseISO(orderDateString);
    const deliveryDate = addDays(orderDate, 5);
    return format(deliveryDate, formatStr, { locale: getLocale(lang) });
  } catch (error) {
    console.error('Delivery date calculation error:', error);
    return '';
  }
};

/**
 * 日付と時間を含めたフォーマット
 * @param dateString ISO形式の日付文字列
 * @param lang 言語コード
 */
export const formatDateTime = (dateString: string, lang?: string) => {
  // 各言語に適した日付+時間フォーマット
  const formatByLang = {
    ja: 'yyyy年MM月dd日 HH:mm',
    zh: 'yyyy年MM月dd日 HH:mm',
    ko: 'yyyy년 MM월 dd일 HH:mm',
    th: 'd MMMM yyyy, HH:mm น.',
    en: 'MMM d, yyyy, h:mm a'
  };

  try {
    const date = parseISO(dateString);
    const formatStr = formatByLang[lang] || formatByLang.en;
    return format(date, formatStr, { locale: getLocale(lang) });
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return dateString;
  }
}

/**
 * ブラウザの言語設定から言語コードを取得する
 * 現在のプロジェクトで対応している言語のみを返す
 */
export const getBrowserLanguage = (): string => {
  try {
    if (typeof window === 'undefined') return 'ja'; // サーバーサイドではデフォルトを返す
    
    const fullLang = navigator.language.toLowerCase();
    const primaryLang = fullLang.split('-')[0];
    
    // 対応言語かチェック
    if (Object.keys(locales).includes(primaryLang)) {
      return primaryLang;
    }
    
    return 'ja'; // デフォルトは日本語
  } catch (error) {
    return 'ja';
  }
};
