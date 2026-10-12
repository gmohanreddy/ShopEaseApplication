import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { X, AlertCircle } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onRefresh, initialData = null }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (initialData) {
        setName(initialData.name || '');
        setPrice(initialData.price || '');
        setStock(initialData.stock || '');
        // Find matching category ID if available
        setCategoryId(initialData.categoryId || '');
      } else {
        setName('');
        setPrice('');
        setStock('');
        setCategoryId('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/api/categories');
      setCategories(res.data || []);
      if (res.data && res.data.length > 0 && !categoryId) {
        setCategoryId(res.data[0].categoryId);
      }
    } catch (err) {
      console.error('Could not load categories:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      categoryId: parseInt(categoryId, 10),
    };

    try {
      if (initialData && initialData.productId) {
        await axiosInstance.put(`/api/products/${initialData.productId}`, payload);
      } else {
        await axiosInstance.post('/api/products', payload);
      }
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Save product failed:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save product details. Verify role permissions.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{initialData ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Noise-Canceling Headphones"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99.99"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
