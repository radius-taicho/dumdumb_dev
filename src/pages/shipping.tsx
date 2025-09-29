import React from "react";

export default function Shipping() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">送料・配送情報</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <p className="text-sm text-gray-500 mb-6">
          当サイトの配送に関する詳細情報です。商品のお届けについて、ご不明な点がございましたらお気軽にお問い合わせください。
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
              1. 送料について
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">基本送料</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b border-r border-gray-300 text-left">
                        お買い上げ金額
                      </th>
                      <th className="py-2 px-4 border-b border-r border-gray-300 text-center">
                        本州・四国
                      </th>
                      <th className="py-2 px-4 border-b border-r border-gray-300 text-center">
                        北海道・九州
                      </th>
                      <th className="py-2 px-4 border-b border-gray-300 text-center">
                        沖縄・離島
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        3,000円未満
                      </td>
                      <td className="py-2 px-4 border-b border-r border-gray-300 text-center">
                        770円
                      </td>
                      <td className="py-2 px-4 border-b border-r border-gray-300 text-center">
                        880円
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        1,320円
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        3,000円〜5,999円
                      </td>
                      <td className="py-2 px-4 border-b border-r border-gray-300 text-center">
                        550円
                      </td>
                      <td className="py-2 px-4 border-b border-r border-gray-300 text-center">
                        660円
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        1,100円
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        6,000円〜9,999円
                      </td>
                      <td className="py-2 px-4 border-b border-r border-gray-300 text-center">
                        330円
                      </td>
                      <td className="py-2 px-4 border-b border-r border-gray-300 text-center">
                        440円
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        880円
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        10,000円以上
                      </td>
                      <td className="py-2 px-4 border-b border-r border-gray-300 text-center font-medium text-green-600">
                        無料
                      </td>
                      <td className="py-2 px-4 border-b border-r border-gray-300 text-center font-medium text-green-600">
                        無料
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center font-medium text-green-600">
                        無料
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                ※表示価格はすべて税込みです。
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">
                大型商品・特別配送商品
              </h3>
              <p className="mb-2">
                家具、大型家電など、大型商品や特別な配送方法が必要な商品については、商品ページに個別の送料を表示しております。
              </p>
              <p className="text-sm text-gray-600">
                ※大型商品は、お買い上げ金額に関わらず送料無料の対象外となる場合がございます。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">送料無料キャンペーン</h3>
              <p className="mb-2">
                期間限定で全国送料無料キャンペーンを実施する場合がございます。
                <br />
                キャンペーン中は、通常送料無料の対象外となる商品（大型商品など）も送料無料となる場合がございます。
                <br />
                キャンペーンの詳細はトップページまたはお知らせページでご確認ください。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
              2. 配送方法
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">配送業者</h3>
              <p className="mb-2">
                以下の配送業者を利用して商品をお届けいたします：
              </p>
              <ul className="list-disc pl-6 mb-2">
                <li>ヤマト運輸</li>
                <li>佐川急便</li>
                <li>日本郵便</li>
              </ul>
              <p className="text-sm text-gray-600">
                ※配送業者のご指定はできません。商品サイズ、配送先、在庫状況等により当社が判断いたします。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">配達日時指定</h3>
              <p className="mb-3">
                ご注文時に、以下の配達希望日時のご指定が可能です。
              </p>

              <p className="font-medium mb-2">【配達希望日】</p>
              <p className="mb-3">
                ご注文日から3日後〜14日後の範囲でご指定いただけます。
                <br />
                ※予約商品、お取り寄せ商品は商品ページに記載の発送予定日以降となります。
              </p>

              <p className="font-medium mb-2">【配達希望時間帯】</p>
              <ul className="list-disc pl-6 mb-3">
                <li>午前中（8:00〜12:00）</li>
                <li>14:00〜16:00</li>
                <li>16:00〜18:00</li>
                <li>18:00〜20:00</li>
                <li>19:00〜21:00</li>
              </ul>

              <p className="text-sm text-gray-600">
                ※配送業者の繁忙状況や天候等により、ご希望に添えない場合がございます。
                <br />
                ※一部地域では時間帯指定をご利用いただけない場合がございます。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
              3. 配送日数
            </h2>

            <div>
              <p className="mb-3">
                当社物流センターから各都道府県までの通常配送日数の目安は以下の通りです。
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b border-r border-gray-300 text-left">
                        お届けエリア
                      </th>
                      <th className="py-2 px-4 border-b border-gray-300 text-center">
                        配送日数の目安
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        関東地方（東京、神奈川、千葉、埼玉、茨城、栃木、群馬）
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        1〜2日
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        近畿地方（大阪、京都、兵庫、滋賀、奈良、和歌山）
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        1〜2日
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        中部地方（愛知、岐阜、静岡、三重、山梨、新潟、富山、石川、福井、長野）
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        1〜3日
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        中国・四国地方
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        2〜3日
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        東北地方
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        2〜4日
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        北海道・九州地方
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        3〜5日
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b border-r border-gray-300">
                        沖縄・離島
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-center">
                        4〜7日
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                ※上記日数は、ご注文商品の在庫がある場合の目安です。
                <br />
                ※土日祝日、年末年始、ゴールデンウィーク、お盆期間は通常より配送に時間がかかる場合がございます。
                <br />
                ※天候や交通状況により配送遅延が発生する場合がございます。
                <br />
                ※離島など一部地域では、さらに配送日数がかかる場合がございます。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
              4. 配送に関する注意事項
            </h2>

            <div>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium">ご不在時の対応：</span>
                  配達時にご不在の場合は、配送業者が不在票を投函いたします。不在票に記載の連絡先へご連絡いただき、再配達のご依頼をお願いいたします。
                </li>
                <li>
                  <span className="font-medium">長期不在の場合：</span>
                  長期のご不在が予想される場合は、事前にお問い合わせフォームよりご連絡ください。出荷を一時的に保留することも可能です。
                </li>
                <li>
                  <span className="font-medium">配送先の変更：</span>
                  ご注文確定後の配送先の変更は、商品発送前であれば対応可能です。お問い合わせフォームよりご連絡ください。
                </li>
                <li>
                  <span className="font-medium">
                    受け取り拒否・長期不在による返送：
                  </span>
                  お客様のご都合による受け取り拒否や長期不在による返送が発生した場合、往復の送料および手数料をご負担いただきます。
                </li>
                <li>
                  <span className="font-medium">梱包について：</span>
                  商品の破損防止のため、適切な梱包を行っております。環境に配慮し、可能な限り簡易包装を心がけております。
                </li>
                <li>
                  <span className="font-medium">複数商品のご注文：</span>
                  複数の商品をご注文いただいた場合、在庫状況により別々のお届けとなる場合がございます。その場合でも、送料は一度のご注文分としてご請求いたします。
                </li>
                <li>
                  <span className="font-medium">海外発送：</span>
                  誠に申し訳ございませんが、現在、海外への発送は行っておりません。
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
              5. 配送状況の確認方法
            </h2>

            <div>
              <p className="mb-4">
                商品発送後、ご登録のメールアドレスに発送完了メールをお送りいたします。
                <br />
                メール内に記載の追跡番号から、配送状況をご確認いただけます。
              </p>

              <p className="mb-2">
                また、マイページの「注文履歴」からも配送状況をご確認いただけます。
                <br />
                注文履歴に表示される「配送状況を確認」ボタンから、配送業者の追跡ページへ移動できます。
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          配送に関するお問い合わせは、
          <a href="/contact" className="text-blue-600 hover:underline">
            お問い合わせフォーム
          </a>
          よりご連絡ください。
          <br />
          できる限り迅速に対応させていただきます。
        </p>
      </div>
    </div>
  );
}
