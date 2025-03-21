import React from 'react';
import Link from 'next/link';

type CharacterProps = {
  character: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    characterSeries: {
      id: string;
      name: string;
    } | null;
  } | null;
};

const CharacterSection: React.FC<CharacterProps> = ({ character }) => {
  if (!character) return null;

  return (
    <section className="container mx-auto px-4 py-8 mb-16">
      <h2 className="text-xl font-bold mb-6">
        このアイテムのキャラクターについて
      </h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4 flex-shrink-0 flex flex-col justify-between items-center">
          {character.image ? (
            <img
              src={character.image}
              alt={character.name}
              className="max-w-full h-auto"
            />
          ) : (
            <div className="bg-gray-200 w-full aspect-square flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <h2 className="text-xl font-bold">{character.name}</h2>
        </div>
        <div className="w-full md:w-3/4 flex flex-col items-end">
          <p className="text-gray-700">
            {character.description || "このキャラクターの説明はありません。"}
          </p>
          <Link
            href={`/character-series/${character.characterSeries?.id || ""}`}
            className="text-orange-500 text-sm flex items-center"
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
      </div>
    </section>
  );
};

export default CharacterSection;