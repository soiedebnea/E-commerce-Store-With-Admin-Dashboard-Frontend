import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) return setItems([]);
    try {
      const { data } = await api.get("/wishlist");
      setItems(data.wishlist);
    } catch {
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const has = (productId) => items.some((p) => p._id === productId);

  const toggle = async (productId) => {
    const { data } = has(productId)
      ? await api.delete(`/wishlist/${productId}`)
      : await api.post(`/wishlist/${productId}`);
    setItems(data.wishlist);
  };

  return <WishlistContext.Provider value={{ items, has, toggle, refresh }}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);