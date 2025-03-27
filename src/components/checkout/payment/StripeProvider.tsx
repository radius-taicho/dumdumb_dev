import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/client';

type StripeProviderProps = {
  children: React.ReactNode;
};

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  // 環境変数が設定されているか確認
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 環境変数が設定されていません');
  }

  return (
    <Elements stripe={getStripe()}>
      {children}
    </Elements>
  );
};

export default StripeProvider;