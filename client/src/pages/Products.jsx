import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../utils/api';
import ProductCard from '../components/Product/ProductCard';
import { HiSearch, HiAdjustments, HiX, HiChevronDown, HiChevronRight } from 'react-icons/hi';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const currentMainCategory = searchParams.get('category') || searchParams.get('mainCategory') || '';
  const currentSubCategory = searchParams.get('subCategory') || searchParams.get('subcategory') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page')) || 1;


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
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
        if (currentMainCategory) params.set('mainCategory', currentMainCategory);
        if (currentSubCategory) params.set('subCategory', currentSubCategory);
        if (currentSort) params.set('sort', currentSort);
        if (search) params.set('search', search);

        const { data } = await API.get(`/products?${params.toString()}`);
        setProducts(data.data);
        setPagination(data.pagination);
      } catch {}
      setLoading(false);
    };
    fetchProducts();
  }, [currentMainCategory, currentSubCategory, currentSort, currentPage, search]);

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

  const clearAllFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  const startIdx = (currentPage - 1) * (pagination.limit || 12) + 1;
  const endIdx = Math.min(startIdx + products.length - 1, pagination.total || 0);

  return (
    <div className="animate-fade-in">

      <div className="bg-primary text-secondary py-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide mb-3">
            Shop
          </h1>
         
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="inline-flex items-center gap-2 text-grey-300 text-sm uppercase tracking-widest hover:text-white transition-colors"
          >
            Categories
            <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
          </button>
        </div>

       
        <div className={`absolute left-0 right-0 z-20 bg-grey-900/98 transition-all duration-500 overflow-hidden ${showCategories ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ top: '100%' }}
        >
          <div className="container-custom py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {categories.map((cat) => (
                <div key={cat._id}>
                  <button
                    onClick={() => {
                      updateParam('mainCategory', cat.name);
                      updateParam('subCategory', '');
                      setShowCategories(false);
                    }}
                    className="text-white font-heading text-lg hover:text-accent transition-colors uppercase tracking-wider mb-3 block"
                  >
                    {cat.name}
                  </button>
                  <ul className="space-y-1.5">
                    {cat.subcategories?.map((sub) => (
                      <li key={sub.slug}>
                        <button
                          onClick={() => {
                            updateParam('mainCategory', cat.name);
                            updateParam('subCategory', sub.name);
                            setShowCategories(false);
                          }}
                          className="text-grey-400 text-sm hover:text-white transition-colors"
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      <div className="container-custom">
        <div className="flex items-center justify-between py-4 border-b border-grey-200">
          <nav className="flex items-center gap-1.5 text-xs text-grey-500">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <HiChevronRight className="w-3 h-3" />
            <span className="text-primary font-semibold">Shop</span>
            {currentMainCategory && (
              <>
                <HiChevronRight className="w-3 h-3" />
                <span className="text-primary font-semibold">{currentMainCategory}</span>
              </>
            )}
            {currentSubCategory && (
              <>
                <HiChevronRight className="w-3 h-3" />
                <span className="text-primary font-semibold">{currentSubCategory}</span>
              </>
            )}
          </nav>
          {!loading && pagination.total > 0 && (
            <p className="text-xs text-grey-500">
              Showing {startIdx}–{endIdx} of {pagination.total} results
            </p>
          )}
        </div>
      </div>

      {/* ─── FILTERS BAR ─── */}
      <div className="container-custom">
        <div className="flex items-center justify-between py-4 mb-2">
          {/* Left: Filter & Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-grey-700 hover:text-primary transition-colors"
            >
              <HiAdjustments className="w-4 h-4" />
              Filter
            </button>
            <div className="relative hidden sm:block">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-grey-300 text-sm focus:outline-none focus:border-primary transition-colors w-56"
              />
            </div>
          </div>

          {/* Right: Sort */}
          <div className="flex items-center gap-2">
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="py-2 px-3 border border-grey-300 text-sm focus:outline-none focus:border-primary bg-white cursor-pointer"
            >
              <option value="newest">Sort by latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── MAIN LAYOUT: SIDEBAR + GRID ─── */}
      <div className="container-custom pb-16">
        <div className="flex gap-8">
          {/* ─── FILTER SIDEBAR (slide in) ─── */}
          <aside className={`transition-all duration-500 overflow-hidden flex-shrink-0 ${showFilters ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}>
            <div className="w-64 border border-grey-200 bg-grey-50 p-6 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-lg font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-grey-400 hover:text-primary">
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* Search (responsive) */}
              <div className="sm:hidden mb-6">
                <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-2">Search</label>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-grey-300 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Main Category */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-2">Category</label>
                <ul className="space-y-1.5">
                  <li>
                    <button
                      onClick={() => { updateParam('mainCategory', ''); updateParam('subCategory', ''); }}
                      className={`text-sm transition-colors ${!currentMainCategory ? 'text-primary font-bold' : 'text-grey-600 hover:text-primary'}`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <button
                        onClick={() => { updateParam('mainCategory', cat.name); updateParam('subCategory', ''); }}
                        className={`text-sm transition-colors ${currentMainCategory === cat.name ? 'text-primary font-bold' : 'text-grey-600 hover:text-primary'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sub Category */}
              {currentMainCategory && (
                <div className="mb-6">
                  <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-2">
                    {currentMainCategory}
                  </label>
                  <ul className="space-y-1.5">
                    <li>
                      <button
                        onClick={() => updateParam('subCategory', '')}
                        className={`text-sm transition-colors ${!currentSubCategory ? 'text-primary font-bold' : 'text-grey-600 hover:text-primary'}`}
                      >
                        All {currentMainCategory}
                      </button>
                    </li>
                    {categories.find(c => c.name === currentMainCategory)?.subcategories.map(sub => (
                      <li key={sub.slug}>
                        <button
                          onClick={() => updateParam('subCategory', sub.name)}
                          className={`text-sm transition-colors ${currentSubCategory === sub.name ? 'text-primary font-bold' : 'text-grey-600 hover:text-primary'}`}
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clear Filters */}
              {(currentMainCategory || currentSubCategory || search) && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 border border-grey-300 text-sm text-grey-600 hover:bg-primary hover:text-white hover:border-primary transition-all"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* ─── PRODUCT GRID ─── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-7">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-grey-200 mb-4"></div>
                    <div className="h-4 bg-grey-200 w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-grey-200 w-1/2 mx-auto mb-2"></div>
                    <div className="h-4 bg-grey-200 w-1/3 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-grey-500 text-lg mb-4">No products found</p>
                <button onClick={clearAllFilters} className="btn-outline">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-7">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* ─── PAGINATION ─── */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-14">
                {/* Previous */}
                {currentPage > 1 && (
                  <button
                    onClick={() => updateParam('page', (currentPage - 1).toString())}
                    className="w-10 h-10 flex items-center justify-center border border-grey-300 text-sm hover:bg-primary hover:text-white hover:border-primary transition-all rounded-full"
                  >
                    ‹
                  </button>
                )}

                {/* Pages */}
                {(() => {
                  const pages = [];
                  const total = pagination.pages;
                  const current = currentPage;

                  // Always show first page
                  pages.push(1);

                  if (current > 3) pages.push('...');

                  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                    pages.push(i);
                  }

                  if (current < total - 2) pages.push('...');

                  if (total > 1) pages.push(total);

                  return pages.map((page, idx) =>
                    page === '...' ? (
                      <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-grey-400 text-sm">
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => updateParam('page', page.toString())}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-full transition-all ${
                          page === current
                            ? 'bg-success text-white'
                            : 'text-grey-700 hover:bg-grey-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  );
                })()}

                {/* Next */}
                {currentPage < pagination.pages && (
                  <button
                    onClick={() => updateParam('page', (currentPage + 1).toString())}
                    className="w-10 h-10 flex items-center justify-center border border-grey-300 text-sm hover:bg-primary hover:text-white hover:border-primary transition-all rounded-full"
                  >
                    ›
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
