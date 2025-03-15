import type { NextPage } from 'next';
import Head from 'next/head';

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About | DumDumb</title>
        <meta name="description" content="DumDumbについての情報ページです。" />
      </Head>

      <div className="mb-16">
        <h1 className="text-3xl font-bold mb-6">DumDumbについて</h1>

        <div className="prose max-w-none">
          <p>
            DumDumbは、最高品質のファッションアイテムをお手頃価格で提供することを使命としています。
            私たちは、すべてのお客様に最高の買い物体験を提供するために、品質、サービス、そして価値に重点を置いています。
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">私たちのストーリー</h2>
          <p>
            DumDumbは2023年に創業されました。創業者の田中太郎は、高品質でありながらも手頃な価格のファッションアイテムを見つけることの難しさに気づき、そのギャップを埋めるためにDumDumbを立ち上げました。
          </p>
          <p>
            私たちは小さなオンラインショップからスタートし、現在では全国のお客様に愛される日本有数のECサイトへと成長しました。私たちの成功の秘訣は、お客様を第一に考え、常に最高品質の商品とサービスを提供し続けることにあります。
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">私たちの価値観</h2>
          <ul>
            <li><strong>品質へのこだわり</strong> - すべての商品は厳しい品質基準をクリアしています。</li>
            <li><strong>お客様第一</strong> - お客様の満足は私たちの最優先事項です。</li>
            <li><strong>持続可能性</strong> - 環境に配慮した商品調達と梱包を心がけています。</li>
            <li><strong>誠実さ</strong> - すべてのビジネス活動において誠実さを大切にしています。</li>
            <li><strong>革新</strong> - 常に新しいアイデアと改善を追求し続けています。</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">お客様へのお約束</h2>
          <p>
            DumDumbでは、すべてのお客様に以下をお約束します：
          </p>
          <ul>
            <li>最高品質の商品</li>
            <li>迅速で安全な配送</li>
            <li>30日間の返品保証</li>
            <li>24時間年中無休のカスタマーサポート</li>
            <li>安全なオンラインショッピング体験</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">お問い合わせ</h2>
          <p>
            ご質問やご意見がございましたら、お気軽にお問い合わせください。
          </p>
          <p>
            メール: info@dumdumb.com<br />
            電話: 03-1234-5678<br />
            営業時間: 平日 9:00-18:00
          </p>

          <p className="mt-8">
            DumDumbでのお買い物をお楽しみください。私たちと一緒に、あなたのファッションライフを豊かにしましょう。
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutPage;