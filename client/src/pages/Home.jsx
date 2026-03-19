import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../utils/api';
import ProductCard from '../components/Product/ProductCard';
import CategoryTabs from '../components/Home/CategoryTabs';
import CustomerReviews from '../components/Home/CustomerReviews';
import { HiArrowRight, HiArrowNarrowRight } from 'react-icons/hi';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/products?limit=8');
        setFeatured(data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section className="relative bg-grey-100 overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[75vh] items-center">
            {/* Left: Text */}
            <div className="py-16 lg:py-24 lg:pr-12 animate-fade-in">
              <p className="text-accent text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mb-4">
                New Season Collection
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-primary mb-6">
                Elevate Your
                <br />
                <span className="text-grey-400">Wardrobe</span>
              </h1>
              <p className="text-grey-500 text-sm sm:text-base max-w-md leading-relaxed mb-8">
                Discover premium clothing crafted with elegance. Minimal luxury for the modern generation.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary inline-flex items-center gap-3">
                  Shop Now <HiArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/products?mainCategory=Women" className="btn-outline inline-flex items-center gap-3">
                  Women's Collection
                </Link>
              </div>

              {/* Trust stats inline */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-grey-200">
                {[
                  { value: '10K+', label: 'Happy Customers' },
                  { value: '500+', label: 'Styles Available' },
                  { value: '4.9', label: 'Average Rating' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-heading text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-[10px] text-grey-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Image Grid */}
            <div className="relative hidden lg:block h-full">
              <div className="absolute inset-0 grid grid-cols-2 gap-3 p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex-[2] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80"
                      alt="Fashion"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-[1] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"
                      alt="Fashion"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-8">
                  <div className="flex-[1] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80"
                      alt="Fashion"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-[2] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"
                      alt="Fashion"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile hero image */}
            <div className="lg:hidden -mx-4 sm:-mx-6">
              <img
                src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80"
                alt="Fashion"
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category Tabs ─── */}
      <CategoryTabs />

      {/* ─── Featured Products ─── */}
      <section className="container-custom py-16 sm:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-2">Curated Selection</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary">Featured Products</h2>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-sm font-medium text-grey-500 hover:text-primary transition-colors group">
            View All <HiArrowNarrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] skeleton"></div>
                <div className="h-3 skeleton w-2/3"></div>
                <div className="h-4 skeleton w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link to="/products" className="btn-outline inline-flex items-center gap-2">
            View All Products <HiArrowRight />
          </Link>
        </div>
      </section>

      {/* ─── Customer Reviews ─── */}
      <CustomerReviews />

      {/* ─── Brand Promise ─── */}
      <section className="bg-primary text-secondary py-14">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { value: 'Premium', sub: 'Quality Fabrics', desc: 'Every piece crafted from hand-selected materials' },
              { value: 'Sustainable', sub: 'Fashion Forward', desc: 'Ethical production with minimal environmental impact' },
              { value: 'Free Shipping', sub: 'Orders Above Rs1,499', desc: 'Fast delivery across India with easy returns' },
            ].map((item) => (
              <div key={item.value} className="px-4">
                <p className="text-2xl sm:text-3xl font-heading font-bold text-accent mb-1">{item.value}</p>
                <p className="text-xs text-grey-300 uppercase tracking-[0.15em] mb-3">{item.sub}</p>
                <p className="text-xs text-grey-500 max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Newsletter ─── */}
      <section className="container-custom py-20 sm:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">Stay in the Loop</p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary mb-4">Join Our Community</h2>
          <p className="text-grey-500 text-sm max-w-md mx-auto mb-8">
            Get early access to new drops, styling tips, and exclusive members-only discounts.
          </p>
          <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="input-field flex-1"
            />
            <button className="btn-primary whitespace-nowrap">Subscribe</button>
          </form>
          <p className="text-[10px] text-grey-400 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Bottom spacer for mobile nav */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};

export default Home;
