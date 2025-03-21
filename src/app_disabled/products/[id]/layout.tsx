export default function ProductIdLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <div className="product-detail-layout">
      <main>{children}</main>
    </div>
  );
}