import { Link } from 'react-router-dom';
import { HiX, HiPlus, HiMinus, HiTrash, HiShoppingBag } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';

const CartDrawer = ({ open, onClose }) => {
  const { cart, loading, updateItem, removeItem, cartCount } = useCart();
  const { user } = useAuth();

  if (!open) return null;

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product?.discount || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"></div>

      {/* Drawer — slides from right */}
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-200">
          <div className="flex items-center gap-2">
            <HiShoppingBag className="w-5 h-5" />
            <h2 className="font-heading text-lg font-bold">Your Cart</h2>
            {cartCount > 0 && (
              <span className="bg-accent text-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-grey-100 transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <HiShoppingBag className="w-12 h-12 text-grey-300 mb-4" />
              <p className="text-grey-500 text-sm mb-4">Please login to view your cart</p>
              <Link to="/login" onClick={onClose} className="btn-primary">
                Login
              </Link>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <HiShoppingBag className="w-12 h-12 text-grey-300 mb-4" />
              <p className="font-heading text-lg font-semibold text-grey-700 mb-1">Cart is empty</p>
              <p className="text-grey-400 text-sm mb-6">Add some products to get started</p>
              <Link to="/products" onClick={onClose} className="btn-primary">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-grey-100">
              {cart.items.map((item) => {
                const product = item.product;
                if (!product) return null;
                const price = product.discount || product.price;

                return (
                  <div key={item._id} className="flex gap-4 p-4 group">
                    {/* Thumbnail */}
                    <Link to={`/products/${product._id}`} onClick={onClose} className="shrink-0">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/100'}
                        alt={product.title}
                        className="w-20 h-24 object-cover bg-grey-100"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${product._id}`} onClick={onClose}>
                        <h4 className="text-sm font-semibold text-primary line-clamp-1 hover:text-grey-700 transition-colors">
                          {product.title}
                        </h4>
                      </Link>
                      <p className="text-[10px] text-grey-400 uppercase tracking-wider mt-0.5">
                        Size: {item.size}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">{formatPrice(price)}</p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-grey-300">
                          <button
                            onClick={() => item.quantity > 1 && updateItem(item._id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center hover:bg-grey-100 transition-colors disabled:opacity-40"
                          >
                            <HiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 h-7 flex items-center justify-center text-xs font-semibold border-x border-grey-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem(item._id, item.quantity + 1)}
                            disabled={loading}
                            className="w-7 h-7 flex items-center justify-center hover:bg-grey-100 transition-colors disabled:opacity-40"
                          >
                            <HiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-1.5 text-grey-400 hover:text-danger transition-colors"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — only show when items exist */}
        {user && cart.items.length > 0 && (
          <div className="border-t border-grey-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-grey-500">Subtotal</span>
              <span className="text-lg font-bold text-primary">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-[10px] text-grey-400">Shipping calculated at checkout</p>
            <Link
              to="/checkout"
              onClick={onClose}
              className="btn-primary w-full text-center block"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="btn-outline w-full text-center block text-xs"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
