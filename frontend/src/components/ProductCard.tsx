import type { ProductResponse } from '../types';
import TrendIndicator from './TrendIndicator';

type ProductCardProps = {
  product: ProductResponse;
  onDelete: (id: string) => void;
};

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  const initialPrice = typeof product.initialPrice === 'number' ? product.initialPrice : 0;
  const currentPrice = typeof product.currentPrice === 'number' ? product.currentPrice : 0;

  return (
    <div className="product-card">
      <div className="product-card-header">
        <h3>{product.name}</h3>
        <button
          className="delete-btn"
          onClick={() => onDelete(product.id)}
          title="Remove product"
        >
          &times;
        </button>
      </div>
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="product-url"
      >
        {new URL(product.url).hostname}
      </a>
      <div className="product-prices">
        <div className="price-info">
          <span className="price-label">Initial</span>
          <span className="price-value">
            {initialPrice.toFixed(2)} {product.currency}
          </span>
        </div>
        <div className="price-info">
          <span className="price-label">Current</span>
          <span className="price-value current">
            {currentPrice.toFixed(2)} {product.currency}
          </span>
        </div>
      </div>
      <div className="product-trend">
        <TrendIndicator
          trend={product.trend}
          change={product.priceChange}
          changePercent={product.priceChangePercent}
        />
      </div>
    </div>
  );
}
