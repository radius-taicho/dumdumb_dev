import { Size } from "@prisma/client";

// キャラクターデータ型
export type CharacterType = {
  id: string;
  name: string;
};

// アイテム基本情報型
export type ItemBaseType = {
  id: string;
  name: string;
  price: number;
  images: string;
};

// カートアイテムデータ型
export type CartItemType = {
  id: string;
  itemId: string;
  quantity: number;
  size: Size | null;
  item: ItemBaseType & {
    hasSizes: boolean;
    characters: CharacterType[];
  };
};

// お気に入りアイテムデータ型
export type FavoriteItemType = {
  id: string;
  itemId: string;
  item: ItemBaseType & {
    characters: CharacterType[];
  };
};

// レコメンドアイテム型
export type RecommendedItemType = {
  id: string;
  name: string;
  price: number;
  images: string;
  characters?: CharacterType[];
};
