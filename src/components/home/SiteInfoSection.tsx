import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "@/components/ui/carousel";
import { ChevronRight } from "lucide-react";

type SiteInfoItem = {
  title: string;
  description: string;
  subDescription: string;
  imageAlt: string;
};

// サイト情報データ
const siteInfoData: SiteInfoItem[][] = [
  [
    {
      title: "このサイトについて",
      description: "コンセプト説明",
      subDescription: "サイト説明",
      imageAlt: "About this site",
    },
    {
      title: "関連サイト",
      description: "link",
      subDescription: "サイト説明",
      imageAlt: "Related site",
    },
  ],
  [
    {
      title: "関連サイト",
      description: "link",
      subDescription: "サイト説明",
      imageAlt: "Related site",
    },
    {
      title: "関連サイト",
      description: "link",
      subDescription: "サイト説明",
      imageAlt: "Related site",
    },
  ],
];

const SiteInfoSection: React.FC = () => {
  const [activeInfoIndex, setActiveInfoIndex] = useState(0);

  // サイト情報カルーセルの切り替え処理
  const handleInfoCarouselChange = (index: number) => {
    setActiveInfoIndex(index);
  };

  return (
    <div className="container mx-auto mb-20">
      <Carousel
        className="relative w-full"
        onSelect={handleInfoCarouselChange}
      >
        <CarouselContent>
          {siteInfoData.map((slide, slideIndex) => (
            <CarouselItem key={slideIndex} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {slide.map((item, itemIndex) => (
                  <div key={itemIndex} className="mb-6">
                    <h2 className="text-xl font-bold mb-4">{item.title}</h2>
                    <div className="flex items-center mb-2">
                      <div
                        className="w-12 h-12 bg-gray-300 rounded-full mr-3"
                        aria-label={item.imageAlt}
                      ></div>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">
                          {item.subDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-700 text-white">
          <ChevronRight className="h-5 w-5" />
        </CarouselNext>
      </Carousel>

      {/* ナビゲーションドット */}
      <div className="flex justify-center space-x-2 mt-6">
        {siteInfoData.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === activeInfoIndex ? "bg-black" : "bg-gray-300"
            }`}
            onClick={() => handleInfoCarouselChange(index)}
            aria-label={`スライド ${index + 1} へ移動`}
          />
        ))}
      </div>
    </div>
  );
};

export default SiteInfoSection;
