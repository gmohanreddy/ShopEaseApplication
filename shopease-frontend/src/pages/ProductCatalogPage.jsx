import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, Check, AlertCircle, ChevronLeft, ChevronRight, Package, Tag } from 'lucide-react';

const ProductCatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [addedItemMap, setAddedItemMap] = useState({});

  const { addToCart, isAuthenticated } = useAuth();

  const fetchProducts = async (currentPage, query) => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/products?page=${currentPage}&size=8&sortBy=productId`;
      if (query.trim()) {
        url = `/api/products/search?name=${encodeURIComponent(query.trim())}&page=${currentPage}&size=8`;
      }
      const res = await axiosInstance.get(url);
      const data = res.data;
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Could not load products. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, searchQuery);
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts(0, searchQuery);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedItemMap((prev) => ({ ...prev, [product.productId]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.productId]: false }));
    }, 1500);
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="stock-badge stock-out">Out of Stock</span>;
    } else if (stock <= 5) {
      return <span className="stock-badge stock-low">Low Stock ({stock})</span>;
    } else {
      return <span className="stock-badge stock-high">In Stock ({stock})</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Browse available inventory, search products, and place orders</p>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '380px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1rem' }}>
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-subtle)' }} />
          <h3>No products found</h3>
          <p style={{ marginTop: '0.5rem' }}>Try adjusting your search query or check back later.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => {
              const isAdded = addedItemMap[product.productId];
              const isOutOfStock = product.stock === 0;

              return (
                <div key={product.productId} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Tag size={14} />
                        {product.categoryName || 'General'}
                      </span>
                      {getStockBadge(product.stock)}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                      {product.name}
                    </h3>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
                        ${Number(product.price).toFixed(2)}
                      </div>
                    </div>

                    {isAuthenticated ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`btn ${isAdded ? 'btn-accent' : 'btn-primary'}`}
                        style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem' }}
                      >
                        {isAdded ? (
                          <>
                            <Check size={16} />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                        Login to purchase
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="pagination">
            <div className="pagination-info">
              Showing page {page + 1} of {totalPages} ({totalElements} total products)
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-secondary"
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                style={{ padding: '0.5rem 0.85rem' }}
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
              </button>
              <button
                className="btn btn-secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                style={{ padding: '0.5rem 0.85rem' }}
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductCatalogPage;
