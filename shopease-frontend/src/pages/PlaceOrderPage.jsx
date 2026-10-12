import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, AlertCircle, ArrowRight, ShoppingBag } from 'lucide-react';

const PlaceOrderPage = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.length === 0) return;
    if (!userId) {
      setError('User profile not resolved. Please sign out and sign in again.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      userId: Number(userId),
      items: cart.map((item) => ({
        productId: item.product.productId,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await axiosInstance.post('/api/orders', payload);
      setSuccess(true);
      clearCart();
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      console.error('Order placement error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to place order. Check stock availability or try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card" style={{ maxWidth: '540px', margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <CheckCircle size={56} color="var(--accent)" style={{ margin: '0 auto 1rem' }} />
        <h2>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.5rem' }}>
          Your order has been confirmed and a confirmation email has been dispatched.
        </p>
        <div className="alert alert-success">
          Redirecting to Order History...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingCart color="var(--primary)" size={28} />
            Your Shopping Cart
          </h1>
          <p className="page-subtitle">Review items, adjust quantities, and complete your order</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <ShoppingBag size={56} style={{ margin: '0 auto 1rem', color: 'var(--text-subtle)' }} />
          <h3>Your cart is currently empty</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
            Browse our product catalog to add items to your cart.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.75rem', alignItems: 'flex-start' }}>
          {/* Cart Item List */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th style={{ textAlign: 'center' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const sub = Number(item.product.price) * item.quantity;
                  return (
                    <tr key={item.product.productId}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Category: {item.product.categoryName || 'General'}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ${Number(item.product.price).toFixed(2)}
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                          <button
                            onClick={() => updateCartQuantity(item.product.productId, item.quantity - 1)}
                            style={{ background: 'transparent', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            style={{ background: 'transparent', color: 'var(--text-main)', display: 'flex', alignItems: 'center', opacity: item.quantity >= item.product.stock ? 0.4 : 1 }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td style={{ color: '#38bdf8', fontWeight: 700 }}>
                        ${sub.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => removeFromCart(item.product.productId)}
                          className="btn-logout"
                          style={{ padding: '0.4rem' }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Checkout Order Summary Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Items Count</span>
              <span>{cart.reduce((s, i) => s + i.quantity, 0)} units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>FREE</span>
            </div>

            <div style={{
              display: 'flex',
              justify: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
              marginBottom: '1.5rem',
              fontSize: '1.2rem',
              fontWeight: 800
            }}>
              <span>Total Amount</span>
              <span style={{ color: '#38bdf8' }}>${calculateSubtotal().toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Processing Order...' : (
                <>
                  <span>Place Order</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrderPage;
