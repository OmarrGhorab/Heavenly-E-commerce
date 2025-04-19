import axiosInstance from "@/lib/axios";
import { create } from "zustand";
import { OrderStore, ShippingStatus } from "@/types/orders";
import toast from "react-hot-toast";

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
  },

  getAllOrders: async ({ page = 1, limit = 10, search = "" } = {}) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/analytics/all-orders", {
        params: { page, limit, search },
      });
      set({
        orders: res.data.orders,
        loading: false,
        pagination: res.data.pagination, // { total, page, pages }
      });
    } catch (error: any) {
      set({ loading: false, error: error.response?.data.message || "An error occurred" });
    }
  },

  getUserOrders: async ({ page = 1, limit = 10, search = "" } = {}) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/payments/get-user-orders", {
        params: { page, limit, search },
      });
      console.log("getUserOrders:", res.data);
      set({
        orders: res.data.orders,
        loading: false,
        pagination: res.data.pagination,
      });
    } catch (error: any) {
      set({ loading: false, error: error.response?.data.message || "An error occurred" });
    }
  },

  cancelOrder: async (orderId: string) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/payments/cancel/${orderId}`);
      console.log(res.data);
      toast.success(res.data.message);
      set({ loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.response?.data.message || "An error occurred" });
    }
  },

  refundOrder: async (orderId: string) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post(`/payments/request-refund/${orderId}`);
      toast.success(res.data.message);
      set({ loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.response?.data.message || "An error occurred" });
    }
  },

  approveRefund: async (orderId: string, decision: string) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/payments/approve-refund/${orderId}`, { decision });
      toast.success(res.data.message);
      set({ loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.response?.data.message || "An error occurred" });
    }
  },

  processRefund: async (orderId: string) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post(`/payments/process-refund/${orderId}`);
      toast.success(res.data.message);
      set({ loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.response?.data.message || "An error occurred" });
    }
  },

  updateStatus: async (orderId: string, newStatus: ShippingStatus) => {
    set({ loading: true });
    try {
      await axiosInstance.patch(`/analytics/all-orders/${orderId}/status`, { newStatus });
      set((prevState) => ({
        orders: prevState.orders.map(order =>
          order._id === orderId ? { ...order, shippingStatus: newStatus as ShippingStatus } : order
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data.message || "An error occurred", loading: false });
    }
  },
}));
