import React from 'react';
import Link from 'next/link';

// 単一キャラクター用のprops型を複数キャラクター対応に変更
type CharacterSectionProps = {
  characters: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    characterSeries: {
      id: string;
      name: string;
    } | null;
  }[];
};

const CharacterSection: React.FC<CharacterSectionProps> = ({ characters }) => {
  if (!characters || characters.length === 0) return null;

  // 文ごとに分けて、それぞれを個別の要素として表示する関数
  const formatDescriptionWithLineBreaks = (description: string | null): JSX.Element => {
    if (!description) return <span>このキャラクターの説明はありません。</span>;
    
    // 正規表現で区切りを判定（「。」「？」「、」で終わるフレーズを検出）
    const phraseRegex = /[^。？、]+[。？、]/g;
    const phrases = description.match(phraseRegex) || [];
    
    // 正規表現にマッチしない残りの部分
    const remainingText = description.replace(phraseRegex, '').trim();
    
    // 全てのフレーズを配列にまとめる
    const allPhrases = [...phrases];
    if (remainingText) {
      allPhrases.push(remainingText);
    }
    
    // 各フレーズを独立した要素として表示
    const formattedText = allPhrases
      .filter(phrase => phrase.trim() !== '')
      .map((phrase, index) => {
        // 終わり方に応じてスタイルを調整（句点と疑問符は大きめの余白、読点は小さめの余白）
        const endsWithComma = phrase.endsWith('、');
        const marginClass = endsWithComma ? 'mb-2' : 'mb-3';
        
        return (
          <div 
            key={index} 
            className={`${marginClass}`}
            style={{ 
              display: 'block',
              width: '100%'
            }}
          >
            {phrase}
          </div>
        );
      });
    
    return <>{formattedText}</>;
  };

  return (
    <section className="container mx-auto px-4 py-8 mb-16">
      <h2 className="text-xl font-bold mb-6">
        このアイテムのキャラクターについて
      </h2>
      
      {/* 各キャラクターごとにセクションを表示 */}
      {characters.map((character, index) => (
        <div 
          key={character.id} 
          className={`${index > 0 ? 'mt-12 pt-12 border-t border-gray-200' : ''}`}
        >
          <div className="flex flex-col md:flex-row gap-8 relative">
            {/* キャラクター画像と名前 */}
            <div className="w-full md:w-2/5 flex-shrink-0 flex flex-col items-center">
              {character.image ? (
                <div className="w-full max-w-[360px]">
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : (
                <div className="bg-gray-200 w-full aspect-square max-w-[360px] flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <h3 className="text-2xl font-bold mt-5 text-center leading-relaxed">{character.name}</h3>
            </div>
            
            {/* キャラクター説明 - 各フレーズが一行で表示されるように修正 */}
            <div className="w-full md:w-3/5 flex flex-col justify-between">
              {/* 説明テキストの最大幅を設定し、行間を広く */}
              <div className="prose max-w-prose">
                <div className="text-gray-700 text-lg leading-loose tracking-wide">
                  {formatDescriptionWithLineBreaks(character.description)}
                </div>
              </div>
              
              {/* 「詳しく見る」リンクを右寄せに */}
              {character.characterSeries && (
                <div className="flex justify-end mt-8 md:mt-6">
                  <Link
                    href={`/character-series/${character.characterSeries.id}`}
                    className="text-orange-500 text-sm flex items-center hover:text-orange-600 transition-colors leading-relaxed"
                  >
                    このキャラクターについてもっと詳しく見る
                    <svg
                      className="w-4 h-4 ml-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default CharacterSection;