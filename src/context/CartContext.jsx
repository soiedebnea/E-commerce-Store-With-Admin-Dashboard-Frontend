import React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, logout } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (err) {
      setCart({ items: [] });
      // Saved login is stale (bad/expired token) -> clear it so the user can log in again
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post("/cart", { productId, quantity });
    setCart(data);
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    setCart(data);
  };

  const clearCart = async () => {
    const { data } = await api.delete("/cart");
    setCart(data);
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const subtotal =
    cart.items?.reduce((sum, i) => sum + (i.product?.price || i.priceAtAdd || 0) * i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, subtotal, addToCart, updateItem, removeItem, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);