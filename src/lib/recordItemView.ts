/**
 * アイテムの閲覧履歴を記録する関数
 * @param itemId アイテムID
 * @param anonymousSessionToken 匿名セッショントークン（未ログインユーザー用）
 */
export const recordItemView = async (
  itemId: string,
  anonymousSessionToken?: string | null
): Promise<void> => {
  try {
    // パラメータを準備
    const params: Record<string, any> = { itemId };
    
    // 匿名セッショントークンがある場合は追加
    if (anonymousSessionToken) {
      params.anonymousSessionToken = anonymousSessionToken;
    }

    // APIを呼び出し
    await fetch('/api/view-history/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    // 成功した場合は特に何もしない
    // console.log('View history recorded for item:', itemId);
  } catch (error) {
    // エラーログのみ出力（ユーザーエクスペリエンスには影響させない）
    console.error('Failed to record view history:', error);
  }
};
