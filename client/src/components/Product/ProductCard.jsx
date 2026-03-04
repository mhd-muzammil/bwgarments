import { Link } from 'react-router-dom';
import { formatPrice, calcDiscount } from '../../utils/formatPrice';
import { HiHeart, HiShoppingBag, HiSearch } from 'react-icons/hi';

const ProductCard = ({ product }) => {
  const discountPct = calcDiscount(product.price, product.discount);
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? product.stock ?? 0;
  const isSoldOut = product.soldOut || totalStock === 0;

  return (
    <Link to={`/products/${product._id}`} className="group block animate-fade-in">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-grey-100">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/500x500'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPct > 0 && !isSoldOut && (
          <span className="absolute top-3 left-3 bg-success text-white text-[11px] font-bold w-11 h-11 rounded-full flex items-center justify-center shadow-md">
            -{discountPct}%
          </span>
        )}

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-primary text-xs font-bold uppercase tracking-widest px-6 py-2">
              Sold Out
            </span>
          </div>
        )}

        {/* Hover Action Icons */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors transform translate-y-3 group-hover:translate-y-0 duration-300">
            <HiHeart className="w-4 h-4" />
          </span>
          <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors transform translate-y-3 group-hover:translate-y-0 duration-300 delay-75">
            <HiShoppingBag className="w-4 h-4" />
          </span>
          <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors transform translate-y-3 group-hover:translate-y-0 duration-300 delay-150">
            <HiSearch className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Info - Centered */}
      <div className="py-4 text-center">
        <h3 className="font-heading text-sm sm:text-base font-bold text-primary line-clamp-1 mb-1">
          {product.title}
        </h3>
        <p className="text-[11px] text-grey-400 mb-2 uppercase tracking-wider">
          {product.subCategory || product.mainCategory}
        </p>
        <div className="flex items-center justify-center gap-2">
          {product.discount > 0 ? (
            <>
              <span className="text-xs text-grey-400 line-through">{formatPrice(product.price)}</span>
              <span className="text-sm font-bold text-success">{formatPrice(product.discount)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
