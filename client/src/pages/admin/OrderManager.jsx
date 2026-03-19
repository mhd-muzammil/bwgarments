import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronDown, HiChevronUp, HiLocationMarker, HiPhone, HiUser, HiExternalLink } from 'react-icons/hi';
import API from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const statusOptions = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const paymentOptions = ['pending', 'paid', 'failed', 'refunded'];

const statusColors = {
  processing: 'bg-warning/10 text-warning',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

const paymentColors = {
  pending: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
  refunded: 'bg-grey-100 text-grey-600',
};

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filterStatus) params.set('orderStatus', filterStatus);
      const { data } = await API.get(`/orders/admin/all?${params.toString()}`);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [page, filterStatus]);

  const handleStatusUpdate = async (orderId, field, value) => {
    try {
      await API.put(`/orders/${orderId}/status`, { [field]: value });
      toast.success('Order updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update');
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading text-2xl font-bold">Orders</h2>
          <p className="text-sm text-grey-500">{pagination.total || 0} total orders</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="input-field w-auto text-xs"
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse h-24 bg-grey-100"></div>
          ))
        ) : orders.length === 0 ? (
          <p className="text-center py-10 text-grey-500">No orders found</p>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            return (
              <div key={order._id} className={`border transition-all duration-300 ${isExpanded ? 'border-accent shadow-lg' : 'border-grey-200 hover:border-grey-400'}`}>
                {/* Order Header — clickable */}
                <div
                  className="p-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-grey-100 rounded-full flex-shrink-0 mt-0.5">
                        {isExpanded ? <HiChevronUp className="w-4 h-4 text-grey-600" /> : <HiChevronDown className="w-4 h-4 text-grey-600" />}
                      </div>
                      <div>
                        <Link to={`/admin/orders/${order._id}`} onClick={(e) => e.stopPropagation()} className="text-xs font-semibold hover:text-blue-600 inline-flex items-center gap-1">Order #{order._id.slice(-8).toUpperCase()} <HiExternalLink className="w-3 h-3" /></Link>
                        <p className="text-xs text-grey-500">
                          {order.user?.name} ({order.user?.email}) — {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <p className="font-heading text-lg font-bold">{formatPrice(order.totalAmount)}</p>
                  </div>

                  <div className="text-xs text-grey-500 mb-3 ml-11">
                    {order.items.map((item, i) => (
                      <span key={i}>{item.title} ({item.size}) ×{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 ml-11">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'orderStatus', e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[10px] font-bold px-3 py-1 border-0 cursor-pointer ${statusColors[order.orderStatus]}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>

                    <select
                      value={order.paymentStatus}
                      onChange={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'paymentStatus', e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-bold px-3 py-1 border border-grey-200 cursor-pointer"
                    >
                      {paymentOptions.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>

                    <span className="text-[10px] text-grey-400 ml-auto">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                    </span>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-grey-200 bg-grey-50 p-5 animate-fade-in">
                    {/* Order Items with Images */}
                    <h4 className="text-xs font-bold uppercase tracking-widest text-grey-600 mb-4">Order Items</h4>
                    <div className="space-y-4 mb-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 bg-white p-3 border border-grey-100 rounded-sm">
                          {/* Product Image */}
                          <div className="w-20 h-24 flex-shrink-0 bg-grey-100 overflow-hidden rounded-sm">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-grey-400 text-xs">No Image</div>
                            )}
                          </div>
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm font-semibold text-primary leading-tight">{item.title}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-grey-500">
                              <span>Size: <span className="font-semibold text-primary">{item.size}</span></span>
                              <span>Qty: <span className="font-semibold text-primary">{item.quantity}</span></span>
                              <span>Price: <span className="font-semibold text-primary">{formatPrice(item.price)}</span></span>
                            </div>
                            <p className="text-sm font-bold text-accent mt-2">
                              Subtotal: {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="bg-white border border-grey-100 p-4 rounded-sm">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-grey-600 mb-3 flex items-center gap-2">
                          <HiLocationMarker className="w-3.5 h-3.5" /> Shipping Address
                        </h4>
                        <div className="text-sm text-grey-700 space-y-1">
                          <p className="font-semibold flex items-center gap-2">
                            <HiUser className="w-3.5 h-3.5 text-grey-400" /> {order.shippingAddress.fullName}
                          </p>
                          <p className="flex items-center gap-2">
                            <HiPhone className="w-3.5 h-3.5 text-grey-400" /> {order.shippingAddress.phone}
                          </p>
                          <p className="text-grey-500 text-xs mt-1">
                            {order.shippingAddress.addressLine1}
                            {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                          </p>
                          <p className="text-grey-500 text-xs">
                            {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Summary Footer */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-grey-200">
                      <div className="flex gap-2">
                        <span className={`badge text-[10px] ${statusColors[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                        <span className={`badge text-[10px] ${paymentColors[order.paymentStatus]}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="font-heading text-xl font-bold">Total: {formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 text-xs font-semibold ${p === page ? 'bg-primary text-white' : 'border border-grey-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManager;
