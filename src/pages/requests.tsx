import React from 'react';

export default function Requests() {
  return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">お客様へのお願い</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <p className="text-sm text-gray-500 mb-8">
            当サイトをご利用いただくお客様に、より快適で安心なお買い物をしていただくために、
            以下のお願いをさせていただいております。ご理解とご協力をお願いいたします。
          </p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">1. お届け・受け取りについて</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">配達時のご在宅について</h3>
                  <p>
                    配達予定日時にはできるだけご在宅いただき、商品をお受け取りください。
                    ご不在が予想される場合は、配達日時の変更をお願いいたします。
                    長期不在が予想される場合は、事前にご連絡いただければ出荷を調整させていただきます。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">配達員への対応について</h3>
                  <p>
                    配達員は多くのお客様へ商品をお届けするため、効率的な配達を心がけております。
                    スムーズな配達にご協力をお願いいたします。
                    また、配達員に対する誹謗中傷や過度な要求はご遠慮ください。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">商品受け取り時の確認</h3>
                  <p>
                    商品受け取り時には、できるだけその場で外装に破損がないかご確認ください。
                    明らかな破損や配送中の事故が疑われる場合は、配達員の方にその場でお伝えいただくか、
                    すぐに当社カスタマーサポートにご連絡ください。
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">2. 商品の取り扱いについて</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">商品の確認</h3>
                  <p>
                    商品到着後は、できるだけ早めに内容物をご確認ください。
                    商品の不足や不良がある場合は、商品到着後7日以内にご連絡ください。
                    期間を過ぎますと、対応できない場合がございます。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">お取扱い方法の確認</h3>
                  <p>
                    商品に同梱されている取扱説明書やケア方法をご確認の上、適切にご使用ください。
                    特に衣類や精密機器などは、適切なお手入れが商品の寿命を延ばします。
                    取扱説明書を紛失された場合は、当社ウェブサイトでも確認できる場合がございます。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">返品・交換時の商品状態</h3>
                  <p>
                    返品・交換をご希望の場合は、商品を使用せず、タグや付属品を取り外さないままの状態でご返送ください。
                    商品の箱や梱包材も可能な限りそのまま使用してご返送いただけますと幸いです。
                    返品・交換の詳細については、<a href="/policies" className="text-blue-600 hover:underline">返品・交換ポリシー</a>をご確認ください。
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">3. お支払いについて</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">お支払い期限の厳守</h3>
                  <p>
                    銀行振込やコンビニ決済をご選択の場合は、指定の期限内にお支払いをお願いいたします。
                    期限を過ぎますと、ご注文がキャンセルとなる場合がございます。
                    やむを得ない事情でお支払いが遅れる場合は、事前にご連絡ください。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">代金引換の受け取り</h3>
                  <p>
                    代金引換をご選択の場合は、配達時に配達員に代金をお支払いください。
                    できるだけ釣り銭のないようにご準備いただけますと助かります。
                    また、受け取り拒否や長期不在による返送が発生した場合、再配達料や返送料をご負担いただく場合がございます。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">クレジットカード情報の管理</h3>
                  <p>
                    クレジットカード情報は、お客様ご自身の責任で適切に管理してください。
                    当社がメールやお電話でクレジットカード情報をお尋ねすることはありません。
                    不審なメールや電話にはご注意ください。
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">4. マナーとコミュニケーションについて</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">カスタマーサポートへのお問い合わせ</h3>
                  <p>
                    カスタマーサポートへのお問い合わせは、できるだけ具体的な情報（注文番号、商品名、お問い合わせ内容など）を
                    明記していただけますとスムーズな対応が可能です。
                    また、対応させていただくスタッフは誠心誠意対応いたしますので、
                    礼節を持ったコミュニケーションにご協力ください。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">SNSでの投稿について</h3>
                  <p>
                    当社商品をSNSに投稿いただく際は、個人情報や他のお客様のプライバシーに配慮した内容でお願いいたします。
                    また、当社や当社商品に関する誤った情報の拡散はお控えください。
                    ご不明点やご不満がある場合は、まずはカスタマーサポートにご連絡いただければ幸いです。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">レビュー投稿について</h3>
                  <p>
                    商品レビューは、他のお客様の参考になる貴重な情報源です。
                    商品の良い点、改善してほしい点など、率直なご意見をお寄せください。
                    ただし、事実と異なる内容や誹謗中傷にあたる表現はお控えいただきますようお願いいたします。
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">5. 個人情報の取り扱いについて</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">個人情報の正確な入力</h3>
                  <p>
                    ご注文時やアカウント登録時には、正確な個人情報をご入力ください。
                    特に配送先住所や電話番号に誤りがあると、商品をお届けできない場合があります。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">個人情報の更新</h3>
                  <p>
                    住所や電話番号などの個人情報に変更があった場合は、マイページから速やかに更新してください。
                    特に定期購入をご利用のお客様は、配送トラブルを防ぐためにも最新の情報に更新をお願いいたします。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">アカウント情報の管理</h3>
                  <p>
                    ログインID（メールアドレス）とパスワードは、第三者に知られないよう適切に管理してください。
                    不正アクセスの兆候を感じた場合は、すぐにパスワードを変更し、カスタマーサポートにご連絡ください。
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">6. 環境への配慮について</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">梱包材のリサイクル</h3>
                  <p>
                    当社では環境に配慮した梱包を心がけておりますが、お受け取りいただいた梱包材は
                    可能な限りリサイクルへのご協力をお願いいたします。
                    ダンボールや紙袋は分別して資源ごみとして処理いただければ幸いです。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">ペーパーレス化へのご協力</h3>
                  <p>
                    当社では環境負荷低減のため、納品書や領収書の電子化を進めております。
                    マイページから電子データでの確認が可能ですので、ご活用ください。
                    紙での発行をご希望の場合は、注文時にその旨をお知らせください。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">商品の適切な廃棄</h3>
                  <p>
                    ご不要になった商品は、各自治体のルールに従って適切に廃棄をお願いいたします。
                    特に電池や電子機器などは、環境に配慮した処分方法をご検討ください。
                    一部商品については、当社でリサイクルを行っている場合もございますので、詳細はお問い合わせください。
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">7. 商品の使用に関する注意事項</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">安全な使用方法の厳守</h3>
                  <p>
                    商品付属の取扱説明書や当社ウェブサイトに記載されている使用方法、注意事項を必ずお守りください。
                    特に、お子様向け商品や電化製品など、誤った使用方法によって事故や怪我につながる可能性がある商品については、
                    十分にご注意ください。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">商品の目的外使用の禁止</h3>
                  <p>
                    商品は、本来の用途や目的以外での使用はお控えください。
                    目的外の使用による故障や事故については、当社では責任を負いかねます。
                    使用方法についてご不明な点がある場合は、ご使用前にカスタマーサポートにお問い合わせください。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">アレルギーや肌質への配慮</h3>
                  <p>
                    化粧品や食品など、アレルギーの原因となる可能性がある商品については、
                    必ず成分表示をご確認いただき、ご自身の体質に合わないと思われる場合はご使用をお控えください。
                    また、初めて使用する化粧品などは、事前にパッチテストを行うことをおすすめします。
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">8. 不適切な行為の禁止</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">不正注文・不正受取の禁止</h3>
                  <p>
                    他人の個人情報や支払い手段を不正に使用したり、架空の住所や氏名での注文は固く禁止しております。
                    このような行為が確認された場合は、注文のキャンセルや法的措置を取らせていただく場合がございます。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">転売目的の大量購入の禁止</h3>
                  <p>
                    転売目的での大量購入や、当社が定める購入制限を超える注文はご遠慮ください。
                    多くのお客様に公平に商品をお届けするため、ご理解とご協力をお願いいたします。
                    転売目的と判断した場合は、ご注文をキャンセルさせていただく場合がございます。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">ハラスメント行為の禁止</h3>
                  <p>
                    当社スタッフや配達員に対する言葉の暴力、脅迫、不当な要求などのハラスメント行為は固くお断りいたします。
                    お客様と当社の良好な関係を維持するため、相互の尊重と理解にご協力ください。
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            お願い事項に関してご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg inline-block">
            <p className="font-medium text-blue-800">
              お客様のご理解とご協力を心よりお願い申し上げます。<br />
              より良いサービスを提供するため、これからもdumdumbをよろしくお願いいたします。
            </p>
          </div>
        </div>
      </div>
  );
}
