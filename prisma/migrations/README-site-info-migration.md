# SiteInfo モデルマイグレーション手順

このマイグレーションは `SiteInfo` モデルをデータベースに追加するためのものです。

## 実行方法

以下のいずれかの方法でマイグレーションを実行してください：

### 方法1: Prisma Migrate を使用する（推奨）

```bash
npx prisma migrate dev --name add_site_info_model
```

このコマンドを実行すると、Prismaは現在のスキーマ定義から必要なマイグレーションファイルを自動的に生成し、それをデータベースに適用します。

### 方法2: 手動でSQLを実行する

もし方法1で問題が発生する場合は、提供されたSQLファイルを直接実行することもできます：

```bash
mysql -u username -p database_name < prisma/migrations/site_info_migration.sql
```

**注意**: SQL文を直接実行する場合は、Prismaのマイグレーション履歴と同期しないため、後のマイグレーションで問題が発生する可能性があります。

## マイグレーション後の確認

マイグレーション実行後、以下のコマンドを実行してPrismaクライアントを再生成してください：

```bash
npx prisma generate
```

これにより、新しいSiteInfoモデルに基づいたTypescriptの型定義が更新されます。
