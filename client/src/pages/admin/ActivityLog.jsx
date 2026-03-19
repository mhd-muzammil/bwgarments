import { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import {
  HiClock, HiCube, HiShoppingCart, HiUser, HiTag, HiTicket,
  HiFilter,
} from 'react-icons/hi';

const typeIcons = {
  product: HiCube,
  order: HiShoppingCart,
  user: HiUser,
  category: HiTag,
  coupon: HiTicket,
};

const typeColors = {
  product: 'bg-blue-50 text-blue-600',
  order: 'bg-violet-50 text-violet-600',
  user: 'bg-amber-50 text-amber-600',
  category: 'bg-emerald-50 text-emerald-600',
  coupon: 'bg-pink-50 text-pink-600',
};

const formatDate = (d) => {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '30');
      if (typeFilter) params.set('targetType', typeFilter);
      const { data } = await API.get(`/admin/activity?${params}`);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch {
      setLogs([]);
    }
    setLoading(false);
  }, [page, typeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">Activity Log</h2>
          <p className="text-sm text-grey-500">Track all admin actions</p>
        </div>
        <div className="flex items-center gap-2">
          <HiFilter className="w-4 h-4 text-grey-400" />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 border border-grey-300 text-sm bg-white"
          >
            <option value="">All Types</option>
            <option value="product">Products</option>
            <option value="order">Orders</option>
            <option value="user">Users</option>
            <option value="category">Categories</option>
            <option value="coupon">Coupons</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => <div key={i} className="h-16 bg-grey-100 animate-pulse"></div>)}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <HiClock className="w-12 h-12 text-grey-200 mx-auto mb-4" />
          <p className="text-grey-500">No activity recorded yet</p>
          <p className="text-xs text-grey-400 mt-1">Actions will appear here as admins interact with the system</p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log) => {
            const Icon = typeIcons[log.targetType] || HiClock;
            const colorClass = typeColors[log.targetType] || 'bg-grey-50 text-grey-600';
            return (
              <div key={log._id} className="bg-white border border-grey-100 px-4 py-3 flex items-center gap-4 hover:bg-grey-50 transition-colors">
                <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{log.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-grey-400">
                      {log.actor?.name || 'System'}
                    </span>
                    <span className="text-grey-300">&middot;</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-grey-100 text-grey-500 capitalize">{log.targetType}</span>
                    <span className="text-grey-300">&middot;</span>
                    <span className="text-[10px] text-grey-400 font-mono">{log.action}</span>
                  </div>
                </div>
                <span className="text-xs text-grey-400 flex-shrink-0">{formatDate(log.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <button onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-grey-300 text-sm hover:bg-grey-50">Previous</button>
          )}
          <span className="text-sm text-grey-500">Page {page} of {pagination.pages}</span>
          {page < pagination.pages && (
            <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-grey-300 text-sm hover:bg-grey-50">Next</button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
