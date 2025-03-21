import { Size } from '@prisma/client';

export type ItemData = {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  images: string;
  hasSizes: boolean;
  gender: string | null;
  categoryId: string;
  characterId: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
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
  itemSizes: {
    id: string;
    size: Size;
    inventory: number;
  }[];
};

export type ItemDetailPageProps = {
  item: ItemData | null;
  error?: string;
};