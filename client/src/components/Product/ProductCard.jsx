import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, calcDiscount } from '../../utils/formatPrice';
import { HiHeart, HiShoppingBag, HiEye } from 'react-icons/hi';
import QuickView from './QuickView';

const ProductCard = ({ product }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false });
  const discountPct = calcDiscount(product.price, product.discount);
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? product.stock ?? 0;
  const isSoldOut = product.soldOut || totalStock === 0;
  const isNew = new Date() - new Date(product.createdAt) < 7 * 24 * 60 * 60 * 1000;
  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/500x666'];
  const hasMultiple = images.length > 1;

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  // Touch swipe handlers for mobile carousel
  const onTouchStart = useCallback((e) => {
    touchRef.current.startX = e.touches[0].clientX;
    touchRef.current.startY = e.touches[0].clientY;
    touchRef.current.swiping = false;
  }, []);

  const onTouchMove = useCallback((e) => {
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;
    // Only count as swipe if horizontal movement is dominant
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 15) {
      touchRef.current.swiping = true;
    }
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!touchRef.current.swiping || !hasMultiple) return;
    e.preventDefault(); // Prevent link navigation on swipe
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    if (dx < -40) {
      setImgIndex((i) => (i + 1) % images.length);
    } else if (dx > 40) {
      setImgIndex((i) => (i - 1 + images.length) % images.length);
    }
  }, [hasMultiple, images.length]);

  const handleClick = useCallback((e) => {
    // Block navigation if user just swiped
    if (touchRef.current.swiping) {
      e.preventDefault();
    }
  }, []);

  return (
    <>
      <Link to={`/products/${product._id}`} className="group block" onClick={handleClick}>
        {/* Image Container */}
        <div
          className="relative aspect-[3/4] overflow-hidden bg-grey-100"
          onTouchStart={hasMultiple ? onTouchStart : undefined}
          onTouchMove={hasMultiple ? onTouchMove : undefined}
          onTouchEnd={hasMultiple ? onTouchEnd : undefined}
        >
          {/* Mobile: current image based on swipe index */}
          <img
            src={images[imgIndex]}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 sm:block"
            loading="lazy"
          />

          {/* Desktop: hover to see second image */}
          {hasMultiple && (
            <img
              src={images[imgIndex === 0 ? 1 : imgIndex]}
              alt={`${product.title} alternate`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block"
              loading="lazy"
            />
          )}

          {/* Mobile dot indicators */}
          {hasMultiple && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:hidden">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === imgIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPct > 0 && !isSoldOut && (
              <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 tracking-wider">
                -{discountPct}%
              </span>
            )}
            {isNew && !isSoldOut && (
              <span className="bg-accent text-primary text-[10px] font-bold px-2.5 py-1 tracking-wider">
                NEW
              </span>
            )}
          </div>

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-white text-primary text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-2.5">
                Sold Out
              </span>
            </div>
          )}

          {/* Hover Action Icons (desktop) */}
          {!isSoldOut && (
            <div className="absolute bottom-0 left-0 right-0 p-3 items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-linear-to-t from-black/30 to-transparent pt-8 hidden sm:flex">
              <span className="w-9 h-9 bg-white flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110 cursor-pointer">
                <HiHeart className="w-4 h-4" />
              </span>
              <span className="w-9 h-9 bg-white flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110 cursor-pointer">
                <HiShoppingBag className="w-4 h-4" />
              </span>
              <span
                onClick={handleQuickView}
                className="w-9 h-9 bg-white flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110 cursor-pointer"
              >
                <HiEye className="w-4 h-4" />
              </span>
            </div>
          )}

          {/* Low stock indicator */}
          {!isSoldOut && totalStock <= 5 && totalStock > 0 && (
            <div className="absolute top-3 right-3">
              <span className="bg-danger/90 text-white text-[9px] font-bold px-2 py-0.5 tracking-wider animate-pulse-soft">
                ONLY {totalStock} LEFT
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pt-4 pb-2">
          <p className="text-[10px] text-grey-400 uppercase tracking-[0.15em] mb-1">
            {product.subCategory || product.mainCategory}
          </p>
          <h3 className="font-heading text-sm sm:text-[15px] font-semibold text-primary line-clamp-1 group-hover:text-grey-700 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            {product.discount > 0 ? (
              <>
                <span className="text-sm font-bold text-primary">{formatPrice(product.discount)}</span>
                <span className="text-xs text-grey-400 line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Size availability dots */}
          <div className="flex gap-1 mt-2.5">
            {product.sizes?.map((s) => (
              <span
                key={s.size}
                className={`text-[9px] w-6 h-5 flex items-center justify-center border ${
                  s.stock > 0 ? 'border-grey-300 text-grey-500' : 'border-grey-200 text-grey-300 line-through'
                }`}
              >
                {s.size}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickView product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
};

export default ProductCard;
