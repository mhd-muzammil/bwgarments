import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product?.discount || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal >= 1499 ? 0 : 99;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post('/orders/checkout', { shippingAddress: address });
      toast.success('Order placed successfully!');
      await fetchCart();
      navigate(`/orders`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    }
    setLoading(false);
  };

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container-custom py-10 animate-fade-in">
      <p className="section-subtitle">Checkout</p>
      <h1 className="section-title mb-10">Complete Your Order</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading text-lg font-bold mb-4">Shipping Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Full Name *</label>
                <input name="fullName" value={address.fullName} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Phone *</label>
                <input name="phone" value={address.phone} onChange={handleChange} required className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Address Line 1 *</label>
              <input name="addressLine1" value={address.addressLine1} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Address Line 2</label>
              <input name="addressLine2" value={address.addressLine2} onChange={handleChange} className="input-field" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">City *</label>
                <input name="city" value={address.city} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">State *</label>
                <input name="state" value={address.state} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Pincode *</label>
                <input name="pincode" value={address.pincode} onChange={handleChange} required className="input-field" />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-grey-50 p-6 sticky top-24">
              <h3 className="font-heading text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span className="text-grey-600 truncate mr-2">
                      {item.product?.title} ({item.size}) × {item.quantity}
                    </span>
                    <span className="font-semibold flex-shrink-0">
                      {formatPrice((item.product?.discount || item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-grey-200 mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-grey-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-grey-500">Shipping</span>
                  <span className="text-success">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <hr className="border-grey-200" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-center mt-6"
              >
                {loading ? 'Placing Order...' : `Place Order — ${formatPrice(total)}`}
              </button>
              <p className="text-[10px] text-grey-400 text-center mt-3">
                Payment collection ready for Razorpay/Stripe integration
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
