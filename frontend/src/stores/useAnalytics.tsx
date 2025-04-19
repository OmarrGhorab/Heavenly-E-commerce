import { create } from 'zustand';
import axios from 'axios';
import { startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';

// Simplified interface for daily sales data returned from the backend
interface DailySalesData {
  date: string;
  sales: number;
  revenue: number;
}

// Simplified analytics data interface (matching your backend)
interface AnalyticsData {
  users: number;
  products: number;
  totalSales: number;
  totalRevenue: number;
}

// Simplified store state
interface AnalyticsState {
  analyticsData: AnalyticsData | null;
  dailySales: DailySalesData[];
  loading: boolean;
  error: string | null;
  fetchDashboardData: (startDate: Date, endDate: Date) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analyticsData: null,
  dailySales: [],
  loading: false,
  error: null,

  fetchDashboardData: async (startDate: Date, endDate: Date) => {
    set({ loading: true, error: null });
    try {
      // Ensure full days are covered
      const adjustedStartDate = startOfDay(startDate);
      const adjustedEndDate = endOfDay(endDate);

      // Request analytics data from your backend
      const response = await axios.get('/api/analytics', {
        params: {
          startDate: adjustedStartDate.toISOString(),
          endDate: adjustedEndDate.toISOString(),
        },
      });

      // Fill in missing dates with zeros
      const allDates = eachDayOfInterval({ start: adjustedStartDate, end: adjustedEndDate });
      const filledDailySales = allDates.map((date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const existing = response.data.dailySalesData.find(
          (d: DailySalesData) => d.date === formattedDate
        );
        return existing || { date: formattedDate, sales: 0, revenue: 0 };
      });

      set({
        analyticsData: response.data.analyticsData,
        dailySales: filledDailySales,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'An error occurred',
        loading: false,
      });
    }
  },
}));
