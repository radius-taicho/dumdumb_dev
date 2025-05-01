import React from 'react';

export default function Legal() {
  return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">特定商取引法に基づく表記</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <p className="text-sm text-gray-500 mb-8">
            当サイトは、特定商取引法に基づき、以下の通り表記します。お客様に安心してお買い物をしていただくため、
            特定商取引法（特定商取引に関する法律）に基づく表記を掲載しております。
          </p>
          
          <div className="space-y-8">
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">販売事業者</h2>
                <p className="mb-4">株式会社dumdumb</p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">代表者</h2>
                <p className="mb-4">山田 太郎</p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">所在地</h2>
                <p className="mb-4">
                  〒123-4567<br />
                  東京都渋谷区渋谷1-2-3 dumdumbビル 5階
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">連絡先</h2>
                <p className="mb-4">
                  電話番号：03-1234-5678（平日 10:00～18:00）<br />
                  メールアドレス：customer-support@dumdumb.co.jp<br />
                  ※お問い合わせは、<a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a>をご利用ください。
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">販売価格</h2>
                <p className="mb-4">
                  各商品ページに表示された価格に消費税が含まれています。<br />
                  なお、配送料は別途かかる場合があり、詳細は<a href="/shipping" className="text-blue-600 hover:underline">送料・配送情報</a>をご確認ください。
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">支払方法</h2>
                <p className="mb-4">
                  以下の支払方法をご利用いただけます：<br />
                  ・クレジットカード（VISA、MasterCard、JCB、American Express、Diners Club）<br />
                  ・コンビニ決済<br />
                  ・銀行振込（前払い）<br />
                  ・PayPay<br />
                  ・Amazon Pay<br />
                  ・代金引換（手数料330円税込）
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">商品の引渡し時期</h2>
                <p className="mb-4">
                  ・クレジットカード、PayPay、Amazon Pay：ご注文確認後、3営業日以内に発送いたします。<br />
                  ・コンビニ決済、銀行振込：お支払い確認後、3営業日以内に発送いたします。<br />
                  ・代金引換：ご注文確認後、3営業日以内に発送いたします。<br />
                  ※在庫切れ、予約商品の場合は商品ページに記載の発送予定日をご確認ください。<br />
                  ※年末年始、ゴールデンウィーク、お盆期間は、発送が遅れる場合がございます。
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">配送方法</h2>
                <p className="mb-4">
                  ・ヤマト運輸<br />
                  ・佐川急便<br />
                  ・日本郵便<br />
                  ※配送業者のご指定はできません。
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">返品・交換について</h2>
                <p className="mb-4">
                  商品到着後7日以内に、メールまたはお電話にてご連絡ください。<br /><br />
                  
                  <span className="font-semibold">【返品・交換可能な場合】</span><br />
                  ・商品に不良があった場合<br />
                  ・ご注文と異なる商品が届いた場合<br />
                  上記の場合は、返送料を当社が負担いたします。<br /><br />
                  
                  <span className="font-semibold">【返品・交換不可の場合】</span><br />
                  ・お客様のご都合による返品（イメージと違う、サイズが合わない等）<br />
                  ・お客様が使用・着用された商品<br />
                  ・お客様の責任で商品が破損・汚損した場合<br />
                  ・商品到着から8日以上経過した場合<br />
                  ・商品タグが切り離されている場合<br />
                  ・ご注文時に「返品不可」と明記されている商品<br /><br />
                  
                  詳細は<a href="/policies" className="text-blue-600 hover:underline">各種ポリシー</a>をご確認ください。
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">キャンセルについて</h2>
                <p className="mb-4">
                  商品発送前であればキャンセル可能です。<br />
                  お問い合わせフォームよりご連絡ください。<br />
                  ※商品発送後のキャンセルはお受けできません。返品の手続きとなります。<br />
                  ※予約商品、受注生産品はキャンセル不可となります。
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">販売数量の制限</h2>
                <p className="mb-4">
                  商品によっては、お一人様あたりの購入数量に制限を設けている場合がございます。<br />
                  制限がある場合は、商品ページにその旨を表示いたします。
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">販売条件の有効期限</h2>
                <p className="mb-4">
                  商品ページに表示されている価格や販売条件は、予告なく変更される場合があります。<br />
                  また、セール価格や特典などは、各セール・キャンペーンの期間内のみ有効です。
                </p>
              </div>
            </section>
            
            <section>
              <div className="border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">定期購入契約について</h2>
                <p className="mb-4">
                  当サイトでは、一部商品について定期購入契約を提供しております。<br />
                  定期購入の詳細（購入頻度、割引率、解約方法等）は、各商品のご購入ページにてご確認いただけます。<br />
                  定期購入の解約は、次回お届け予定日の10日前までにお問い合わせフォームよりご連絡ください。
                </p>
              </div>
            </section>
            
            <section>
              <div>
                <h2 className="text-lg font-semibold mb-2">商品の表示について</h2>
                <p className="mb-4">
                  商品写真はできる限り実物に近い色味で掲載しておりますが、お客様がご利用のモニターやデバイスによって色味が異なって見える場合がございます。<br />
                  また、商品のデザイン・仕様は予告なく変更される場合がございますので、あらかじめご了承ください。
                </p>
              </div>
            </section>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ご不明点がございましたら、<a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a>よりご連絡ください。
          </p>
        </div>
      </div>
  );
}
