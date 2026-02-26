import { useState, useEffect } from 'react';
import API from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import { HiArchive } from 'react-icons/hi';

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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders');
        setOrders(data.data);
      } catch {}
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-grey-100"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-10 animate-fade-in">
      <p className="section-subtitle">My Account</p>
      <h1 className="section-title mb-10">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <HiArchive className="w-16 h-16 text-grey-300 mx-auto mb-4" />
          <p className="text-grey-500 text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border border-grey-200 p-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-grey-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-grey-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`badge text-[10px] ${statusColors[order.orderStatus]}`}>
                    {order.orderStatus}
                  </span>
                  <span className={`badge text-[10px] ${paymentColors[order.paymentStatus]}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-12 h-14 object-cover bg-grey-100" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-grey-500">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-grey-100">
                <p className="text-xs text-grey-500">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </p>
                <p className="font-heading text-lg font-bold">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
