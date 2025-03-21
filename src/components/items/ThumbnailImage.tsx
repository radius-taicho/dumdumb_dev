import React from 'react';

type ThumbnailImageProps = { 
  image: string; 
  isActive: boolean; 
  onClick: () => void;
  onMouseEnter?: () => void;
};

const ThumbnailImage: React.FC<ThumbnailImageProps> = ({ 
  image, 
  isActive,
  onClick,
  onMouseEnter
}) => {
  return (
    <button 
      className={`relative flex-shrink-0 w-[100px] h-[100px] rounded-full overflow-hidden transition-all mb-3 ${
        isActive 
          ? 'border-2 border-orange-500' 
          : 'border border-gray-200 hover:border-gray-400'
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      aria-label="選択画像を変更"
    >
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <img 
          src={image} 
          alt="サムネイル" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </button>
  );
};

export default ThumbnailImage;