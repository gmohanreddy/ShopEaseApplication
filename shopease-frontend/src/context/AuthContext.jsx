import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [email, setEmail] = useState(localStorage.getItem('email') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || null);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shopease_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('shopease_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch and resolve internal User entity ID for placing orders
  const resolveUserProfile = async (userEmail, jwtToken) => {
    try {
      const res = await axiosInstance.get('/api/users', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const usersList = res.data || [];
      const found = usersList.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
      if (found) {
        setUserId(found.userId);
        setUserName(found.name);
        localStorage.setItem('userId', found.userId);
        localStorage.setItem('userName', found.name);
        return found;
      }
    } catch (err) {
      console.warn('Could not resolve user profile automatically:', err);
    }
    return null;
  };

  const login = async (emailInput, password) => {
    const response = await axiosInstance.post('/api/auth/login', {
      email: emailInput,
      password: password,
    });

    const data = response.data; // { token, email, role, message }
    setToken(data.token);
    setEmail(data.email);
    setRole(data.role);

    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);

    // Resolve matching User entity (for userId required during order placement)
    await resolveUserProfile(data.email, data.token);

    return data;
  };

  const register = async ({ name, email: emailInput, password, phone }, isAdmin = false) => {
    const endpoint = isAdmin ? '/api/auth/register-admin' : '/api/auth/register';
    const authRes = await axiosInstance.post(endpoint, {
      name: name || emailInput.split('@')[0],
      email: emailInput,
      password: password,
    });

    const data = authRes.data; // { token, email, role, message }
    setToken(data.token);
    setEmail(data.email);
    setRole(data.role);

    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);

    // Create corresponding User record in users table so orders can reference userId
    try {
      const userRes = await axiosInstance.post(
        '/api/users',
        { name: name || emailInput.split('@')[0], email: emailInput, phone: phone || '0000000000' },
        { headers: { Authorization: `Bearer ${data.token}` } }
      );
      setUserId(userRes.data.userId);
      setUserName(userRes.data.name);
      localStorage.setItem('userId', userRes.data.userId);
      localStorage.setItem('userName', userRes.data.name);
    } catch (uErr) {
      console.warn('User profile creation skipped or already exists:', uErr);
      await resolveUserProfile(data.email, data.token);
    }

    return data;
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    setRole(null);
    setUserId(null);
    setUserName(null);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('shopease_cart');
  };

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.productId === product.productId);
      if (existing) {
        return prev.map((item) =>
          item.product.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        role,
        userId,
        userName,
        isAuthenticated: !!token,
        isAdmin: role === 'ADMIN',
        login,
        register,
        logout,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
