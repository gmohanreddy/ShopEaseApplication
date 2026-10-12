import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Calendar, DollarSign, Package, AlertCircle, Clock, CheckCircle2, Truck, CheckCheck } from 'lucide-react';

const OrderHistoryPage = () => {
  const { userId, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/api/orders/user/${userId}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Fetch order history error:', err);
      setError('Could not retrieve order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axiosInstance.patch(`/api/orders/${orderId}/status?status=${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error('Update status error:', err);
      alert('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="stock-badge stock-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={14} /> PENDING
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="stock-badge stock-high" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={14} /> CONFIRMED
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="stock-badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Truck size={14} /> SHIPPED
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="stock-badge stock-high" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCheck size={14} /> DELIVERED
          </span>
        );
      default:
        return <span className="stock-badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag color="var(--primary)" size={28} />
            Order History
          </h1>
          <p className="page-subtitle">Track your placed orders, delivery status, and order details</p>
        </div>
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
          <p>Fetching your orders history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
          <Package size={56} style={{ margin: '0 auto 1rem', color: 'var(--text-subtle)' }} />
          <h3>No order history found</h3>
          <p style={{ marginTop: '0.5rem' }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.orderId} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>Order #{order.orderId}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} />
                      {new Date(order.orderDate).toLocaleString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      Customer: <strong>{order.userName}</strong>
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                    ${Number(order.totalAmount).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Admin status update controls */}
              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--warning)' }}>Admin Action:</span>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                    value={order.status}
                    disabled={updatingId === order.orderId}
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              )}

              {/* Order Items Table */}
              <div className="table-container">
                <table className="data-table" style={{ fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Purchased Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.itemId}>
                        <td style={{ fontWeight: 600 }}>{item.productName}</td>
                        <td>${Number(item.price).toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td style={{ color: '#38bdf8', fontWeight: 600 }}>
                          ${Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
