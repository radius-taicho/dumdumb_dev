import React from "react";
import { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import Layout from "@/components/Layout";

const CouponGuidePage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>クーポン利用ガイド | DumDumb</title>
        <meta
          name="description"
          content="DumDumbのクーポン利用方法についてのガイドです。"
        />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/guide">
            <span className="text-blue-600 hover:text-blue-800">
              ← ガイド一覧に戻る
            </span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center">
          クーポン利用ガイド
        </h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            DumDumbのクーポンについて
          </h2>
          <p className="mb-4">
            DumDumbでは、さまざまな特典がついたクーポンをご用意しています。
            お買い物をより便利でお得にお楽しみいただくために、ぜひクーポンをご活用ください。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">クーポンの種類</h3>
          <ul className="list-disc list-inside space-y-2 mb-6">
            <li>
              <span className="font-medium">パーセント割引クーポン：</span>
              アイテムの合計金額から一定の割合を割引します（例：20%オフ）
            </li>
            <li>
              <span className="font-medium">固定金額割引クーポン：</span>
              アイテムの合計金額から指定の金額を割引します（例：500円オフ）
            </li>
            <li>
              <span className="font-medium">特別イベントクーポン：</span>
              期間限定のセールやイベント限定で発行される特別なクーポンです
            </li>
            <li>
              <span className="font-medium">誕生日クーポン：</span>
              会員登録時に入力した誕生日月に自動的に発行される特別なクーポンです
            </li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="font-medium text-blue-700">クーポンコードの例</p>
            <p className="text-blue-600">
              WELCOME10（新規会員様10%オフ）、SUMMAR2025（夏季キャンペーン）、BIRTHDAY25（誕生日25%オフ）など
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            クーポンの使い方
          </h2>

          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-3">
                STEP 1: クーポンを入手する
              </h3>
              <p className="mb-2">クーポンは以下の方法で入手できます：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>新規会員登録時</li>
                <li>メールマガジンの購読</li>
                <li>誕生日月に自動発行</li>
                <li>期間限定キャンペーン</li>
                <li>会員ランクに応じた特典</li>
              </ul>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-3">
                STEP 2: マイページで確認
              </h3>
              <p className="mb-2">
                取得したクーポンは以下の場所で確認できます：
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <Link
                    href="/mypage/coupons-points?tab=coupons"
                    className="text-blue-600 hover:underline"
                  >
                    マイページ &gt; クーポン・ポイント &gt; クーポン
                  </Link>
                </li>
                <li>
                  クーポンコードとその詳細（割引率、有効期限）が確認できます
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-3">
                STEP 3: 購入時に適用
              </h3>
              <p className="mb-2">
                お買い物の際に以下の手順でクーポンを利用できます：
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>アイテムをカートに追加</li>
                <li>決済画面に進む</li>
                <li>「クーポンコードを入力」欄にコードを入力</li>
                <li>「適用」ボタンをクリック</li>
                <li>割引が適用された金額を確認</li>
              </ol>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-3">注意事項</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>クーポンには有効期限があります</li>
                <li>一部クーポンには最低購入金額があります</li>
                <li>1回のお買い物につき1つのクーポンのみ使用可能</li>
                <li>一部アイテムはクーポン対象外の場合があります</li>
                <li>クーポンとポイントは併用可能です</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            よくある質問
          </h2>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-2">
                クーポンを使用しましたが、割引が適用されていません
              </h4>
              <p>
                クーポンには使用条件があります。最低購入金額や対象アイテムをご確認ください。
                また、クーポンの有効期限が切れていないかも確認してください。
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">
                複数のクーポンを同時に使用できますか？
              </h4>
              <p>
                申し訳ございませんが、1回のお買い物につき使用できるクーポンは1つまでとなっております。
                最もお得なクーポンをお選びください。
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">
                クーポンとポイントを併用できますか？
              </h4>
              <p>
                はい、クーポンとポイントは併用可能です。まずクーポンで割引を適用した後、
                残りの金額に対してポイントを使用することができます。
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">
                クーポンの有効期限を延長できますか？
              </h4>
              <p>
                申し訳ございませんが、クーポンの有効期限の延長はできません。
                有効期限内にご利用いただきますようお願いいたします。
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">
                誕生日クーポンはいつ発行されますか？
              </h4>
              <p>
                誕生日クーポンは、会員登録時に登録した誕生日の月の1日に自動的に発行されます。
                有効期限は発行から30日間です。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/mypage/coupons-points?tab=coupons">
            <span className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              マイクーポンを確認する
            </span>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default CouponGuidePage;
