export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="product-detail-page">
      <h1>Product Details</h1>
      <p>Product ID: {params.id}</p>
    </div>
  );
}