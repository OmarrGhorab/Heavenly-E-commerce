import axiosInstance from "@/lib/axios";
import { create } from "zustand";
import { CartItem, CartStore } from "@/types/cart";
import toast from "react-hot-toast";

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  totalPrice: 0,
  discountedPrice: 0,
  itemCount: 0,
  error: null,
  coupon: null,
  availableCoupon: null,

  getCartItems: async () => {
    try {
      const res = await axiosInstance.get('/cart');
      const updatedCart = res.data.map((product: CartItem) => {
        let finalPrice = product.price;
        if (product.isSale && product.discount) {
          finalPrice = product.price - (product.price * product.discount) / 100;
        }
        return { 
          ...product,
          cartItemId: product.cartItemId, 
          finalPrice 
        };
      });
  
      set({ items: updatedCart });
      get().calculateTotal();
    } catch (error: any) {
      set({ error: error.response?.data.message || "An error occurred" });
    }
  },

  addItem: async (product: CartItem) => {
    try {
      const response = await axiosInstance.post('/cart', { 
        productId: product._id,
        color: product.color,
        size: product.size
      });
  
      set((state) => {
        const backendCartItem = response.data;
        
        // Remove temporary item if exists
        const filteredItems = state.items.filter(
          item => item._id !== product._id || 
                 item.color !== product.color || 
                 item.size !== product.size
        );
  
        // Check if item already exists in updated list
        const existingItem = filteredItems.find(
          item => item.cartItemId === backendCartItem.cartItemId
        );
  
        return {
          items: existingItem 
            ? filteredItems.map(item =>
                item.cartItemId === backendCartItem.cartItemId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...filteredItems, { ...product, ...backendCartItem }]
        };
      });
  
      get().calculateTotal();
      toast.success('Product added to cart');
    } catch (error: any) {
      console.error('Error adding product to cart:', error);
      throw error;
    }
  },

  removeAllItems: async () => {
    try {
      await axiosInstance.delete(`/cart`);
      set({ items: [] })
      get().calculateTotal();
    } catch (error: any) {
      console.error('Error removing product from cart:', error);
      toast.error(error.response?.data.message || 'Failed to remove item from cart');
    }
  },

  updateQuantity: async (cartItemId: string, quantity: number) => {
    try {
      await axiosInstance.patch(`/cart/${cartItemId}`, { quantity });
  
      set((state) => ({
        items: quantity === 0
          ? state.items.filter((item) => item.cartItemId !== cartItemId)
          : state.items.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantity } : item
            ),
      }));
  
      get().calculateTotal();
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error(error.response?.data.message || 'Failed to update quantity');
    }
  },
  
  applyCoupon: async (code: string) => {
    try {
      const res = await axiosInstance.post('/coupons/validate', { code });
      console.log("coupon res.data", res.data)
      set({ coupon: res.data });
      get().calculateTotal();
      toast.success('Coupon applied successfully');
    } catch (error: any) {
      toast.error(error.response?.data.message || 'Failed to apply coupon');
    }
  },

  getCoupon: async () => {
    try {
      const res = await axiosInstance.get('/coupons');
      set({ availableCoupon: res.data })
    } catch (error: any) {
      console.error(error.response?.data.message || 'Failed to get valid coupon');
    }
  },
  // calculateTotal method
  calculateTotal: () => {
    const { items, coupon } = get();
    
    const subtotal = items.reduce(
      (total, item) => total + (item.finalPrice ?? item.price) * item.quantity, 
      0
    );
  
    let discount = 0;
    // Check if coupon exists and is not expired
    if (coupon && new Date(coupon.expirationDate) > new Date()) {
      discount = subtotal * (coupon.discountPercentage / 100);
    }
  
    set({
      totalPrice: subtotal,
      discountedPrice: subtotal - discount,
      itemCount: items.reduce((total, item) => total + item.quantity, 0)
    });
  }
}));
