import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, calcDiscount } from '../../utils/formatPrice';
import { HiHeart, HiShoppingBag, HiEye } from 'react-icons/hi';
import QuickView from './QuickView';

const ProductCard = ({ product }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const discountPct = calcDiscount(product.price, product.discount);
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? product.stock ?? 0;
  const isSoldOut = product.soldOut || totalStock === 0;
  const isNew = new Date() - new Date(product.createdAt) < 7 * 24 * 60 * 60 * 1000;

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <Link to={`/products/${product._id}`} className="group block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-grey-100">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/500x666'}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {product.images?.[1] && (
            <img
              src={product.images[1]}
              alt={`${product.title} alternate`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              loading="lazy"
            />
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

          {/* Hover Action Icons */}
          {!isSoldOut && (
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-linear-to-t from-black/30 to-transparent pt-8">
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
