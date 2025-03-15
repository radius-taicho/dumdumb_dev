import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

// カスタムレイアウト対応のためのタイプ拡張
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // ページコンポーネントにgetLayout関数があればそれを使用、なければデフォルトのLayoutを使用
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <div className={inter.className}>
      {getLayout(<Component {...pageProps} />)}
    </div>
  );
}