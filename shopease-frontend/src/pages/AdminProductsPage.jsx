import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import ProductModal from '../components/ProductModal';
import { Plus, Edit2, Trash2, AlertCircle, ChevronLeft, ChevronRight, Search, ShieldCheck } from 'lucide-react';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async (currentPage, query) => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/products?page=${currentPage}&size=10&sortBy=productId`;
      if (query.trim()) {
        url = `/api/products/search?name=${encodeURIComponent(query.trim())}&page=${currentPage}&size=10`;
      }
      const res = await axiosInstance.get(url);
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch admin products list:', err);
      setError('Failed to fetch products list.');
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

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    setError('');
    setSuccessMsg('');
    try {
      await axiosInstance.delete(`/api/products/${productId}`);
      setSuccessMsg(`Product "${productName}" deleted successfully.`);
      fetchProducts(page, searchQuery);
    } catch (err) {
      console.error('Delete product failed:', err);
      if (err.response && err.response.status === 409) {
        setError(`Cannot delete "${productName}" because it is referenced in existing customer orders.`);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(`Failed to delete product "${productName}".`);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck color="var(--primary)" size={30} />
            Product Management
          </h1>
          <p className="page-subtitle">Admin Panel — Create, update, and manage inventory catalog</p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
      </div>

      {/* Products Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading product inventory...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No products available in inventory.
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.productId}>
                  <td><strong>#{prod.productId}</strong></td>
                  <td style={{ fontWeight: 600 }}>{prod.name}</td>
                  <td>
                    <span style={{ fontSize: '0.82rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      {prod.categoryName || 'General'}
                    </span>
                  </td>
                  <td style={{ color: '#38bdf8', fontWeight: 700 }}>
                    ${Number(prod.price).toFixed(2)}
                  </td>
                  <td>
                    <span className={`stock-badge ${prod.stock === 0 ? 'stock-out' : prod.stock <= 5 ? 'stock-low' : 'stock-high'}`}>
                      {prod.stock} units
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.65rem' }}
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.productId, prod.name)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.65rem' }}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Page {page + 1} of {totalPages} ({totalElements} total products)
        </div>
        <div className="pagination-controls">
          <button
            className="btn btn-secondary"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            <ChevronLeft size={18} />
            <span>Prev</span>
          </button>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRefresh={() => fetchProducts(page, searchQuery)}
        initialData={editingProduct}
      />
    </div>
  );
};

export default AdminProductsPage;
