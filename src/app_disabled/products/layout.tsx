export default function ProductsLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <div className="products-layout">
      {/* ここにヘッダーやナビゲーションなどの共通要素を追加できます */}
      <main>{children}</main>
      {/* ここにフッターなどの共通要素を追加できます */}
    </div>
  );
}