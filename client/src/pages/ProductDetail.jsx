import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiChevronRight, HiShare, HiHeart, HiOutlineHeart, HiSwitchHorizontal } from 'react-icons/hi';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, calcDiscount } from '../utils/formatPrice';
import ImageGallery from '../components/Product/ImageGallery';
import SizeSelector from '../components/Product/SizeSelector';
import QuantitySelector from '../components/Product/QuantitySelector';
import StockBadge from '../components/Product/StockBadge';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data.data);
      } catch {
        navigate('/products');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="animate-pulse">
            <div className="aspect-[3/4] bg-grey-200"></div>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-grey-200 w-1/3"></div>
            <div className="h-8 bg-grey-200 w-2/3"></div>
            <div className="h-6 bg-grey-200 w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? product.stock ?? 0;
  const isSoldOut = product.soldOut || totalStock === 0;
  const discountPct = calcDiscount(product.price, product.discount);
  const selectedSizeStock = selectedSize
    ? product.sizes?.find((s) => s.size === selectedSize)?.stock || 0
    : totalStock;

  const canAddToCart = !isSoldOut && selectedSize && selectedSizeStock > 0;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
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
    } else {
      toast.error(result.message);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied!');
  };

  return (
    <div className="container-custom py-6 sm:py-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-grey-500 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <HiChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
        <HiChevronRight className="w-3 h-3" />
        <Link to={`/products?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
        <HiChevronRight className="w-3 h-3" />
        <span className="text-primary font-medium truncate max-w-[150px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        {/* Left: Gallery */}
        <ImageGallery
          images={product.images}
          discount={discountPct}
          title={product.title}
        />

        {/* Right: Product Info */}
        <div className="space-y-6">
          {/* Category */}
          <p className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold">{product.category}</p>

          {/* Title */}
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-end gap-4">
            {product.discount > 0 ? (
              <>
                <span className="text-3xl font-bold text-primary">{formatPrice(product.discount)}</span>
                <span className="text-lg text-grey-400 line-through">{formatPrice(product.price)}</span>
                <span className="badge bg-success/10 text-success text-xs font-bold">
                  {discountPct}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Stock Status */}
          <StockBadge soldOut={isSoldOut} stock={totalStock} />

          {/* Description */}
          <p className="text-grey-600 text-sm leading-relaxed border-t border-b border-grey-200 py-6">
            {product.description}
          </p>

          {/* Size Selector */}
          <SizeSelector
            sizes={product.sizes}
            selectedSize={selectedSize}
            onSelect={(size) => {
              setSelectedSize(size);
              setQuantity(1);
            }}
          />

          {/* Quantity */}
          {selectedSize && !isSoldOut && (
            <QuantitySelector
              quantity={quantity}
              maxStock={selectedSizeStock}
              onChange={setQuantity}
            />
          )}

          {/* Add to Cart Button */}
          <div className="pt-2">
            {isSoldOut ? (
              <button disabled className="btn-disabled w-full text-center">
                Sold Out
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart || cartLoading}
                className={`w-full text-center ${canAddToCart ? 'btn-primary' : 'btn-disabled'}`}
              >
                {cartLoading ? 'Adding...' : !selectedSize ? 'Select a Size' : 'Add to Cart'}
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className="border-t border-grey-200 pt-6 space-y-3">
            <div className="flex items-center gap-6 text-xs text-grey-500">
              <span><span className="font-semibold text-grey-700">SKU:</span> {product.sku}</span>
              <span><span className="font-semibold text-grey-700">Category:</span> {product.category}</span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-xs text-grey-500 hover:text-primary transition-colors"
              >
                <HiShare className="w-4 h-4" /> Share
              </button>
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className="flex items-center gap-2 text-xs text-grey-500 hover:text-danger transition-colors"
              >
                {wishlisted ? <HiHeart className="w-4 h-4 text-danger" /> : <HiOutlineHeart className="w-4 h-4" />}
                Wishlist
              </button>
              <button className="flex items-center gap-2 text-xs text-grey-500 hover:text-primary transition-colors">
                <HiSwitchHorizontal className="w-4 h-4" /> Compare
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
