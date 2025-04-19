import { create } from 'zustand';
import { Product } from '../types/product';
import axiosInstance from '@/lib/axios';

interface FavouriteStore {
  items: Product[]; // Store the favorite items
  addToFavourite: (product: Product) => Promise<void>;
  removeFromFavourite: (productId: string) => Promise<void>;
  fetchFavouriteItems: () => Promise<void>; // Fetch from backend
}

export const useFavouriteStore = create<FavouriteStore>((set) => ({
    items: [],
  
    // Fetch favorite items on page load
    fetchFavouriteItems: async () => {
      try {
        const res = await axiosInstance.get('/wishlist'); 
        const updatedItems = res.data.map((item: Product) => {
          if (item.isSale && item.discount) {
            const discountedPrice = item.price - (item.price * item.discount) / 100;
            return { ...item, discountedPrice };
          }
          return item;
        })
        set({ items: updatedItems });
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      }
    },
  
    // Add to favorites
    addToFavourite: async (product: Product) => {
      try {
        await axiosInstance.post('/wishlist', { productId: product._id });
        set((state) => ({ items: [...state.items, product] }));
      } catch (error) {
        console.error("Failed to add to favorites:", error);
      }
    },
  
    // Remove from favorites
    removeFromFavourite: async (productId: string) => {
      try {
        await axiosInstance.delete(`/wishlist/${productId}`);
        set((state) => ({
          items: state.items.filter((item) => item._id !== productId),
        }));
      } catch (error) {
        console.error("Failed to remove from favorites:", error);
      }
    },
}));