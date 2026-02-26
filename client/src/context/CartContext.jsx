import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    try {
      const { data } = await API.get('/cart');
      setCart(data.data);
    } catch {
      setCart({ items: [] });
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, size, quantity = 1) => {
    setLoading(true);
    try {
      const { data } = await API.post('/cart', { productId, size, quantity });
      setCart(data.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add to cart' };
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, quantity) => {
    setLoading(true);
    try {
      const { data } = await API.put(`/cart/${itemId}`, { quantity });
      setCart(data.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update' };
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await API.delete(`/cart/${itemId}`);
      setCart(data.data);
    } catch {}
  };

  const clearCart = async () => {
    try {
      await API.delete('/cart/clear');
      setCart({ items: [] });
    } catch {}
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const value = { cart, loading, addToCart, updateItem, removeItem, clearCart, fetchCart, cartCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
