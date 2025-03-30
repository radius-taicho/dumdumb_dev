# DumDumb (ダムダム)

## 匿名セッション機能のセットアップ

このプロジェクトでは、ユーザーがログインせずにカートやお気に入り機能を利用できるように匿名セッション機能を実装しています。以下の手順でセットアップしてください。

### 1. 必要なパッケージのインストール

```bash
npm install js-cookie uuid
npm install @types/js-cookie @types/uuid --save-dev
```

### 2. データベースの更新

スキーマの変更を適用するために、以下のコマンドを実行してデータベースを更新します。

```bash
npx prisma migrate dev --name add_anonymous_session
```

### 3. 機能の使用方法

匿名セッション機能は以下のフックを通じて利用できます：

- `useCart` - カート操作用のフック
- `useFavorites` - お気に入り操作用のフック
- `useAnonymousSession` - 匿名セッション情報へのアクセス用のフック

#### カート操作の例:

```tsx
import { useCart } from '@/hooks';

const ProductComponent = ({ product }) => {
  const { addToCart, isLoading } = useCart();

  const handleAddToCart = async () => {
    await addToCart(product.id, 1);
  };

  return (
    <button 
      onClick={handleAddToCart} 
      disabled={isLoading}
    >
      カートに追加
    </button>
  );
};
```

#### お気に入り操作の例:

```tsx
import { useFavorites } from '@/hooks';

const ProductComponent = ({ product }) => {
  const { checkFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  // 使用方法はドキュメントを参照してください
};
```

### 4. ユーザーログイン時のデータの引き継ぎ

ユーザーがログインすると、匿名セッションで追加されたカートアイテムとお気に入りは自動的にユーザーアカウントにマージされます。この処理は `AnonymousSessionProvider` によって自動的に行われます。

### 注意事項

- 匿名セッションのデータはクッキーに保存され、30日間有効です。
- セキュリティ上の理由から、匿名セッションの会計処理（チェックアウト）は別途実装する必要があります。
