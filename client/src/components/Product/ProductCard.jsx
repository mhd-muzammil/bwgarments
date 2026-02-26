import { Link } from 'react-router-dom';
import { formatPrice, calcDiscount } from '../../utils/formatPrice';

const ProductCard = ({ product }) => {
  const discountPct = calcDiscount(product.price, product.discount);
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? product.stock ?? 0;
  const isSoldOut = product.soldOut || totalStock === 0;

  return (
    <Link to={`/products/${product._id}`} className="group card overflow-hidden animate-fade-in">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-grey-100">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400x533'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPct > 0 && !isSoldOut && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-bold px-3 py-1 tracking-wider">
            -{discountPct}%
          </span>
        )}

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-primary text-xs font-bold uppercase tracking-widest px-6 py-2">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick View Hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="text-white text-xs uppercase tracking-widest font-semibold">Quick View</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-grey-400 mb-1">{product.category}</p>
        <h3 className="font-heading text-sm font-semibold text-primary line-clamp-1 mb-2">{product.title}</h3>
        <div className="flex items-center gap-2">
          {product.discount > 0 ? (
            <>
              <span className="text-sm font-bold text-primary">{formatPrice(product.discount)}</span>
              <span className="text-xs text-grey-400 line-through">{formatPrice(product.price)}</span>
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
