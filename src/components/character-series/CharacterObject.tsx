import React from "react";

type CharacterObjectProps = {
  position: "top" | "bottom";
};

/**
 * キャラクターオブジェクトコンポーネント
 * トップまたはボトムの位置に表示される装飾用の円形オブジェクト
 */
const CharacterObject: React.FC<CharacterObjectProps> = ({ position }) => {
  return (
    <div className="flex justify-end w-full h-[160px] px-20 mb-4">
      <div className="w-20 h-20 md:w-40 md:h-40 border-2 border-gray-300 rounded-full flex items-center justify-center animate-pulse">
        {/* 将来的にはここに実際のキャラクター画像やアニメーションが入る可能性がある */}
      </div>
    </div>
  );
};

export default CharacterObject;
