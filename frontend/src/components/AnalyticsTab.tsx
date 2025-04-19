import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useEffect, useState } from 'react';
import { subDays, subMonths, subYears, format, parseISO } from 'date-fns';
import { useAnalyticsStore } from '@/stores/useAnalytics';
import { Users, Package, DollarSign, ShoppingCart } from 'lucide-react';

const DashboardPage = () => {
  // Define available date ranges
  const DATE_RANGES = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last Month', value: '1m' },
    { label: 'Last Year', value: '1y' },
    { label: 'Custom', value: 'custom' },
  ];

  const { analyticsData, dailySales, loading, error, fetchDashboardData } = useAnalyticsStore();
  const [dateRange, setDateRange] = useState(DATE_RANGES[0].value);
  const [startDate, setStartDate] = useState(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(new Date());

  // Fetch analytics data when the dates change
  useEffect(() => {
    fetchDashboardData(startDate, endDate);
  }, [startDate, endDate]);

  // Update start and end dates based on the selected range
  const handleDateRangeChange = (range: string) => {
    const today = new Date();
    setDateRange(range);
    if (range === '7d') {
      setStartDate(subDays(today, 7));
      setEndDate(today);
    } else if (range === '1m') {
      setStartDate(subMonths(today, 1));
      setEndDate(today);
    } else if (range === '1y') {
      setStartDate(subYears(today, 1));
      setEndDate(today);
    }
  };

  // metric cards based on available analytics data
  const metrics = [
    {
      title: 'Users',
      value: analyticsData?.users ?? 0,
      icon: Users,
    },
    {
      title: 'Products',
      value: analyticsData?.products ?? 0,
      icon: Package,
    },
    {
      title: 'Sales',
      value: analyticsData?.totalSales ?? 0,
      icon: ShoppingCart,
    },
    {
      title: 'Revenue',
      value: (analyticsData?.totalRevenue ?? 0) / 100,
      icon: DollarSign,
    },
  ];
  const formattedSalesData = dailySales?.map((item) => ({
    ...item,
    revenue: item.revenue / 100, 
  }));
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        {dateRange === 'custom' ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={format(startDate, 'yyyy-MM-dd')}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              max={format(endDate, 'yyyy-MM-dd')}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            />
            <span>–</span>
            <input
              type="date"
              value={format(endDate, 'yyyy-MM-dd')}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              min={format(startDate, 'yyyy-MM-dd')}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            />
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            {format(startDate, 'MMM dd, yyyy')} – {format(endDate, 'MMM dd, yyyy')}
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse" />
          ))
        ) : (
          metrics.map((metric, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.title === 'Revenue' ? '$' : ''}{metric.value.toLocaleString()}
                  </p>
                </div>
                <metric.icon className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Sales Overview</h2>
        <div className="h-96">
          {loading ? (
            <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedSalesData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                  stroke="#e5e7eb"
                />
                
                {/* Y-Axis: Revenue */}
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`} // No division needed here
                  stroke="#e5e7eb"
                />

                {/* Y-Axis: Sales */}
                <YAxis
                  yAxisId="sales"
                  orientation="right"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  stroke="#e5e7eb"
                />

                {/* Tooltip: Ensure revenue formatting */}
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name) => [
                    name === 'Revenue' ? `$${value.toLocaleString()}` : value.toLocaleString(),
                    name,
                  ]}
                  labelFormatter={(date) => format(parseISO(date as string), 'MMM dd, yyyy')}
                />

                {/* Revenue Area Chart */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  yAxisId="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                />

                {/* Sales Line Chart */}
                <Line
                  type="monotone"
                  dataKey="sales"
                  yAxisId="sales"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Sales"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
