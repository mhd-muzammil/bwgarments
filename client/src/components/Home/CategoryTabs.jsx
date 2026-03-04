import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

const MainCategoryImages = {
  Men: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
  Women: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  Kids: 'https://images.unsplash.com/photo-1519238263530-99abad67b86e?w=800&q=80',
  Default: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80'
};

const CategoryTabs = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="container-custom py-16">
      <div className="text-center mb-12">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle mt-2">Discover our premium collections</p>
      </div>

      {/* Main Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {categories.map((cat) => (
          <div
            key={cat._id}
            onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
            className={`group relative overflow-hidden bg-grey-100 aspect-[4/5] cursor-pointer border-2 transition-all duration-300 ${
              activeCategory === cat.name ? 'border-primary shadow-2xl scale-[1.02]' : 'border-transparent'
            }`}
          >
            <img
              src={MainCategoryImages[cat.name] || MainCategoryImages.Default}
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 ${
              activeCategory === cat.name ? 'opacity-90' : 'opacity-70 group-hover:opacity-90'
            }`}></div>
            
            {/* Text Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 text-center">
              <h3 className="text-secondary font-heading text-3xl font-bold tracking-widest uppercase drop-shadow-md">
                {cat.name}
              </h3>
              <p className={`text-accent text-sm uppercase tracking-widest mt-3 transition-opacity duration-300 ${
                activeCategory === cat.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                {activeCategory === cat.name ? 'Hide Collections' : 'View Collections'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Subcategories Area */}
      <div className={`transition-all duration-500 overflow-hidden ${activeCategory ? 'max-h-96 opacity-100 mt-12' : 'max-h-0 opacity-0 mt-0'}`}>
        {activeCategory && (
          <div className="p-8 border border-grey-200 bg-grey-50 text-center animate-fade-in">
            <h4 className="font-heading text-2xl font-semibold mb-6">
              Explore {activeCategory}
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.find(c => c.name === activeCategory)?.subcategories.map(sub => (
                <Link
                  key={sub.slug}
                  to={`/products?mainCategory=${encodeURIComponent(activeCategory)}&subCategory=${encodeURIComponent(sub.name)}`}
                  className="px-6 py-3 border border-grey-300 bg-white hover:bg-primary hover:text-white transition-colors duration-300 font-medium uppercase tracking-wider text-sm shadow-sm"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
            {categories.find(c => c.name === activeCategory)?.subcategories.length === 0 && (
              <p className="text-grey-500">No subcategories available yet.</p>
            )}
            <div className="mt-8">
               <Link to={`/products?mainCategory=${encodeURIComponent(activeCategory)}`} className="text-sm border-b border-primary hover:text-primary transition-colors pb-1">
                 View All {activeCategory}
               </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryTabs;
