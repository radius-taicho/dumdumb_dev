// ここにお気に入り関連のコード

// お気に入り状態の取得
/*
useEffect(() => {
  // ユーザーがログインしている場合のみお気に入り状態を取得
  if (status === 'authenticated' && session?.user) {
    // すべてのアイテムのお気に入り状態をリセット
    const initialFavorites: Record<string, boolean> = {};
    
    // 各アイテムのお気に入り状態を取得
    const fetchFavoritesStatus = async () => {
      try {
        for (const item of items) {
          const response = await fetch(`/api/favorites/check?itemId=${item.id}`);
          if (response.ok) {
            const data = await response.json();
            initialFavorites[item.id] = data.isFavorite;
          }
        }
        
        setFavorites(initialFavorites);
      } catch (error) {
        console.error('Error fetching favorites status:', error);
      }
    };
    
    fetchFavoritesStatus();
  }
}, [status, session, items]);

// お気に入りボタンクリックハンドラー
const handleFavoriteClick = async (itemId: string, event: React.MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  // ログインしていない場合は、ログインを促す
  if (status !== 'authenticated' || !session?.user) {
    toast.error('お気に入り機能を使用するにはログインが必要です');
    return;
  }
  
  // すでに処理中なら何もしない
  if (loadingFavorites[itemId]) return;
  
  // 処理中フラグを設定
  setLoadingFavorites(prev => ({ ...prev, [itemId]: true }));
  
  try {
    if (favorites[itemId]) {
      // お気に入りから削除
      const response = await fetch('/api/favorites/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });
      
      if (response.ok) {
        setFavorites(prev => ({ ...prev, [itemId]: false }));
        toast.success('お気に入りから削除しました');
      } else {
        toast.error('お気に入りの削除に失敗しました');
      }
    } else {
      // お気に入りに追加
      const response = await fetch('/api/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });
      
      if (response.ok) {
        setFavorites(prev => ({ ...prev, [itemId]: true }));
        toast.success('お気に入りに追加しました');
      } else {
        toast.error('お気に入りの追加に失敗しました');
      }
    }
  } catch (error) {
    console.error('Favorite toggle error:', error);
    toast.error('お気に入りの操作中にエラーが発生しました');
  } finally {
    // 処理中フラグを解除
    setLoadingFavorites(prev => ({ ...prev, [itemId]: false }));
  }
};
*/
