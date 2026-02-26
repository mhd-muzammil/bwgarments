import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const categoriesData = {
  Men: [
    { name: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=500&q=80', link: '/products?category=Men&subcategory=Shirts' },
    { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', link: '/products?category=Men&subcategory=T-Shirts' },
    { name: 'Pants Casuals', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80', link: '/products?category=Men&subcategory=Pants+Casuals' },
    { name: 'Formals', image: 'https://images.unsplash.com/photo-1594938298596-36310c144a2c?w=500&q=80', link: '/products?category=Men&subcategory=Formals' },
  ],
  Women: [
    { name: 'Kurtis', image: 'https://images.unsplash.com/photo-1583391733958-650ac5d43e5c?w=500&q=80', link: '/products?category=Women&subcategory=Kurtis' },
    { name: 'Dupattas', image: 'https://images.unsplash.com/photo-1610030469983-98e550d615fca?w=500&q=80', link: '/products?category=Women&subcategory=Dupattas' },
    { name: 'Bottom Wear', image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=500&q=80', link: '/products?category=Women&subcategory=Bottom+Wear' },
    { name: 'Dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80', link: '/products?category=Women&subcategory=Dresses' },
  ],
  Kids: [
    { name: 'Boys Clothing', image: 'https://images.unsplash.com/photo-1519238263530-99abad67b86e?w=500&q=80', link: '/products?category=Kids&subcategory=Boys+Clothing' },
    { name: 'Girls Clothing', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&q=80', link: '/products?category=Kids&subcategory=Girls+Clothing' },
    { name: 'Infants', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80', link: '/products?category=Kids&subcategory=Infants' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80', link: '/products?category=Kids&subcategory=Accessories' },
  ]
};

const CategoryTabs = () => {
  const [activeTab, setActiveTab] = useState('Men');

  return (
    <section className="container-custom py-16">
      <div className="text-center mb-10">
        <h2 className="section-title">Categories</h2>
        <div className="flex justify-center gap-6 mt-6 border-b border-grey-200 pb-4">
          {Object.keys(categoriesData).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg font-heading tracking-wide transition-all ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-accent pb-1 font-bold'
                  : 'text-grey-500 hover:text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
        {categoriesData[activeTab].map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="group block relative overflow-hidden bg-grey-100 aspect-[3/4] cursor-pointer"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Text Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-secondary font-heading text-xl md:text-2xl font-semibold tracking-wide drop-shadow-md">
                {item.name}
              </h3>
              <p className="text-accent text-xs uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                Shop Now
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryTabs;
