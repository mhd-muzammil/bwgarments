import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../utils/api';
import ProductCard from '../components/Product/ProductCard';
import CategoryTabs from '../components/Home/CategoryTabs';
import CustomerReviews from '../components/Home/CustomerReviews';
import { HiArrowRight } from 'react-icons/hi';

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
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <section className="relative bg-[#a2cad3] text-primary min-h-[60vh] flex flex-col justify-center overflow-hidden">
        {/* Banner Images (simulating the multiple images in the banner) */}
        <div className="absolute top-0 w-full flex justify-center gap-2 opacity-80 h-1/2">
           <img src="https://images.pexels.com/photos/32347599/pexels-photo-32347599.jpeg" alt="Model 1" className="w-[20%] object-cover object-top" />
           <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80" alt="Model 2" className="w-[20%] object-cover object-top" />
           <img src="https://images.pexels.com/photos/34688014/pexels-photo-34688014.jpeg" alt="Model 3" className="w-[20%] object-cover object-top" />
           <img src="https://images.pexels.com/photos/28851454/pexels-photo-28851454.jpeg" alt="Model 4" className="w-[20%] object-cover object-top" />
        </div>
        
        {/* Banner Text Area Overlay */}
        <div className="relative z-10 w-full flex flex-col items-center justify-end h-full absolute bottom-0 bg-gradient-to-t from-[#a2cad3] via-[#a2cad3]/90 to-transparent pt-32 pb-16">
          <div className="container-custom text-center">
             <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-2 tracking-wide text-primary">
                Elevate your wardrobe <br/> with <span className="text-black font-extrabold tracking-widest uppercase">"SHARANZ"</span>
             </h1>
             <p className="text-primary text-sm sm:text-lg font-medium tracking-widest uppercase mt-4 mb-8">
               Exclusive Clothing & Apparel
             </p>
             <Link to="/products" className="btn-primary inline-flex items-center gap-2 bg-black text-white hover:bg-grey-800 rounded-sm">
                Shop Collection <HiArrowRight />
             </Link>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Featured Products */}
      <section className="container-custom py-16">
        <div className="text-center mb-10">
          <p className="section-subtitle mb-2">Editor's Choice</p>
          <h2 className="section-title text-3xl font-heading font-bold uppercase tracking-widest text-[#2f3542]">FEATURED PRODUCTS</h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col h-full bg-white shadow-sm overflow-hidden p-3 border border-gray-100 rounded-md">
                <div className="aspect-[3/4] bg-grey-200 mb-4 rounded-sm"></div>
                <div className="h-4 bg-grey-200 w-3/4 mb-3 rounded-sm mx-auto"></div>
                <div className="h-5 bg-grey-200 w-1/3 mx-auto rounded-sm mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/products" className="btn-outline inline-flex items-center gap-2 border-[#2f3542] text-[#2f3542] hover:bg-[#2f3542] hover:text-white rounded-sm">
            View All Products <HiArrowRight />
          </Link>
        </div>
      </section>

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Brand Strip */}
      <section className="bg-primary text-secondary py-12">
        <div className="container-custom flex flex-wrap justify-between gap-8 sm:gap-16 text-center">
          <div className="flex-1">
             <p className="text-3xl font-heading font-bold text-accent mb-2">10K+</p>
             <p className="text-xs text-grey-300 uppercase tracking-widest border-t border-grey-800 pt-2 mx-auto w-24">Happy Customers</p>
          </div>
          <div className="flex-1">
             <p className="text-3xl font-heading font-bold text-accent mb-2">Premium</p>
             <p className="text-xs text-grey-300 uppercase tracking-widest border-t border-grey-800 pt-2 mx-auto w-24">Quality Assured</p>
          </div>
          <div className="flex-1">
             <p className="text-3xl font-heading font-bold text-accent mb-2">Free</p>
             <p className="text-xs text-grey-300 uppercase tracking-widest border-t border-grey-800 pt-2 mx-auto w-24">Shipping 1499+</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-custom py-24 text-center">
        <div className="max-w-2xl mx-auto bg-grey-50 p-10 sm:p-16 rounded-xl shadow-sm border border-grey-200">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3 text-[#c9a96e]">Stay Updated</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-4">Join Our Exclusive Club</h2>
          <p className="text-grey-500 text-sm max-w-md mx-auto mb-8 font-body">
            Subscribe for styling tips, new arrivals, and access to private sales events.
          </p>
          <form
            className="flex flex-col sm:flex-row max-w-md mx-auto gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="input-field flex-1 border-gray-300 p-3 rounded-sm focus:ring-accent focus:border-accent"
            />
            <button className="bg-black text-white hover:bg-grey-800 px-8 py-3 font-semibold uppercase tracking-widest text-sm rounded-sm transition-colors w-full sm:w-auto">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
