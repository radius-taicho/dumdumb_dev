import React, { useState } from 'react';
import ThumbnailImage from './ThumbnailImage';

type ImageGalleryProps = { 
  images: string 
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageArray = images ? images.split(',').map(img => img.trim()) : [];
  
  // 画像がない場合はプレースホルダーを使用
  if (imageArray.length === 0) {
    return (
      <div className="z-0 w-full md:w-[650px] mr-8">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-[120px] flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[600px] py-2">
            <figure className="flex-shrink-0 w-[100px] h-[100px] rounded-full bg-zinc-300" />
            <figure className="flex-shrink-0 w-[100px] h-[100px] rounded-full bg-zinc-300" />
            <figure className="flex-shrink-0 w-[100px] h-[100px] rounded-full bg-zinc-300" />
          </div>
          <div className="w-full md:flex-1 flex items-center justify-center">
            <figure className="w-[420px] h-[420px] md:w-[520px] md:h-[520px] bg-zinc-300 border border-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  const handleThumbnailHover = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="z-0 w-full md:w-[650px] mr-8">
      <div className="flex flex-col md:flex-row gap-5">
        <div className="w-full md:w-[120px] flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[600px] py-2">
          {imageArray.map((image, index) => (
            <ThumbnailImage 
              key={index} 
              image={image} 
              isActive={currentImageIndex === index}
              onClick={() => setCurrentImageIndex(index)}
              onMouseEnter={() => handleThumbnailHover(index)}
            />
          ))}
        </div>
        <div className="w-full md:flex-1 flex items-center justify-center">
          <div 
            className="relative w-[420px] h-[420px] md:w-[520px] md:h-[520px] border border-gray-200 overflow-hidden"
          >
            <img 
              src={imageArray[currentImageIndex]} 
              alt="商品画像" 
              className="absolute w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;