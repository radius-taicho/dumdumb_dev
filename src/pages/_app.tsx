import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { AnonymousSessionProvider } from '@/contexts/anonymous-session';

const inter = Inter({ subsets: ['latin'] });

// カスタムレイアウト対応のためのタイプ拡張
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  // ページコンポーネントにgetLayout関数があればそれを使用、なければデフォルトのLayoutを使用
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <SessionProvider session={session}>
      <AnonymousSessionProvider>
        <div className={inter.className}>
          {getLayout(<Component {...pageProps} />)}
          <Toaster position="top-center" />
        </div>
      </AnonymousSessionProvider>
    </SessionProvider>
  );
}