import { Link, useNavigate } from 'react-router-dom';
import { HiTrash, HiArrowRight, HiShoppingBag } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import QuantitySelector from '../components/Product/QuantitySelector';

const Cart = () => {
  const { cart, updateItem, removeItem, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product?.discount || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  if (!user) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <HiShoppingBag className="w-16 h-16 text-grey-300 mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Your Cart</h2>
        <p className="text-grey-500 mb-6">Please login to view your cart</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <HiShoppingBag className="w-16 h-16 text-grey-300 mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-grey-500 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="section-subtitle">Shopping</p>
          <h1 className="section-title">Your Cart</h1>
        </div>
        <button onClick={clearCart} className="text-xs text-grey-500 hover:text-danger transition-colors underline">
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const price = product.discount || product.price;
            const sizeStock = product.sizes?.find((s) => s.size === item.size)?.stock ?? product.stock ?? 10;

            return (
              <div key={item._id} className="flex gap-4 p-4 border border-grey-200 animate-fade-in">
                <Link to={`/products/${product._id}`} className="w-20 h-24 sm:w-24 sm:h-32 flex-shrink-0 bg-grey-100">
                  <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product._id}`} className="font-heading text-sm font-semibold line-clamp-1 hover:text-accent transition-colors">
                    {product.title}
                  </Link>
                  <p className="text-xs text-grey-500 mt-1">Size: {item.size}</p>
                  <p className="text-sm font-bold mt-2">{formatPrice(price)}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="scale-90 origin-left">
                      <QuantitySelector
                        quantity={item.quantity}
                        maxStock={sizeStock}
                        onChange={(qty) => updateItem(item._id, qty)}
                      />
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="p-2 text-grey-400 hover:text-danger transition-colors"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-grey-50 p-6 sticky top-24">
            <h3 className="font-heading text-lg font-bold mb-6">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-grey-500">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-500">Shipping</span>
                <span className="font-semibold text-success">{subtotal >= 1499 ? 'Free' : formatPrice(99)}</span>
              </div>
              <hr className="border-grey-200" />
              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold">{formatPrice(subtotal + (subtotal >= 1499 ? 0 : 99))}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full text-center mt-6 flex items-center justify-center gap-2"
            >
              Checkout <HiArrowRight />
            </button>
            <Link to="/products" className="block text-center text-xs text-grey-500 hover:text-primary mt-4 underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
