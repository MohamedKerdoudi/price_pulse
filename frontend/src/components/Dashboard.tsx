import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import ProductCard from './ProductCard';

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useProducts();
  const deleteMutation = useDeleteProduct();

  if (isLoading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Failed to load products</h3>
        <p>Make sure the API server is running at http://localhost:3001</p>
        <p>{String(error)}</p>
        <button onClick={() => refetch()} className="submit-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="empty-state">
        <h2>No products tracked yet</h2>
        <p>Add a product URL above to start tracking its price.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your Dashboard</h2>
        <span className="product-count">{data.total} product{data.total !== 1 ? 's' : ''}</span>
      </div>
      <div className="products-grid">
        {data.data.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}
