import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';
import {
  HiArrowLeft, HiPrinter, HiClock, HiCheck, HiTruck,
  HiLocationMarker, HiPhone, HiUser, HiMail, HiChat,
  HiPaperAirplane,
} from 'react-icons/hi';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatShortDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const statusStyles = {
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

const StatusBadge = ({ status }) => (
  <span className={`text-xs px-2 py-1 border capitalize font-semibold ${statusStyles[status] || statusStyles.pending}`}>
    {status}
  </span>
);

const timelineIcons = {
  created: HiClock,
  status: HiCheck,
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const fetchOrder = async () => {
    try {
      const { data } = await API.get(`/orders/${id}/detail`);
      setOrder(data.data);
      setOrderStatus(data.data.orderStatus);
      setPaymentStatus(data.data.paymentStatus);
    } catch {
      toast.error('Failed to load order');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      await API.put(`/orders/${id}/status`, { orderStatus, paymentStatus });
      toast.success('Status updated');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      await API.post(`/orders/${id}/notes`, { note });
      setNote('');
      toast.success('Note added');
      fetchOrder();
    } catch {
      toast.error('Failed to add note');
    }
    setAddingNote(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-grey-100 w-48"></div>
        <div className="h-64 bg-grey-100"></div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-grey-500">Order not found</div>;
  }

  const orderId = order._id.toString().slice(-8).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="p-2 hover:bg-grey-100 transition-colors">
            <HiArrowLeft className="w-5 h-5 text-grey-500" />
          </Link>
          <div>
            <h2 className="font-heading text-2xl font-bold">Order #{orderId}</h2>
            <p className="text-sm text-grey-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
          <button onClick={handlePrint} className="btn-outline flex items-center gap-1.5 text-sm ml-2">
            <HiPrinter className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white border border-grey-200 p-5">
            <h3 className="font-heading font-bold text-sm mb-4">Order Items ({order.items.length})</h3>
            <div className="divide-y divide-grey-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-14 h-18 object-cover bg-grey-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-grey-400">Size: {item.size} &middot; Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-[10px] text-grey-400">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-grey-200 pt-3 mt-3 flex justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white border border-grey-200 p-5 print:hidden">
            <h3 className="font-heading font-bold text-sm mb-4">Update Status</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-[10px] text-grey-500 uppercase tracking-wider block mb-1">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="py-2 px-3 border border-grey-300 text-sm bg-white"
                >
                  {['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-grey-500 uppercase tracking-wider block mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="py-2 px-3 border border-grey-300 text-sm bg-white"
                >
                  {['pending', 'paid', 'failed', 'refunded'].map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={orderStatus === order.orderStatus && paymentStatus === order.paymentStatus}
                className="btn-primary text-sm disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white border border-grey-200 p-5 print:hidden">
            <h3 className="font-heading font-bold text-sm mb-4 flex items-center gap-2">
              <HiChat className="w-4 h-4 text-grey-400" /> Admin Notes
            </h3>

            {order.adminNotes?.length > 0 && (
              <div className="space-y-3 mb-4">
                {order.adminNotes.map((n, i) => (
                  <div key={i} className="bg-grey-50 p-3 border-l-2 border-grey-300">
                    <p className="text-sm">{n.note}</p>
                    <p className="text-[10px] text-grey-400 mt-1">
                      {n.author?.name || 'Admin'} &middot; {formatDate(n.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Add a note..."
                className="flex-1 py-2 px-3 border border-grey-300 text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleAddNote}
                disabled={addingNote || !note.trim()}
                className="btn-primary text-sm flex items-center gap-1 disabled:opacity-50"
              >
                <HiPaperAirplane className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column — Customer, Shipping, Timeline */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white border border-grey-200 p-5">
            <h3 className="font-heading font-bold text-sm mb-3">Customer</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <HiUser className="w-4 h-4 text-grey-400" />
                <span>{order.user?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HiMail className="w-4 h-4 text-grey-400" />
                <span className="text-grey-600">{order.user?.email}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-grey-200 p-5">
            <h3 className="font-heading font-bold text-sm mb-3">Shipping Address</h3>
            <div className="space-y-1.5 text-sm text-grey-600">
              <div className="flex items-start gap-2">
                <HiUser className="w-4 h-4 text-grey-400 mt-0.5" />
                <span>{order.shippingAddress.fullName}</span>
              </div>
              <div className="flex items-start gap-2">
                <HiPhone className="w-4 h-4 text-grey-400 mt-0.5" />
                <span>{order.shippingAddress.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <HiLocationMarker className="w-4 h-4 text-grey-400 mt-0.5" />
                <div>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-grey-200 p-5">
            <h3 className="font-heading font-bold text-sm mb-4">Timeline</h3>
            <div className="space-y-0">
              {order.timeline?.map((event, i) => {
                const Icon = timelineIcons[event.type] || HiClock;
                const isLast = i === order.timeline.length - 1;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${
                        isLast ? 'bg-primary text-white' : 'bg-grey-100 text-grey-500'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {!isLast && <div className="w-px h-6 bg-grey-200"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium capitalize">{event.event}</p>
                      <p className="text-[10px] text-grey-400">
                        {formatDate(event.date)}
                        {event.by && ` — ${event.by}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Print-only invoice section */}
          <div className="hidden print:block bg-white border border-grey-200 p-5">
            <h3 className="font-heading font-bold text-lg mb-2">Invoice</h3>
            <p className="text-sm">Order #{orderId}</p>
            <p className="text-sm">Date: {formatShortDate(order.createdAt)}</p>
            <p className="text-sm">Customer: {order.user?.name} ({order.user?.email})</p>
            <p className="text-sm font-bold mt-2">Total: {formatPrice(order.totalAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
