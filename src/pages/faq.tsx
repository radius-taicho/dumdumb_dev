import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

// FAQカテゴリータイプ
type FAQCategory = '注文・支払い' | '配送・受取' | '返品・交換' | '会員・アカウント' | '商品について' | 'ポイント・クーポン' | 'その他';

// FAQ項目の型
interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: React.ReactNode;
}

export default function FAQ() {
  // 検索キーワード
  const [searchQuery, setSearchQuery] = useState('');
  // 選択中のカテゴリー
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');
  // 開いている質問のID
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  // カテゴリーリスト
  const categories: FAQCategory[] = [
    '注文・支払い',
    '配送・受取',
    '返品・交換',
    '会員・アカウント',
    '商品について',
    'ポイント・クーポン',
    'その他'
  ];

  // FAQ項目リスト
  const faqItems: FAQItem[] = [
    {
      id: 'order-1',
      category: '注文・支払い',
      question: '注文後にキャンセルはできますか？',
      answer: (
        <div>
          <p className="mb-3">商品の発送前であればキャンセルが可能です。マイページの注文履歴から該当の注文を選択し、キャンセル手続きを行ってください。</p>
          <p className="mb-3">なお、以下の場合はキャンセルができませんのでご注意ください：</p>
          <ul className="list-disc pl-5 mb-3">
            <li>既に商品が発送済みの場合</li>
            <li>予約商品や受注生産品として明記されている商品</li>
            <li>カスタマイズやオーダーメイド商品</li>
          </ul>
          <p>商品発送後のキャンセルについては、商品到着後に返品の手続きをお願いいたします。詳細は<a href="/policies" className="text-blue-600 hover:underline">返品・交換ポリシー</a>をご確認ください。</p>
        </div>
      )
    },
    {
      id: 'order-2',
      category: '注文・支払い',
      question: '支払い方法にはどのような種類がありますか？',
      answer: (
        <div>
          <p className="mb-3">以下の支払い方法をご利用いただけます：</p>
          <ul className="list-disc pl-5">
            <li>クレジットカード（VISA、MasterCard、JCB、American Express、Diners Club）</li>
            <li>コンビニ決済</li>
            <li>銀行振込（前払い）</li>
            <li>PayPay</li>
            <li>Amazon Pay</li>
            <li>代金引換（手数料330円税込）</li>
          </ul>
        </div>
      )
    },
    {
      id: 'order-3',
      category: '注文・支払い',
      question: '注文した商品の変更はできますか？',
      answer: (
        <p>
          商品の発送前であれば、サイズや色などの変更が可能な場合があります。お問い合わせフォームより、注文番号と変更希望内容をお知らせください。
          ただし、在庫状況や商品の種類によっては変更をお受けできない場合もございますので、あらかじめご了承ください。
        </p>
      )
    },
    {
      id: 'shipping-1',
      category: '配送・受取',
      question: '配送にはどのくらいの日数がかかりますか？',
      answer: (
        <div>
          <p className="mb-3">在庫のある商品は、ご注文確認後3営業日以内に発送いたします。お届けまでの目安は以下の通りです：</p>
          <ul className="list-disc pl-5 mb-3">
            <li>関東地方：1〜2日</li>
            <li>近畿地方：1〜2日</li>
            <li>中部地方：1〜3日</li>
            <li>中国・四国地方：2〜3日</li>
            <li>東北地方：2〜4日</li>
            <li>北海道・九州地方：3〜5日</li>
            <li>沖縄・離島：4〜7日</li>
          </ul>
          <p>詳細な配送情報は<a href="/shipping" className="text-blue-600 hover:underline">送料・配送情報</a>ページをご確認ください。</p>
        </div>
      )
    },
    {
      id: 'shipping-2',
      category: '配送・受取',
      question: '配送日時の指定はできますか？',
      answer: (
        <p>
          はい、配送日時の指定が可能です。ご注文時に、配達希望日（注文日から3日後〜14日後）と配達希望時間帯をお選びいただけます。
          ただし、一部地域では時間帯指定をご利用いただけない場合や、配送業者の繁忙状況により、ご希望に添えない場合もございますので、あらかじめご了承ください。
        </p>
      )
    },
    {
      id: 'shipping-3',
      category: '配送・受取',
      question: '注文した商品の配送状況を確認する方法は？',
      answer: (
        <p>
          商品発送後、ご登録のメールアドレスに発送完了メールをお送りいたします。メール内に記載の追跡番号から、配送状況をご確認いただけます。
          また、マイページの「注文履歴」からも配送状況をご確認いただけます。「配送状況を確認」ボタンから、配送業者の追跡ページへ移動できます。
        </p>
      )
    },
    {
      id: 'return-1',
      category: '返品・交換',
      question: '商品の返品・交換の条件を教えてください',
      answer: (
        <div>
          <p className="mb-3">以下の条件で返品・交換を承っております：</p>
          <p className="font-medium mb-2">【返品・交換可能な場合】</p>
          <ul className="list-disc pl-5 mb-3">
            <li>商品に不良がある場合</li>
            <li>ご注文と異なる商品が届いた場合</li>
            <li>配送中の破損が見られる場合</li>
          </ul>
          <p className="font-medium mb-2">【返品・交換ができない場合】</p>
          <ul className="list-disc pl-5 mb-3">
            <li>お客様のご都合による返品（イメージと違う、サイズが合わない等）</li>
            <li>お客様が使用・着用された商品</li>
            <li>お客様の責任で商品が破損・汚損した場合</li>
            <li>商品到着から8日以上経過した場合</li>
            <li>商品タグが切り離されている場合</li>
            <li>返品不可と明記されている商品</li>
          </ul>
          <p>詳細は<a href="/policies" className="text-blue-600 hover:underline">返品・交換ポリシー</a>をご確認ください。</p>
        </div>
      )
    },
    {
      id: 'return-2',
      category: '返品・交換',
      question: '返品・交換の手続き方法を教えてください',
      answer: (
        <div>
          <p className="mb-3">返品・交換の手続きは以下の手順で行ってください：</p>
          <ol className="list-decimal pl-5">
            <li className="mb-2">商品到着後7日以内に、カスタマーサポートまでメールまたはお電話にてご連絡ください。</li>
            <li className="mb-2">返品・交換の理由をお知らせください。</li>
            <li className="mb-2">当社より返品・交換の手続き方法についてご案内いたします。</li>
            <li className="mb-2">指定の方法で商品をご返送ください。</li>
            <li>商品の状態を確認後、交換品の発送または返金手続きを行います。</li>
          </ol>
        </div>
      )
    },
    {
      id: 'account-1',
      category: '会員・アカウント',
      question: '会員登録は必須ですか？',
      answer: (
        <p>
          会員登録は必須ではありませんが、登録することで以下の特典があります：<br />
          ・ポイントが貯まる（商品代金の1%）<br />
          ・注文履歴や配送状況の確認が簡単<br />
          ・お気に入り商品の保存<br />
          ・会員限定セールや先行販売へのアクセス<br />
          ・住所などの配送情報の保存<br />
          <br />
          非会員でもお買い物は可能ですが、上記の特典はご利用いただけません。
        </p>
      )
    },
    {
      id: 'account-2',
      category: '会員・アカウント',
      question: 'パスワードを忘れてしまいました',
      answer: (
        <p>
          ログインページの「パスワードをお忘れの方はこちら」をクリックし、登録済みのメールアドレスを入力してください。
          パスワードリセットのためのリンクをメールでお送りします。
          メールが届かない場合は、迷惑メールフォルダをご確認いただくか、別のメールアドレスで会員登録をされている可能性がありますので、
          他のメールアドレスもお試しください。
        </p>
      )
    },
    {
      id: 'product-1',
      category: '商品について',
      question: '商品のサイズ感について教えてください',
      answer: (
        <p>
          各商品ページに詳細な寸法を記載しておりますので、ご購入前にご確認ください。
          また、「サイズチャート」が用意されている商品については、一般的な日本のサイズ規格との比較表を参考にしていただけます。
          洋服などのサイズ感については、商品ページ内の「着用イメージ」や「レビュー」も参考になりますので、あわせてご覧ください。
          なお、サイズが合わない場合の返品・交換については、<a href="/policies" className="text-blue-600 hover:underline">返品・交換ポリシー</a>をご確認ください。
        </p>
      )
    },
    {
      id: 'product-2',
      category: '商品について',
      question: '取り扱いブランドやキャラクターについて教えてください',
      answer: (
        <p>
          当店では、人気アニメや漫画、ゲームなど様々なジャンルのキャラクターグッズを取り扱っております。
          現在取り扱い中のシリーズについては、トップページの「キャラクターシリーズ一覧」からご確認いただけます。
          また、新シリーズの取り扱い開始や再入荷情報などは、メールマガジンやSNSでいち早くお知らせしておりますので、
          ぜひフォローをお願いいたします。
        </p>
      )
    },
    {
      id: 'points-1',
      category: 'ポイント・クーポン',
      question: 'ポイントはどうやって貯まりますか？',
      answer: (
        <div>
          <p className="mb-3">以下の方法でポイントを貯めることができます：</p>
          <ul className="list-disc pl-5">
            <li>商品購入：商品代金（税抜）の100円につき1ポイント（1ポイント=1円相当）</li>
            <li>会員登録：新規会員登録で500ポイント</li>
            <li>お誕生日ポイント：登録しているお誕生月に500ポイント</li>
            <li>レビュー投稿：商品レビュー投稿で1件につき50ポイント</li>
            <li>SNSシェア：商品をSNSでシェアで1件につき30ポイント</li>
            <li>友達紹介：紹介した友達が会員登録完了で500ポイント、初回購入完了でさらに500ポイント</li>
            <li>キャンペーン：期間限定キャンペーンでの特別ポイント</li>
          </ul>
          <p className="mt-3">詳細は<a href="/policies" className="text-blue-600 hover:underline">ポイントポリシー</a>をご確認ください。</p>
        </div>
      )
    },
    {
      id: 'points-2',
      category: 'ポイント・クーポン',
      question: 'ポイントの有効期限はありますか？',
      answer: (
        <p>
          ポイントの有効期限は、最終ポイント獲得日から1年間です。
          有効期限が近づいたポイントについては、メールでお知らせいたします。
          期限切れとなったポイントは自動的に失効し、復活することはできませんので、
          期限内のご利用をお願いいたします。
          マイページの「ポイント履歴」から、現在のポイント残高と有効期限をご確認いただけます。
        </p>
      )
    },
    {
      id: 'points-3',
      category: 'ポイント・クーポン',
      question: 'クーポンはどのように使用できますか？',
      answer: (
        <div>
          <p className="mb-3">クーポンは以下の方法でご利用いただけます：</p>
          <ol className="list-decimal pl-5">
            <li className="mb-2">商品をカートに追加します。</li>
            <li className="mb-2">カート画面または注文確認画面で「クーポンコードを入力」欄にコードを入力します。</li>
            <li className="mb-2">「適用」ボタンをクリックすると、割引が適用されます。</li>
            <li>そのまま通常通り注文手続きを完了させてください。</li>
          </ol>
          <p className="mt-3">注意事項：</p>
          <ul className="list-disc pl-5">
            <li>クーポンには有効期限があります。</li>
            <li>一部の商品やセール品にはクーポンが適用できない場合があります。</li>
            <li>一度のご注文につき、使用できるクーポンは1つまでです。</li>
            <li>クーポンとポイントは併用可能です。</li>
          </ul>
        </div>
      )
    },
    {
      id: 'other-1',
      category: 'その他',
      question: '実店舗はありますか？',
      answer: (
        <div>
          <p className="mb-3">はい、現在以下の実店舗を運営しております：</p>
          <div className="mb-3">
            <p className="font-medium">dumdumb SHOP HARAJUKU</p>
            <p>〒150-0001 東京都渋谷区神宮前1-X-X XXビル 1F</p>
            <p>営業時間：11:00〜20:00（年中無休）</p>
            <p>アクセス：JR山手線「原宿駅」表参道口から徒歩5分</p>
          </div>
          <div>
            <p className="font-medium">dumdumb SHOP OSAKA</p>
            <p>〒530-0001 大阪府大阪市北区梅田X-X-X XXビル 2F</p>
            <p>営業時間：10:00〜21:00（年中無休）</p>
            <p>アクセス：JR「大阪駅」中央口から徒歩3分</p>
          </div>
        </div>
      )
    },
    {
      id: 'other-2',
      category: 'その他',
      question: '海外からの注文や海外発送は可能ですか？',
      answer: (
        <p>
          誠に申し訳ございませんが、現在、海外からのご注文および海外への発送は対応しておりません。
          将来的には海外のお客様にもご利用いただけるよう、サービス拡大を検討しておりますので、
          今しばらくお待ちください。最新情報はSNSや公式サイトでお知らせいたします。
        </p>
      )
    },
    {
      id: 'other-3',
      category: 'その他',
      question: 'ギフトラッピングサービスはありますか？',
      answer: (
        <div>
          <p className="mb-3">はい、ギフトラッピングサービスをご用意しております。料金と種類は以下の通りです：</p>
          <ul className="list-disc pl-5 mb-3">
            <li>簡易ラッピング（ギフト袋＋リボン）：220円（税込）/1点</li>
            <li>プレミアムラッピング（ギフトボックス＋リボン＋メッセージカード）：550円（税込）/1点</li>
          </ul>
          <p>
            ご注文の際、カート画面で「ギフトラッピングを希望する」を選択し、ラッピングの種類をお選びください。
            複数商品をご注文の場合、商品ごとに個別ラッピングも可能です。
            なお、商品の形状や大きさによっては対応できない場合もございますので、あらかじめご了承ください。
          </p>
        </div>
      )
    }
  ];

  // カテゴリーフィルター用の関数
  const filterByCategory = (items: FAQItem[]) => {
    if (selectedCategory === 'all') {
      return items;
    }
    return items.filter(item => item.category === selectedCategory);
  };

  // 検索フィルター用の関数
  const filterBySearch = (items: FAQItem[]) => {
    if (!searchQuery.trim()) {
      return items;
    }
    const query = searchQuery.toLowerCase();
    return items.filter(
      item => 
        item.question.toLowerCase().includes(query) || 
        (typeof item.answer === 'string' && item.answer.toLowerCase().includes(query))
    );
  };

  // フィルター適用（カテゴリー→検索の順）
  const filteredItems = filterBySearch(filterByCategory(faqItems));

  // 質問の開閉を切り替え
  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">よくある質問（FAQ）</h1>
      
      {/* 検索バー */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キーワードで検索..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </div>
      
      {/* カテゴリータブ */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          すべて
        </button>
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* FAQ項目リスト */}
      <div className="space-y-4 mb-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
              >
                <span className="font-medium pr-4">{item.question}</span>
                {openItemId === item.id ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                )}
              </button>
              
              {openItemId === item.id && (
                <div className="p-4 bg-gray-50 border-t">
                  {item.answer}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">検索条件に一致するFAQが見つかりませんでした。</p>
            <p className="text-sm text-gray-400">
              別のキーワードで検索するか、カテゴリーを変更してお試しください。
            </p>
          </div>
        )}
      </div>
      
      {/* 解決しなかった場合の案内 */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="font-semibold text-lg mb-3 text-blue-800">
          お探しの回答が見つかりませんか？
        </h2>
        <p className="mb-4 text-blue-700">
          よくある質問で解決しなかった場合は、お問い合わせフォームよりお気軽にご連絡ください。
          専門のスタッフが丁寧にお答えいたします。
        </p>
        <div className="text-center">
          <a
            href="/contact"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            お問い合わせはこちら
          </a>
        </div>
      </div>
    </div>
  );
}
