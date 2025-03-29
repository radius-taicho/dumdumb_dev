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
  subMedia?: {
    url: string;
  } | null;
  isActive: boolean;
  displayOrder: number;
};

type CharacterSeriesSectionProps = {
  characterSeries: CharacterSeries[];
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

const CharacterSeriesSection: React.FC<CharacterSeriesSectionProps> = ({
  characterSeries,
}) => {
  // ダミーのシリーズデータ
  const dummySeries: CharacterSeries[] = [
    {
      id: "dummy-1",
      name: "Junk Spike",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 1,
    },
    {
      id: "dummy-2",
      name: "Tomato&Avocado",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 2,
    },
    {
      id: "dummy-3",
      name: "Hole",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 3,
    },
    {
      id: "dummy-4",
      name: "hello world",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 4,
    },
    {
      id: "dummy-5",
      name: "ホラーゲーム",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 5,
    },
    {
      id: "dummy-6",
      name: "ゴミ箱z",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 6,
    },
    {
      id: "dummy-7",
      name: "Junkeees",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 7,
    },
    {
      id: "dummy-8",
      name: "コラボシリーズ",
      image: "/images/placeholder.jpg",
      isActive: true,
      displayOrder: 8,
    },
  ];

  // 表示用のシリーズデータを作成
  // 実際のシリーズが8つ未満の場合は、ダミーデータで足りない分を追加
  let displaySeries = [...characterSeries];
  if (displaySeries.length < 8) {
    // 必要なダミーシリーズの数を計算
    const neededDummies = 8 - displaySeries.length;
    // ダミーシリーズを必要な数だけ追加
    displaySeries = [...displaySeries, ...dummySeries.slice(0, neededDummies)];
  }
  return (
    <div className="container mx-auto px-4 mb-12">
      <div>
        <h2 className="text-xl font-bold mb-6">キャラクターシリーズ</h2>

        <div className="relative px-4 md:px-8">
          <Carousel className="w-full">
            <CarouselContent>
              {displaySeries.length > 0
                ? groupSeriesIntoChunks(displaySeries, 4).map(
                    (group, groupIndex) => (
                      <CarouselItem
                        key={`group-${groupIndex}`}
                        className="w-full"
                      >
                        <div className="flex justify-between gap-4">
                          {group.map((series) =>
                            series.id.startsWith("dummy-") ? (
                              // ダミーシリーズの表示
                              <div
                                key={series.id}
                                className="w-1/4 cursor-default"
                              >
                                <div className="aspect-[1/1.414] border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative">
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
                              </div>
                            ) : (
                              // 通常のシリーズの表示
                              <Link
                                key={series.id}
                                href={`/character-series/${series.id}`}
                                className="w-1/4"
                              >
                                <div className="aspect-[1/1.414] border-2 border-black flex items-center justify-center overflow-hidden relative">
                                  {/* サブ画像を優先的に表示 */}
                                  {series.subMedia?.url ? (
                                    <img
                                      src={series.subMedia.url}
                                      alt={`${series.name} キャラクター`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.src = "/images/placeholder.jpg";
                                      }}
                                    />
                                  ) : series.media?.url || series.image ? (
                                    // サブ画像がない場合はメイン画像を表示
                                    <img
                                      src={series.media?.url || series.image}
                                      alt={series.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.src = "/images/placeholder.jpg";
                                      }}
                                    />
                                  ) : (
                                    // 両方の画像がない場合はテキストを表示
                                    <div className="text-center text-gray-500">
                                      {series.name}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            )
                          )}
                        </div>
                      </CarouselItem>
                    )
                  )
                : null}
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

export default CharacterSeriesSection;
