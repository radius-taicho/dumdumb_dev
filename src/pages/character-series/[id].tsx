import React from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PrismaClient } from "@prisma/client";

// コンポーネントのインポート
import SeriesHeader from "@/components/character-series/SeriesHeader";
import SeriesItemsGrid from "@/components/character-series/SeriesItemsGrid";
import OtherSeriesSection from "@/components/character-series/OtherSeriesSection";
import CharacterObject from "@/components/character-series/CharacterObject";

// 型定義
type CharacterSeries = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  media?: {
    url: string;
    fileType?: string;
  } | null;
  isMainVideo: boolean;
  subMedia?: {
    url: string;
  } | null;
  isActive: boolean;
  displayOrder: number;
};

type Item = {
  id: string;
  name: string;
  price: number;
  images: string;
  gender?: "MEN" | "WOMEN" | "KIDS" | null;
};

type CharacterSeriesPageProps = {
  series: CharacterSeries | null;
  items: Item[];
  allSeries: CharacterSeries[];
  error?: string;
};

const CharacterSeriesPage: NextPage<CharacterSeriesPageProps> = ({
  series,
  items,
  allSeries,
  error,
}) => {
  const router = useRouter();

  // エラー処理
  if (error || !series) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error || "キャラクターシリーズが見つかりません"}
        </h1>
        <p className="text-gray-600 mb-8">
          指定されたシリーズが存在しないか、削除された可能性があります。
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{series.name} | dumdumb</title>
        <meta
          name="description"
          content={`dumdumbで扱っている${series.name}シリーズの商品一覧`}
        />
      </Head>

      {/* シリーズ情報ヘッダー */}
      <SeriesHeader series={series} />

      {/* シリーズアイテムセクション */}
      <SeriesItemsGrid seriesId={series.id} items={items} />

      {/* キャラクターオブジェクト（上部） */}
      <CharacterObject position="top" />

      {/* 他のキャラクターシリーズ */}
      <OtherSeriesSection currentSeriesId={series.id} allSeries={allSeries} />

      {/* キャラクターオブジェクト（下部） */}
      <CharacterObject position="bottom" />
    </>
  );
};

// サーバーサイドでデータを取得
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  if (!id || typeof id !== "string") {
    return {
      props: {
        series: null,
        items: [],
        allSeries: [],
        error: "Invalid ID",
      },
    };
  }

  const prisma = new PrismaClient();

  try {
    // シリーズ情報を取得（メインメディアとサブメディア両方を含む）
    const series = await prisma.characterSeries.findUnique({
      where: { id },
      include: {
        media: {
          select: {
            url: true,
            fileType: true,
          },
        },
        subMedia: {
          select: {
            url: true,
          },
        },
      },
    });

    if (!series) {
      return {
        props: {
          series: null,
          items: [],
          allSeries: [],
          error: "Character series not found",
        },
      };
    }

    // このシリーズに関連するキャラクターを取得
    const characters = await prisma.character.findMany({
      where: {
        characterSeriesId: id,
        isActive: true,
      },
    });

    const characterIds = characters.map(char => char.id);

    // これらのキャラクターを含むアイテムを取得
    const items = await prisma.item.findMany({
      where: {
        characters: {
          some: {
            characterId: {
              in: characterIds,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 他のシリーズ情報を取得（表示状態のみ、メディア情報も含む）
    const allSeries = await prisma.characterSeries.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        media: {
          select: {
            url: true,
            fileType: true,
          },
        },
        subMedia: {
          select: {
            url: true,
          },
        },
      },
    });

    // JSON化可能なデータに変換
    const serializedSeries = JSON.parse(JSON.stringify(series));
    const serializedItems = JSON.parse(JSON.stringify(items));
    const serializedAllSeries = JSON.parse(JSON.stringify(allSeries));

    return {
      props: {
        series: serializedSeries,
        items: serializedItems,
        allSeries: serializedAllSeries,
      },
    };
  } catch (error) {
    console.error("Error fetching series data:", error);
    return {
      props: {
        series: null,
        items: [],
        allSeries: [],
        error: "Failed to fetch character series data",
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};

export default CharacterSeriesPage;
