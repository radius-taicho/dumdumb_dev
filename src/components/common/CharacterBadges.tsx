import React from 'react';
import { CharacterType } from '@/types/cart';

interface CharacterBadgesProps {
  characters: CharacterType[];
}

export const CharacterBadges: React.FC<CharacterBadgesProps> = ({ characters }) => {
  if (!characters || characters.length === 0) {
    return null;
  }
  
  // 単一キャラクターの場合はシンプルに表示
  if (characters.length === 1) {
    return <p className="text-sm text-gray-600 mb-1">{characters[0].name}</p>;
  }
  
  // 複数キャラクターの場合はバッジ表示
  return (
    <div className="mb-2">
      {characters.map((character) => (
        <span 
          key={character.id} 
          className="inline-block bg-gray-100 text-xs text-gray-600 px-2 py-1 rounded-full mr-1 mb-1"
        >
          {character.name}
        </span>
      ))}
    </div>
  );
};
