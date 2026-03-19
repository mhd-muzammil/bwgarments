import { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';
import {
  HiSearch, HiUsers, HiMail, HiShoppingCart, HiCurrencyRupee,
  HiChevronDown, HiChevronUp, HiShieldCheck, HiUser, HiClock,
} from 'react-icons/hi';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
};

const StatusBadge = ({ status }) => {
  const styles = {
    processing: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-violet-50 text-violet-700 border-violet-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-grey-50 text-grey-700 border-grey-200',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 border capitalize font-semibold ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

const CustomerManager = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const { data } = await API.get(`/admin/users?${params}`);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load users');
    }
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const toggleExpand = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setUserDetail(null);
      return;
    }

    setExpandedUser(userId);
    setDetailLoading(true);
    try {
      const { data } = await API.get(`/admin/users/${userId}`);
      setUserDetail(data.data);
    } catch {
      toast.error('Failed to load user details');
    }
    setDetailLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
      if (userDetail?.id === userId) {
        setUserDetail({ ...userDetail, role: newRole });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold">Customers</h2>
        <p className="text-sm text-grey-500">
          {pagination.total || 0} total users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 border border-grey-300 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="py-2.5 px-3 border border-grey-300 text-sm focus:outline-none focus:border-primary bg-white cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* User List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-grey-100 animate-pulse"></div>)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <HiUsers className="w-12 h-12 text-grey-200 mx-auto mb-4" />
          <p className="text-grey-500">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="bg-white border border-grey-200">
              {/* User Row */}
              <button
                onClick={() => toggleExpand(user.id)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-grey-50 transition-colors"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                  user.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-grey-100 text-grey-500'
                }`}>
                  {user.role === 'admin' ? (
                    <HiShieldCheck className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Name & Email */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    {user.role === 'admin' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold uppercase">Admin</span>
                    )}
                  </div>
                  <p className="text-xs text-grey-400 truncate">{user.email}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold">{user.totalOrders}</p>
                    <p className="text-[10px] text-grey-400 uppercase">Orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatPrice(user.totalSpent)}</p>
                    <p className="text-[10px] text-grey-400 uppercase">Spent</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-grey-500">{formatTimeAgo(user.lastOrderDate)}</p>
                    <p className="text-[10px] text-grey-400 uppercase">Last Order</p>
                  </div>
                </div>

                {/* Expand indicator */}
                <div className="text-grey-300 flex-shrink-0">
                  {expandedUser === user.id ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expanded Detail */}
              {expandedUser === user.id && (
                <div className="border-t border-grey-100 p-5 bg-grey-50">
                  {detailLoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-20 bg-grey-200"></div>
                      <div className="h-32 bg-grey-200"></div>
                    </div>
                  ) : userDetail ? (
                    <div className="space-y-5">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white p-3 border border-grey-200">
                          <HiShoppingCart className="w-4 h-4 text-blue-500 mb-1" />
                          <p className="text-lg font-bold">{userDetail.stats.totalOrders}</p>
                          <p className="text-[10px] text-grey-400 uppercase">Total Orders</p>
                        </div>
                        <div className="bg-white p-3 border border-grey-200">
                          <HiCurrencyRupee className="w-4 h-4 text-emerald-500 mb-1" />
                          <p className="text-lg font-bold">{formatPrice(userDetail.stats.totalSpent)}</p>
                          <p className="text-[10px] text-grey-400 uppercase">Total Spent</p>
                        </div>
                        <div className="bg-white p-3 border border-grey-200">
                          <HiCurrencyRupee className="w-4 h-4 text-violet-500 mb-1" />
                          <p className="text-lg font-bold">{formatPrice(userDetail.stats.avgOrderValue)}</p>
                          <p className="text-[10px] text-grey-400 uppercase">Avg Order</p>
                        </div>
                        <div className="bg-white p-3 border border-grey-200">
                          <HiClock className="w-4 h-4 text-grey-400 mb-1" />
                          <p className="text-sm font-bold">{formatDate(userDetail.createdAt)}</p>
                          <p className="text-[10px] text-grey-400 uppercase">Joined</p>
                        </div>
                      </div>

                      {/* Role Management */}
                      <div className="flex items-center gap-3 bg-white p-3 border border-grey-200">
                        <span className="text-xs font-semibold text-grey-600 uppercase tracking-wider">Role:</span>
                        <select
                          value={userDetail.role}
                          onChange={(e) => handleRoleChange(userDetail.id, e.target.value)}
                          className="text-sm border border-grey-300 px-2 py-1 focus:outline-none focus:border-primary bg-white"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <span className="text-xs text-grey-400 flex items-center gap-1">
                          <HiMail className="w-3 h-3" /> {userDetail.email}
                        </span>
                      </div>

                      {/* Order History */}
                      {userDetail.orders.length > 0 ? (
                        <div>
                          <h4 className="text-xs font-semibold text-grey-600 uppercase tracking-wider mb-2">
                            Order History ({userDetail.orders.length})
                          </h4>
                          <div className="bg-white border border-grey-200 divide-y divide-grey-100">
                            {userDetail.orders.map((order) => (
                              <div key={order.id} className="flex items-center justify-between p-3">
                                <div>
                                  <p className="text-xs font-mono text-grey-500">
                                    #{order.id.toString().slice(-8).toUpperCase()}
                                  </p>
                                  <p className="text-[11px] text-grey-400">
                                    {order.items} item{order.items > 1 ? 's' : ''} &middot; {formatDate(order.date)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={order.orderStatus} />
                                  <StatusBadge status={order.paymentStatus} />
                                  <span className="text-sm font-bold ml-2">{formatPrice(order.total)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-grey-400 text-center py-4">No orders yet</p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <button onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-grey-300 text-sm hover:bg-grey-50">
              Previous
            </button>
          )}
          <span className="text-sm text-grey-500">
            Page {page} of {pagination.pages}
          </span>
          {page < pagination.pages && (
            <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-grey-300 text-sm hover:bg-grey-50">
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
