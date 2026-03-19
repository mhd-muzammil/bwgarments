import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  HiTrendingUp, HiTrendingDown, HiCurrencyRupee, HiShoppingCart,
  HiReceiptTax, HiUserAdd, HiClock, HiCheckCircle,
} from 'react-icons/hi';

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '12m', label: '12 Months' },
];

const STATUS_LABELS = {
  processing: 'Processing',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  // Handle YYYY-MM format for 12m period
  if (dateStr.length === 7) {
    const [y, m] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
  }
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-grey-900 text-white text-xs p-3 shadow-lg border-0">
      <p className="font-semibold mb-1">{formatShortDate(label)}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
          <span className="text-grey-300">{entry.name}:</span>
          <span className="font-semibold">
            {entry.name.toLowerCase().includes('revenue') ? formatPrice(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// ─── Change Badge ───
const ChangeBadge = ({ value }) => {
  if (value === 0) return <span className="text-xs text-grey-400">No change</span>;
  const isPositive = value > 0;
  const Icon = isPositive ? HiTrendingUp : HiTrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
      <Icon className="w-3.5 h-3.5" />
      {isPositive ? '+' : ''}{value}%
    </span>
  );
};

// ─── Status Dot ───
const StatusDot = ({ status }) => {
  const colors = {
    processing: 'bg-amber-400',
    confirmed: 'bg-blue-400',
    shipped: 'bg-violet-400',
    delivered: 'bg-emerald-400',
    cancelled: 'bg-red-400',
    pending: 'bg-amber-400',
    paid: 'bg-emerald-400',
    failed: 'bg-red-400',
    refunded: 'bg-grey-400',
  };
  return <span className={`w-2 h-2 rounded-full inline-block ${colors[status] || 'bg-grey-400'}`}></span>;
};

const Analytics = () => {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data: res } = await API.get(`/admin/analytics?period=${period}`);
        setData(res.data);
      } catch {
        setData(null);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-grey-100 animate-pulse"></div>
          <div className="h-9 w-64 bg-grey-100 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-grey-100 animate-pulse"></div>)}
        </div>
        <div className="h-80 bg-grey-100 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-grey-100 animate-pulse"></div>
          <div className="h-72 bg-grey-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-grey-500">
        <p>Failed to load analytics data.</p>
      </div>
    );
  }

  const { summary, revenueTimeline, orderStatusBreakdown, topProducts, recentOrders, recentUsers } = data;

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(summary.totalRevenue),
      change: summary.revenueChange,
      icon: HiCurrencyRupee,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Orders',
      value: summary.totalOrders,
      change: summary.ordersChange,
      icon: HiShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Avg. Order Value',
      value: formatPrice(summary.avgOrderValue),
      change: summary.avgOrderChange,
      icon: HiReceiptTax,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Paid Revenue',
      value: formatPrice(summary.paidRevenue),
      change: null,
      icon: HiCheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-grey-500">Revenue, orders & performance insights</p>
        </div>
        <div className="flex bg-grey-100 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                period === p.value
                  ? 'bg-primary text-white'
                  : 'text-grey-500 hover:text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white border border-grey-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              {card.change !== null && <ChangeBadge value={card.change} />}
            </div>
            <p className="text-xl font-bold font-heading">{card.value}</p>
            <p className="text-[11px] text-grey-500 uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Revenue Timeline Chart ─── */}
      <div className="bg-white border border-grey-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-bold text-sm">Revenue Over Time</h3>
            <p className="text-[11px] text-grey-400 mt-0.5">Revenue and orders trend</p>
          </div>
        </div>
        {revenueTimeline.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="revenue"
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#ordersGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-grey-400 text-sm">
            No order data for this period
          </div>
        )}
      </div>

      {/* ─── Middle Row: Order Breakdown + Top Products ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white border border-grey-200 p-6">
          <h3 className="font-heading font-bold text-sm mb-5">Order Status Breakdown</h3>
          {orderStatusBreakdown.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-44 h-44 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {orderStatusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, STATUS_LABELS[name] || name]}
                      contentStyle={{ fontSize: 12, borderRadius: 0 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {orderStatusBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
                      <span className="text-xs text-grey-600 capitalize">{STATUS_LABELS[item.name] || item.name}</span>
                    </div>
                    <span className="text-xs font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-grey-400 text-sm">
              No orders for this period
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-grey-200 p-6">
          <h3 className="font-heading font-bold text-sm mb-5">Top Selling Products</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 6).map((product, i) => (
                <div key={product._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-grey-300 w-5 text-right">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-[11px] text-grey-400">{product.totalSold} sold</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 flex-shrink-0">
                    {formatPrice(product.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-grey-400 text-sm">
              No sales data for this period
            </div>
          )}
        </div>
      </div>

      {/* ─── Top Products Bar Chart ─── */}
      {topProducts.length > 0 && (
        <div className="bg-white border border-grey-200 p-6">
          <h3 className="font-heading font-bold text-sm mb-5">Revenue by Product</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={topProducts.slice(0, 8).map((p) => ({
                name: p.title.length > 20 ? p.title.slice(0, 20) + '...' : p.title,
                revenue: p.totalRevenue,
                sold: p.totalSold,
              }))}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#171717" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ─── Bottom Row: Recent Orders + Recent Users ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-grey-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-sm">Recent Orders</h3>
            <HiClock className="w-4 h-4 text-grey-300" />
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 py-2 border-b border-grey-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{order.customer}</p>
                      <StatusDot status={order.status} />
                    </div>
                    <p className="text-[11px] text-grey-400">
                      {order.items} item{order.items > 1 ? 's' : ''} &middot; {formatTimeAgo(order.date)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <StatusDot status={order.paymentStatus} />
                      <span className="text-[10px] text-grey-400 capitalize">{order.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-grey-400 text-center py-8">No orders yet</p>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white border border-grey-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-sm">Recent Signups</h3>
            <HiUserAdd className="w-4 h-4 text-grey-300" />
          </div>
          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 py-2 border-b border-grey-100 last:border-0">
                  <div className="w-8 h-8 bg-grey-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-grey-500">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-[11px] text-grey-400 truncate">{user.email}</p>
                  </div>
                  <span className="text-[11px] text-grey-400 flex-shrink-0">{formatTimeAgo(user.joined)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-grey-400 text-center py-8">No signups yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
