import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ShoppingCart, Package, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, isAdmin, email, role, logout, cart } = useAuth();
  const navigate = useNavigate();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/products" className="brand-logo">
          <ShoppingBag className="brand-icon" size={26} />
          <span>ShopEase</span>
        </Link>

        <ul className="nav-links">
          <li>
            <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Package size={18} />
              <span>Products</span>
            </NavLink>
          </li>

          {isAuthenticated && (
            <>
              <li>
                <NavLink to="/order" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <ShoppingCart size={18} />
                  <span>Cart</span>
                  {totalCartItems > 0 && <span className="badge-count">{totalCartItems}</span>}
                </NavLink>
              </li>

              <li>
                <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <ShoppingBag size={18} />
                  <span>Orders</span>
                </NavLink>
              </li>

              {isAdmin && (
                <li>
                  <NavLink to="/admin/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <ShieldCheck size={18} />
                    <span>Admin Panel</span>
                  </NavLink>
                </li>
              )}
            </>
          )}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <div className="user-profile-btn">
                <span>{email}</span>
                <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                  {role}
                </span>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
