import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import { HiCube, HiUsers, HiCurrencyRupee, HiClock, HiExclamation } from 'react-icons/hi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/stats');
        setStats(data.data);
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-28 bg-grey-100"></div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: HiCube, color: 'text-primary' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: HiUsers, color: 'text-blue-600' },
    { label: 'Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: HiCurrencyRupee, color: 'text-success' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: HiClock, color: 'text-warning' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-grey-500">Welcome to Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-grey-200 p-5">
            <card.icon className={`w-6 h-6 ${card.color} mb-3`} />
            <p className="text-2xl font-bold font-heading">{card.value}</p>
            <p className="text-xs text-grey-500 uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockProducts > 0 && (
        <div className="bg-warning/5 border border-warning/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <HiExclamation className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-sm">Low Stock Alert ({stats.lowStockProducts} Products)</h3>
          </div>
          <div className="space-y-2">
            {stats.lowStockProductsList?.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-grey-700">{p.title} <span className="text-grey-400">({p.sku})</span></span>
                <span className="text-warning font-semibold">
                  {p.sizes.reduce((s, sz) => s + sz.stock, 0)} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/admin/analytics" className="bg-grey-900 text-white p-5 hover:bg-grey-800 transition-colors">
          <h3 className="font-heading font-bold mb-1">Analytics</h3>
          <p className="text-xs text-grey-400">Revenue & performance</p>
        </Link>
        <Link to="/admin/products" className="bg-primary text-white p-5 hover:bg-grey-800 transition-colors">
          <h3 className="font-heading font-bold mb-1">Products</h3>
          <p className="text-xs text-grey-400">Add, edit, delete</p>
        </Link>
        <Link to="/admin/orders" className="bg-primary text-white p-5 hover:bg-grey-800 transition-colors">
          <h3 className="font-heading font-bold mb-1">Orders</h3>
          <p className="text-xs text-grey-400">View & update status</p>
        </Link>
        <Link to="/admin/products/new" className="bg-accent text-primary p-5 hover:bg-accent-light transition-colors">
          <h3 className="font-heading font-bold mb-1">Add Product</h3>
          <p className="text-xs text-grey-700">Create new listing</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
