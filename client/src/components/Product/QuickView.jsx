import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiX, HiChevronLeft, HiChevronRight, HiShoppingBag, HiExternalLink } from 'react-icons/hi';
import { formatPrice, calcDiscount } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const QuickView = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const { addToCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600x800'];
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? 0;
  const isSoldOut = product.soldOut || totalStock === 0;
  const discountPct = calcDiscount(product.price, product.discount);
  const selectedSizeStock = selectedSize
    ? product.sizes?.find((s) => s.size === selectedSize)?.stock || 0
    : 0;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      onClose();
      navigate('/login');
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    const result = await addToCart(product._id, selectedSize, quantity);
    if (result.success) {
      toast.success('Added to cart!');
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"></div>

      <div
        className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-grey-100 transition-colors shadow-sm">
          <HiX className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row max-h-[90vh]">
          {/* Image */}
          <div className="relative sm:w-1/2 aspect-square sm:aspect-auto sm:min-h-[480px] bg-grey-100 shrink-0 overflow-hidden group">
            <img src={images[imageIndex]} alt={product.title} className="w-full h-full object-cover" />

            {images.length > 1 && (
              <>
                <button onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <HiChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setImageIndex((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <HiChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setImageIndex(i)} className={`h-1.5 rounded-full transition-all ${i === imageIndex ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`} />
                  ))}
                </div>
              </>
            )}

            {discountPct > 0 && !isSoldOut && (
              <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 tracking-wider">-{discountPct}%</span>
            )}
          </div>

          {/* Info */}
          <div className="sm:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col">
            <p className="text-[10px] text-accent font-semibold tracking-[0.2em] uppercase">{product.mainCategory} / {product.subCategory}</p>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary mt-2 leading-tight">{product.title}</h2>

            <div className="flex items-end gap-3 mt-3">
              {product.discount > 0 ? (
                <>
                  <span className="text-2xl font-bold text-primary">{formatPrice(product.discount)}</span>
                  <span className="text-sm text-grey-400 line-through">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-grey-500 text-xs leading-relaxed mt-4 line-clamp-3">{product.description}</p>

            {!isSoldOut && (
              <div className="mt-5">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-grey-600 mb-2">Select Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes?.map((s) => (
                    <button
                      key={s.size}
                      disabled={s.stock === 0}
                      onClick={() => { setSelectedSize(selectedSize === s.size ? null : s.size); setQuantity(1); }}
                      className={`w-11 h-11 text-xs font-semibold border-2 transition-all ${
                        s.stock === 0 ? 'border-grey-200 text-grey-300 cursor-not-allowed line-through'
                        : selectedSize === s.size ? 'border-primary bg-primary text-white'
                        : 'border-grey-300 text-grey-700 hover:border-primary'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSize && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-grey-600 mb-2">Quantity</p>
                <div className="flex items-center border border-grey-300 w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-grey-100 text-sm">-</button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-semibold border-x border-grey-300">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(selectedSizeStock, quantity + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-grey-100 text-sm">+</button>
                </div>
                {selectedSizeStock <= 5 && <p className="text-[10px] text-warning mt-1">Only {selectedSizeStock} left</p>}
              </div>
            )}

            <div className="flex-1 min-h-4"></div>

            <div className="mt-5 space-y-2.5">
              {isSoldOut ? (
                <button disabled className="btn-disabled w-full text-center">Sold Out</button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || cartLoading}
                  className={`w-full text-center flex items-center justify-center gap-2 ${selectedSize ? 'btn-primary' : 'btn-disabled'}`}
                >
                  <HiShoppingBag className="w-4 h-4" />
                  {cartLoading ? 'Adding...' : !selectedSize ? 'Select a Size' : 'Add to Cart'}
                </button>
              )}
              <Link to={`/products/${product._id}`} onClick={onClose} className="w-full text-center flex items-center justify-center gap-2 btn-outline text-xs">
                View Full Details <HiExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;
