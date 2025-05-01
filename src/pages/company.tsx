import React from 'react';

export default function Company() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">会社概要</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <table className="w-full border-collapse mb-8">
          <tbody>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top w-1/3">会社名</th>
              <td className="py-4 px-2">株式会社dumdumb（dumdumb Inc.）</td>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top">設立</th>
              <td className="py-4 px-2">2020年6月1日</td>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top">資本金</th>
              <td className="py-4 px-2">1億円</td>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top">代表取締役</th>
              <td className="py-4 px-2">山田 太郎</td>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top">本社所在地</th>
              <td className="py-4 px-2">
                〒123-4567<br />
                東京都渋谷区渋谷1-2-3 dumdumbビル 5階<br />
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google マップで見る</a>
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top">事業内容</th>
              <td className="py-4 px-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>キャラクターグッズの企画・製造・販売</li>
                  <li>アニメ・漫画関連商品の輸入・販売</li>
                  <li>オリジナルグッズの企画・製造・販売</li>
                  <li>EC事業の運営</li>
                  <li>イベント企画・運営</li>
                </ul>
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top">従業員数</th>
              <td className="py-4 px-2">85名（2025年4月現在）</td>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top">取引銀行</th>
              <td className="py-4 px-2">
                三井住友銀行 渋谷支店<br />
                みずほ銀行 渋谷中央支店<br />
                三菱UFJ銀行 渋谷支店
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top">許認可</th>
              <td className="py-4 px-2">古物商許可番号 第301199900000号</td>
            </tr>
            <tr>
              <th className="py-4 px-2 text-left font-medium text-gray-700 align-top">グループ会社</th>
              <td className="py-4 px-2">
                株式会社dumdumbクリエイティブ（制作・デザイン）<br />
                dumdumb International Ltd.（海外事業）
              </td>
            </tr>
          </tbody>
        </table>
        
        <h2 className="text-xl font-semibold mb-4">企業理念</h2>
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <p className="text-lg font-medium text-center mb-4">「好きを形に、想いをカタチに」</p>
          <p className="mb-3">
            私たちdumdumbは、アニメやキャラクターを愛する全ての人々が、その「好き」という気持ちを形として
            手に取り、日常に取り入れることができる製品を提供することを使命としています。
          </p>
          <p>
            ファンの声に耳を傾け、クリエイターの想いを尊重し、高品質で魅力的な商品を通じて、
            キャラクターとファンの架け橋となることを目指しています。
          </p>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">沿革</h2>
        <div className="space-y-6">
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2020年6月</div>
            <div>株式会社dumdumb設立</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2020年9月</div>
            <div>オンラインストア「dumdumb」オープン</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2021年4月</div>
            <div>渋谷本社オフィス移転</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2021年7月</div>
            <div>大手アニメスタジオとの独占販売契約締結</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2022年3月</div>
            <div>株式会社dumdumbクリエイティブ設立</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2022年11月</div>
            <div>dumdumb International Ltd.設立（香港）</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2023年5月</div>
            <div>累計出荷数100万個達成</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2023年9月</div>
            <div>原宿に初の実店舗「dumdumb SHOP HARAJUKU」オープン</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2024年2月</div>
            <div>アプリ版「dumdumb」リリース</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2024年8月</div>
            <div>大阪に2号店「dumdumb SHOP OSAKA」オープン</div>
          </div>
          <div className="flex">
            <div className="w-24 flex-shrink-0 font-medium">2025年1月</div>
            <div>会員数50万人達成</div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          採用情報や取材のお問い合わせは、<a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a>よりご連絡ください。
        </p>
      </div>
    </div>
  );
}
