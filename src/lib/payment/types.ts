/**
 * 支払い方法の抽象化インターフェース
 * 将来的にStripeやAmazon Payなど異なる決済方法に対応するための共通インターフェース
 */

export type PaymentAmount = {
  amount: number;
  currency: string;
};

export type PaymentCustomer = {
  id: string;
  email?: string;
  name?: string;
};

export type PaymentResult = {
  success: boolean;
  paymentId?: string;
  error?: string;
  metadata?: Record<string, any>;
};

export type PaymentMethodInfo = {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  holderName?: string;
  isDefault?: boolean;
};

// すべての支払いプロバイダーが実装する共通インターフェース
export interface PaymentProvider {
  // プロバイダーの種類
  getType(): string;
  
  // 支払い処理を開始するための初期化データを取得
  initializePayment(amount: PaymentAmount, customer: PaymentCustomer): Promise<any>;
  
  // 支払い処理を実行
  processPayment(paymentData: any): Promise<PaymentResult>;
  
  // 支払い方法情報を保存
  savePaymentMethod(userId: string, paymentData: any): Promise<PaymentMethodInfo>;
  
  // 実行環境がサポートされているか確認
  isSupported(): boolean;
}

// 利用可能な支払いプロバイダーの種類
export enum PaymentProviderType {
  STRIPE = 'stripe',
  AMAZON_PAY = 'amazon_pay',
  CREDIT_CARD = 'credit_card' // 汎用的なクレジットカード処理（将来用）
}
