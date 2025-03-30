// 共通の型定義
export type ViewItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  viewedAt?: Date;
  viewCount?: number;
  latestView?: Date;
};

export type ViewHistoryDetail = {
  dates: Date[];
  count: number;
};

export type ViewHistoryDetailsMap = Record<string, ViewHistoryDetail>;
