import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactElement } from "react";

const CheckoutCompletePage: NextPage = () => {
  const router = useRouter();
  const [opacity, setOpacity] = useState(1);
  const [blur, setBlur] = useState(0);
  const [scale, setScale] = useState(1);

  // 5秒後にトップページへのフェードアウト遷移を開始
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      // フェードアウト効果開始
      let progress = 0;

      const fadeOutInterval = setInterval(() => {
        progress += 0.01;

        if (progress >= 1) {
          clearInterval(fadeOutInterval);
          router.push("/");
          return;
        }

        // イージング関数を使用して自然なフェードアウト
        const easeOutValue = 1 - Math.pow(1 - progress, 3); // cubic ease out

        // 透明度を徐々に下げる (1 -> 0)
        setOpacity(1 - easeOutValue);

        // ぼかしを徐々に強める (0px -> 8px)
        setBlur(easeOutValue * 8);

        // わずかに縮小 (1 -> 0.95)
        setScale(1 - easeOutValue * 0.05);
      }, 20); // より滑らかにするために更新間隔を短く
    }, 4000); // 4秒後に遷移開始

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>ありがとう | DumDumb</title>
        <meta name="description" content="ありがとうございます" />
      </Head>
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-white"
        style={{
          opacity: opacity,
          filter: `blur(${blur}px)`,
          transform: `scale(${scale})`,
          transition:
            "opacity 2s ease-out, filter 2s ease-out, transform 2s ease-out",
        }}
      >
        <div className="text-center max-w-md mx-auto">
          <p className="text-xl mb-12">ありがとう。</p>
          <p className="text-xl mb-12">今から行くよ。待っててね。</p>

          {/* イラスト部分 - 実際のGIF画像に置き換えるコメント付き */}
          <div className="w-64 h-64 bg-gray-200 rounded-full overflow-hidden mx-auto flex items-center justify-center">
            {/* 
            実際のGIF画像を使用する場合:
            <img 
              src="/images/character-animation.gif" 
              alt="キャラクター" 
              className="w-full h-full object-cover" 
            />
            */}
            <span className="text-gray-500">イラスト</span>
          </div>
        </div>
      </div>
    </>
  );
};

// このページではLayoutを使用しないことを指定
CheckoutCompletePage.getLayout = (page: ReactElement) => page;

export default CheckoutCompletePage;
