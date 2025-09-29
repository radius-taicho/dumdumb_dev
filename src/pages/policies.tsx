import React, { useState } from 'react';

export default function Policies() {
  const [activeTab, setActiveTab] = useState('privacy');
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'privacy':
        return (
          <div className="policy-content">
            <h2 className="text-2xl font-semibold mb-6">プライバシーポリシー</h2>
            <p className="text-sm text-gray-500 mb-6">最終更新日: 2025年4月1日</p>
            
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-3">1. 基本方針</h3>
                <p>
                  株式会社dumdumb（以下「当社」）は、お客様のプライバシーを尊重し、個人情報の保護に関する法律、その他の関係法令を遵守します。
                  当社は、本プライバシーポリシーに基づき、適切に個人情報を取り扱います。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">2. 個人情報の定義</h3>
                <p>
                  本プライバシーポリシーにおいて個人情報とは、個人情報保護法第2条第1項により定義された個人情報、
                  すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により
                  特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができるものを含みます）、
                  また、個人識別符号が含まれるものを指します。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">3. 個人情報の収集方法</h3>
                <p>当社は、以下の方法で個人情報を取得します：</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>当社ウェブサイトでのアカウント登録時</li>
                  <li>商品・サービスの購入時</li>
                  <li>メールマガジンの購読申込時</li>
                  <li>お問い合わせフォームからのご連絡時</li>
                  <li>キャンペーンやアンケートへの参加時</li>
                  <li>当社ウェブサイトの閲覧時（Cookie等の技術を使用）</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">4. 収集する個人情報の種類</h3>
                <p>当社は、以下の個人情報を収集することがあります：</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>氏名</li>
                  <li>住所</li>
                  <li>電話番号</li>
                  <li>メールアドレス</li>
                  <li>生年月日</li>
                  <li>性別</li>
                  <li>クレジットカード情報（決済時のみ）</li>
                  <li>購入履歴</li>
                  <li>当社ウェブサイトでの行動履歴</li>
                  <li>IPアドレス</li>
                  <li>Cookie情報</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">5. 個人情報の利用目的</h3>
                <p>当社は、取得した個人情報を以下の目的で利用します：</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>商品・サービスの提供</li>
                  <li>注文処理、発送、請求</li>
                  <li>お問い合わせへの対応</li>
                  <li>新商品、キャンペーン等のお知らせ</li>
                  <li>サービス改善のための調査・分析</li>
                  <li>不正アクセス、不正利用の防止</li>
                  <li>その他、上記利用目的に付随する目的</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">6. 個人情報の第三者提供</h3>
                <p>
                  当社は、法令に基づく場合を除いて、お客様の同意なく個人情報を第三者に提供することはありません。
                  ただし、以下の場合には、当社の責任において、個人情報を提供することがあります：
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>商品配送のために配送業者に提供する場合</li>
                  <li>決済処理のために決済サービス会社に提供する場合</li>
                  <li>法令に基づく場合</li>
                  <li>人の生命、身体または財産の保護のために必要がある場合</li>
                  <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                  <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">7. 個人情報の安全管理</h3>
                <p>
                  当社は、個人情報の正確性を保ち、不正アクセス、紛失、破壊、改ざん、漏洩等を防止するため、
                  適切な安全管理措置を講じます。また、個人情報を取り扱う従業者に対して、個人情報の適切な取扱いについて教育を行います。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">8. Cookie（クッキー）の使用について</h3>
                <p>
                  当社ウェブサイトでは、サービス向上やユーザー体験の改善のためにCookieを使用しています。
                  Cookieとは、ウェブサイトがお客様のコンピュータまたはモバイルデバイスに保存する小さなテキストファイルです。
                </p>
                <p className="mt-2">
                  当社が使用するCookieには以下の目的があります：
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>ログイン状態の維持</li>
                  <li>カートの内容の保存</li>
                  <li>サイト利用状況の分析</li>
                  <li>広告配信の最適化</li>
                </ul>
                <p className="mt-2">
                  お客様は、ブラウザの設定によりCookieの受け入れを拒否することができますが、
                  その場合、当サイトの一部の機能が正常に動作しない可能性があります。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">9. お子様の個人情報</h3>
                <p>
                  当社は、16歳未満のお子様から故意に個人情報を収集することはありません。
                  16歳未満のお子様が当社に個人情報を提供される場合は、保護者の同意のもとで行っていただくようお願いいたします。
                  お子様からの情報収集に気づいた場合は、速やかに削除などの対応をいたします。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">10. 個人情報の開示・訂正・削除</h3>
                <p>
                  お客様は、当社に対して個人情報の開示、訂正、追加、削除、利用停止または消去を請求することができます。
                  請求を行う場合は、本人確認のための書類をご提出いただく場合があります。
                </p>
                <p className="mt-2">
                  なお、一部の個人情報については、法令等により開示・訂正等の請求に応じられない場合があります。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">11. プライバシーポリシーの変更</h3>
                <p>
                  当社は、必要に応じて、本プライバシーポリシーを変更することがあります。
                  重要な変更がある場合は、当ウェブサイト上での告知などを通じてお知らせします。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">12. お問い合わせ</h3>
                <p>
                  個人情報の取扱いに関するお問い合わせは、以下の窓口までご連絡ください。<br /><br />
                  
                  株式会社dumdumb 個人情報保護管理者<br />
                  住所：東京都渋谷区渋谷1-2-3 dumdumbビル 5階<br />
                  メールアドレス：privacy@dumdumb.co.jp
                </p>
              </section>
            </div>
          </div>
        );
      
      case 'returns':
        return (
          <div className="policy-content">
            <h2 className="text-2xl font-semibold mb-6">返品・交換ポリシー</h2>
            <p className="text-sm text-gray-500 mb-6">最終更新日: 2025年4月1日</p>
            
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-3">1. 返品・交換の条件</h3>
                <p className="mb-3">
                  お客様のご満足と安心のために、当社では以下の条件で返品・交換を承っております。
                </p>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <h4 className="font-medium text-green-700">返品・交換可能な場合</h4>
                  <ul className="list-disc pl-6 mt-2 text-green-700">
                    <li>商品に不良がある場合</li>
                    <li>ご注文と異なる商品が届いた場合</li>
                    <li>配送中の破損が見られる場合</li>
                  </ul>
                  <p className="mt-2 text-green-700">上記の場合、送料は当社が負担いたします。</p>
                </div>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <h4 className="font-medium text-red-700">返品・交換ができない場合</h4>
                  <ul className="list-disc pl-6 mt-2 text-red-700">
                    <li>お客様のご都合による返品（イメージと違う、サイズが合わない等）</li>
                    <li>お客様が使用・着用された商品</li>
                    <li>お客様の責任で商品が破損・汚損した場合</li>
                    <li>商品到着から8日以上経過した場合</li>
                    <li>商品タグが切り離されている場合</li>
                    <li>衛生上の理由により返品できない商品（下着、水着など）</li>
                    <li>ご注文時に「返品不可」と明記されている商品</li>
                    <li>セール品、アウトレット品（不良品を除く）</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">2. 返品・交換の期限</h3>
                <p>
                  商品到着後7日以内に、メールまたはお電話にてご連絡ください。<br />
                  7日を過ぎた商品についての返品・交換はお受けできません。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">3. 返品・交換の手続き</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>当社カスタマーサポートまでメールまたはお電話にてご連絡ください。</li>
                  <li>返品・交換の理由をお知らせください。</li>
                  <li>当社より返品・交換の手続き方法についてご案内いたします。</li>
                  <li>指定の方法で商品をご返送ください。</li>
                  <li>商品の状態を確認後、交換品の発送または返金手続きを行います。</li>
                </ol>
                <p className="mt-3">
                  <span className="font-medium">メール：</span>support@dumdumb.co.jp<br />
                  <span className="font-medium">電話：</span>03-1234-5678（受付時間：平日10:00～18:00）
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">4. 返金について</h3>
                <p className="mb-3">
                  返品が承認された場合、以下の方法で返金いたします。
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="font-medium">クレジットカード決済：</span>
                    ご利用のクレジットカードへの返金処理を行います。カード会社の処理により、返金の反映までに1～2週間かかる場合があります。
                  </li>
                  <li>
                    <span className="font-medium">銀行振込：</span>
                    お客様の指定口座へ振込いたします。振込手数料は当社が負担いたします。
                  </li>
                  <li>
                    <span className="font-medium">PayPay、Amazon Pay等の電子決済：</span>
                    各決済サービスの規定に従って返金いたします。
                  </li>
                  <li>
                    <span className="font-medium">代金引換：</span>
                    銀行振込にて返金いたします。
                  </li>
                </ul>
                <p className="mt-3">
                  返金額には商品代金と対象商品の送料が含まれます（不良品・誤配送の場合）。<br />
                  お客様都合による返品の場合、送料はお客様負担となります。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">5. 不良品・誤配送の場合</h3>
                <p>
                  商品に不良がある場合、または誤った商品が届いた場合は、直ちにカスタマーサポートまでご連絡ください。<br />
                  商品の写真をメールに添付していただくか、状況の詳細をお知らせいただくとスムーズに対応できます。<br />
                  この場合の返送料・交換にかかる送料は当社が負担いたします。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">6. 返送時の注意事項</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>商品は購入時の状態でお送りください（商品タグは切り離さないでください）。</li>
                  <li>可能な限り、商品の梱包材や外箱もご返送ください。</li>
                  <li>領収書、保証書などの付属品も一緒にご返送ください。</li>
                  <li>返品理由を簡単に記したメモを同梱いただけると助かります。</li>
                  <li>配送中の破損を防ぐため、適切に梱包してください。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">7. キャンセルポリシー</h3>
                <p className="mb-3">
                  ご注文後のキャンセルについては、以下のポリシーを適用いたします。
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="font-medium">発送前：</span>
                    商品発送前であればキャンセル可能です。カスタマーサポートまでご連絡ください。
                  </li>
                  <li>
                    <span className="font-medium">発送後：</span>
                    商品発送後のキャンセルはお受けできません。返品の手続きをお願いいたします。
                  </li>
                  <li>
                    <span className="font-medium">予約商品・受注生産品：</span>
                    予約商品、受注生産品については、原則としてキャンセルをお受けできません。
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">8. お問い合わせ</h3>
                <p>
                  返品・交換に関するご質問やご不明点がございましたら、カスタマーサポートまでお気軽にお問い合わせください。<br /><br />
                  
                  株式会社dumdumb カスタマーサポート<br />
                  メール：support@dumdumb.co.jp<br />
                  電話：03-1234-5678（受付時間：平日10:00～18:00）<br />
                  お問い合わせフォーム：<a href="/contact" className="text-blue-600 hover:underline">こちら</a>
                </p>
              </section>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="policy-content">
            <h2 className="text-2xl font-semibold mb-6">セキュリティポリシー</h2>
            <p className="text-sm text-gray-500 mb-6">最終更新日: 2025年4月1日</p>
            
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-3">1. セキュリティに対する取り組み</h3>
                <p>
                  株式会社dumdumbは、お客様の個人情報と取引の安全性を最優先事項と考えています。
                  当社では、情報セキュリティを確保するために、技術的、組織的、物理的なセキュリティ対策を講じています。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">2. SSL暗号化通信</h3>
                <p>
                  当サイトでは、お客様の個人情報を保護するために、SSL（Secure Socket Layer）暗号化技術を使用しています。
                  SSLは、お客様のブラウザと当サイトのサーバー間でやり取りされる情報を暗号化し、第三者による情報の傍受や改ざんを防ぎます。
                </p>
                <p className="mt-2">
                  当サイトがSSL暗号化通信を使用している場合、ブラウザのアドレスバーに鍵マークが表示され、URLが「https://」で始まります。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">3. クレジットカード情報の取り扱い</h3>
                <p>
                  お客様のクレジットカード情報は、国際的なセキュリティ基準であるPCI DSS（Payment Card Industry Data Security Standard）に準拠した
                  決済代行会社を通じて処理されます。当社では、クレジットカード番号の全桁を保存することはありません。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">4. アカウントセキュリティ</h3>
                <p className="mb-3">
                  お客様のアカウント情報を保護するために、以下の対策を実施しています：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>パスワードの暗号化保存</li>
                  <li>一定回数のログイン失敗によるアカウントロック</li>
                  <li>定期的なセキュリティ監査</li>
                </ul>
                <p className="mt-3">
                  また、お客様ご自身でも以下のセキュリティ対策をお願いいたします：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>強力なパスワードの使用（8文字以上で、大文字、小文字、数字、記号を含む）</li>
                  <li>他のサイトと同じパスワードを使用しない</li>
                  <li>定期的なパスワードの変更</li>
                  <li>共有デバイスでのログイン後は必ずログアウト</li>
                  <li>不審なメールやリンクに注意する</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">5. フィッシング詐欺対策</h3>
                <p>
                  当社を装った偽のウェブサイトやメールにご注意ください。正規のメールは必ず当社の公式ドメイン「@dumdumb.co.jp」から送信されます。
                  当社がメールでお客様のパスワードやクレジットカード情報を直接尋ねることはありません。
                </p>
                <p className="mt-2">
                  不審なメールを受け取った場合は、リンクをクリックせず、添付ファイルを開かないでください。
                  また、当社カスタマーサポートまでご連絡いただければ幸いです。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">6. システムセキュリティ</h3>
                <p>
                  当社のウェブサイトとバックエンドシステムは、以下のセキュリティ対策を実施しています：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>ファイアウォールによる不正アクセスの防止</li>
                  <li>ウイルス対策ソフトウェアの導入</li>
                  <li>定期的なセキュリティアップデートとパッチ適用</li>
                  <li>不正アクセス検知システムの導入</li>
                  <li>定期的なセキュリティ監査とぜい弱性テスト</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">7. 従業員教育</h3>
                <p>
                  当社では、全従業員に対して定期的な情報セキュリティ研修を実施し、個人情報の適切な取り扱いとセキュリティ意識の向上に努めています。
                  また、個人情報へのアクセス権限は、業務上必要な従業員のみに制限しています。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">8. セキュリティインシデント対応</h3>
                <p>
                  万が一、セキュリティインシデントが発生した場合、当社は迅速に対応し、影響を最小限に抑えるための措置を講じます。
                  また、法令に従い、必要に応じて関係機関とお客様への通知を行います。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">9. セキュリティポリシーの更新</h3>
                <p>
                  当社は、法令の改正や新たなセキュリティ技術の導入に伴い、本セキュリティポリシーを定期的に見直し、更新しています。
                  重要な変更がある場合は、当ウェブサイト上でお知らせいたします。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">10. お問い合わせ</h3>
                <p>
                  セキュリティに関するご質問やご懸念がある場合は、以下の連絡先までお問い合わせください。<br /><br />
                  
                  株式会社dumdumb セキュリティ管理部門<br />
                  メール：security@dumdumb.co.jp<br />
                  お問い合わせフォーム：<a href="/contact" className="text-blue-600 hover:underline">こちら</a>
                </p>
              </section>
            </div>
          </div>
        );
      
      case 'points':
        return (
          <div className="policy-content">
            <h2 className="text-2xl font-semibold mb-6">ポイントポリシー</h2>
            <p className="text-sm text-gray-500 mb-6">最終更新日: 2025年4月1日</p>
            
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-3">1. ポイントプログラムの概要</h3>
                <p>
                  dumdumbポイントプログラムは、お客様のお買い物や各種アクティビティに対して還元するサービスです。
                  貯まったポイントは、次回以降のお買い物でご利用いただけます。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">2. ポイントの貯め方</h3>
                <p className="mb-3">
                  以下の方法でポイントを貯めることができます：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="font-medium">商品購入：</span>
                    商品代金（税抜）の100円につき1ポイント（1ポイント=1円相当）
                  </li>
                  <li>
                    <span className="font-medium">会員登録：</span>
                    新規会員登録で500ポイント
                  </li>
                  <li>
                    <span className="font-medium">お誕生日ポイント：</span>
                    登録しているお誕生月に500ポイント
                  </li>
                  <li>
                    <span className="font-medium">レビュー投稿：</span>
                    商品レビュー投稿で1件につき50ポイント
                  </li>
                  <li>
                    <span className="font-medium">SNSシェア：</span>
                    商品をSNSでシェアで1件につき30ポイント
                  </li>
                  <li>
                    <span className="font-medium">友達紹介：</span>
                    紹介した友達が会員登録完了で500ポイント、初回購入完了でさらに500ポイント
                  </li>
                  <li>
                    <span className="font-medium">キャンペーン：</span>
                    期間限定キャンペーンでの特別ポイント
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">3. ポイントの使い方</h3>
                <p className="mb-3">
                  貯まったポイントは以下の方法でご利用いただけます：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>1ポイント=1円として、お買い物時に利用可能</li>
                  <li>1ポイントから利用可能（一部の商品を除く）</li>
                  <li>ポイントは割引クーポンと併用可能（一部キャンペーンを除く）</li>
                  <li>ポイントは購入時のお支払い画面で利用するポイント数を選択</li>
                </ul>
                <p className="mt-3">
                  以下の場合はポイントを利用できません：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>送料や手数料の支払い</li>
                  <li>「ポイント対象外」と表示されている商品</li>
                  <li>ギフトカードの購入</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">4. ポイントの有効期限</h3>
                <p>
                  ポイントの有効期限は、最終ポイント獲得日から1年間です。<br />
                  有効期限が近づいたポイントについては、メールでお知らせいたします。<br />
                  期限切れとなったポイントは自動的に失効し、復活することはできません。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">5. ポイントの確認方法</h3>
                <p>
                  現在のポイント残高や有効期限は、以下の方法で確認できます：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>マイページのポイント残高欄</li>
                  <li>購入履歴ページ</li>
                  <li>ポイント履歴ページ</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">6. ポイントに関する注意事項</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>ポイントは、ご本人様のみ利用可能で、他の方への譲渡はできません。</li>
                  <li>不正行為によって取得されたポイントは無効となります。</li>
                  <li>返品・キャンセルがあった場合、該当商品で付与されたポイントは取り消されます。</li>
                  <li>ポイントを利用した注文をキャンセルした場合、利用されたポイントは返還されます。</li>
                  <li>ポイントの換金はできません。</li>
                  <li>アカウント削除時、保有ポイントは失効します。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">7. ポイントプログラムの変更・終了</h3>
                <p>
                  当社は、事前の予告なくポイントプログラムの内容を変更、または終了する場合があります。<br />
                  ただし、重要な変更や終了の場合は、事前にウェブサイトやメールでお知らせいたします。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-3">8. お問い合わせ</h3>
                <p>
                  ポイントに関するご質問やご不明点がございましたら、カスタマーサポートまでお問い合わせください。<br /><br />
                  
                  株式会社dumdumb カスタマーサポート<br />
                  メール：support@dumdumb.co.jp<br />
                  電話：03-1234-5678（受付時間：平日10:00～18:00）<br />
                  お問い合わせフォーム：<a href="/contact" className="text-blue-600 hover:underline">こちら</a>
                </p>
              </section>
            </div>
          </div>
        );
    }
  };
  
  return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">各種ポリシー</h1>
        
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button 
            className={`px-4 py-2 rounded-full ${activeTab === 'privacy' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('privacy')}
          >
            プライバシーポリシー
          </button>
          <button 
            className={`px-4 py-2 rounded-full ${activeTab === 'returns' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('returns')}
          >
            返品・交換ポリシー
          </button>
          <button 
            className={`px-4 py-2 rounded-full ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('security')}
          >
            セキュリティポリシー
          </button>
          <button 
            className={`px-4 py-2 rounded-full ${activeTab === 'points' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('points')}
          >
            ポイントポリシー
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          {renderTabContent()}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ポリシーに関するご質問がございましたら、<a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a>よりご連絡ください。
          </p>
        </div>
      </div>
  );
}
