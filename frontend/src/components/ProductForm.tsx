import { useState } from 'react';
import type { CreateProductDTO } from '../types';

type ProductFormProps = {
  onSubmit: (data: CreateProductDTO) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export default function ProductForm({ onSubmit, isLoading, error }: ProductFormProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!url.trim()) {
      setFormError('URL is required');
      return;
    }
    if (!name.trim()) {
      setFormError('Product name is required');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Price must be a positive number');
      return;
    }

    try {
      await onSubmit({ url: url.trim(), name: name.trim(), price: priceNum });
      setUrl('');
      setName('');
      setPrice('');
    } catch {
      // error is handled by parent
    }
  };

  const displayError = formError || error;

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>Add Product to Track</h2>
      <div className="form-group">
        <label htmlFor="url">Product URL</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/product/123"
          disabled={isLoading}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="name">Product Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Product"
          disabled={isLoading}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="price">Current Price</label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="29.99"
          disabled={isLoading}
          required
        />
      </div>
      {displayError && <div className="form-error">{displayError}</div>}
      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Track Price'}
      </button>
    </form>
  );
}
