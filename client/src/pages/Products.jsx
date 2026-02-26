import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import ProductCard from '../components/Product/ProductCard';
import { HiSearch, HiAdjustments } from 'react-icons/hi';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/products/categories');
        setCategories(data.data);
      } catch {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('limit', '12');
        if (currentCategory) params.set('category', currentCategory);
        if (currentSort) params.set('sort', currentSort);
        if (search) params.set('search', search);

        const { data } = await API.get(`/products?${params.toString()}`);
        setProducts(data.data);
        setPagination(data.pagination);
      } catch {}
      setLoading(false);
    };
    fetchProducts();
  }, [currentCategory, currentSort, currentPage, search]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div className="container-custom py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="section-subtitle">Our Collection</p>
        <h1 className="section-title">
          {currentCategory || 'All Products'}
        </h1>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-grey-200">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Category filter */}
          <select
            value={currentCategory}
            onChange={(e) => updateParam('category', e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input-field w-auto"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-grey-500 mb-6">
        Showing {products.length} of {pagination.total || 0} products
      </p>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-grey-200 mb-4"></div>
              <div className="h-3 bg-grey-200 w-2/3 mb-2"></div>
              <div className="h-4 bg-grey-200 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-grey-500 text-lg">No products found</p>
          <button onClick={() => { setSearch(''); setSearchParams({}); }} className="btn-outline mt-4">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => updateParam('page', page.toString())}
              className={`w-10 h-10 text-sm font-semibold transition-all ${
                page === currentPage
                  ? 'bg-primary text-white'
                  : 'border border-grey-300 hover:border-primary'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
