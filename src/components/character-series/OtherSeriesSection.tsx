import React from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CharacterSeries = {
  id: string;
  name: string;
  image?: string | null;
  media?: {
    url: string;
  } | null;
  isActive: boolean;
  displayOrder: number;
};

type OtherSeriesSectionProps = {
  currentSeriesId: string;
  allSeries: CharacterSeries[];
};

// キャラクターシリーズのグループ化関数
const groupSeriesIntoChunks = (
  seriesList: CharacterSeries[],
  chunkSize = 4
) => {
  const groups = [];
  for (let i = 0; i < seriesList.length; i += chunkSize) {
    groups.push(seriesList.slice(i, i + chunkSize));
  }
  return groups;
};

const OtherSeriesSection: React.FC<OtherSeriesSectionProps> = ({
  currentSeriesId,
  allSeries,
}) => {
  // 現在表示しているシリーズを除外
  const otherSeries = allSeries.filter(
    (series) => series.id !== currentSeriesId
  );

  // ダミーのシリーズデータ
  const dummySeries = [
    {
      id: "dummy-1",
      name: "オリジナルキャラクター",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 1,
    },
    {
      id: "dummy-2",
      name: "Junk Spike",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 2,
    },
    {
      id: "dummy-3",
      name: "Junkeees",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 3,
    },
    {
      id: "dummy-4",
      name: "Tomato&Avocado",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 4,
    },
  ];

  // 他のシリーズがない場合はダミーデータを使用
  const displaySeries = otherSeries.length > 0 ? otherSeries : dummySeries;

  return (
    <div className="container mx-auto mb-12">
      <div className="px-4">
        <h2 className="text-xl font-bold mb-6">他のキャラクターシリーズ</h2>

        <div className="relative px-4 md:px-8">
          <Carousel className="w-full">
            <CarouselContent>
              {groupSeriesIntoChunks(displaySeries, 4).map(
                (group, groupIndex) => (
                  <CarouselItem key={`group-${groupIndex}`} className="w-full">
                    <div className="flex justify-between gap-4">
                      {group.map((series) =>
                        series.id.startsWith("dummy-") ? (
                          // ダミーシリーズの場合はクリック不可
                          <div key={series.id} className="w-1/4 cursor-default">
                            <div className="aspect-[1/1.414] border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                              <div className="text-center p-4 flex flex-col items-center justify-center h-full">
                                <div className="text-gray-400 text-sm mb-2">
                                  準備中
                                </div>
                                <div className="text-center text-gray-500 font-medium">
                                  {series.name}
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                  近日公開予定
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-center text-sm text-gray-500">
                              {series.name}
                            </div>
                          </div>
                        ) : (
                          // 通常のシリーズ
                          <Link
                            key={series.id}
                            href={`/character-series/${series.id}`}
                            className="w-1/4"
                          >
                            <div className="aspect-[1/1.414] border-2 border-black flex items-center justify-center overflow-hidden">
                              {/* 画像があれば表示、なければテキストを表示 */}
                              {series.media?.url || series.image ? (
                                <img
                                  src={series.media?.url || series.image}
                                  alt={series.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/images/placeholder.jpg";
                                  }}
                                />
                              ) : (
                                <div className="text-center text-gray-500">
                                  {series.name}
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-center text-sm">
                              {series.name}
                            </div>
                          </Link>
                        )
                      )}
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>

            {displaySeries.length > 4 && (
              <>
                <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 border-none shadow-none bg-transparent text-black">
                  <div className="absolute -left-2">
                    <ChevronLeft className="w-10 h-10" />
                  </div>
                </CarouselPrevious>

                <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 border-none shadow-none bg-transparent text-black">
                  <div className="absolute -right-2">
                    <ChevronRight className="w-10 h-10" />
                  </div>
                </CarouselNext>
              </>
            )}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default OtherSeriesSection;
