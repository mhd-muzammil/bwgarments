import React from 'react';

const reviewsData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1515347619362-e9c1b48b94f1?w=500&q=80', height: 'h-64' },
  { id: 2, image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=500&q=80', height: 'h-80' },
  { id: 3, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80', height: 'h-72' },
  { id: 4, image: 'https://images.unsplash.com/photo-1520638023416-090c2a8f88ac?w=500&q=80', height: 'h-64' },
  { id: 5, image: 'https://images.unsplash.com/photo-1552874869-5c39ec9288dc?w=500&q=80', height: 'h-96' },
  { id: 6, image: 'https://images.unsplash.com/photo-1620393041300-47da7577bb2b?w=500&q=80', height: 'h-72' },
  { id: 7, image: 'https://images.unsplash.com/photo-1563178044-672ce34dfdc5?w=500&q=80', height: 'h-80' },
  { id: 8, image: 'https://images.unsplash.com/photo-1533682805518-48d1f5e8bdf4?w=500&q=80', height: 'h-64' },
];

const CustomerReviews = () => {
  return (
    <section className="container-custom py-20 bg-grey-50">
      <div className="text-center mb-12">
        <h2 className="section-title text-3xl font-heading font-bold text-primary tracking-wide">Customer Reviews</h2>
        <p className="text-grey-500 text-sm mt-3 flex items-center justify-center gap-2">
          <span>Real people. Real style.</span>
        </p>
      </div>

      {/* Masonry-like CSS columns layout */}
      <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
        {reviewsData.map((review) => (
          <div
            key={review.id}
            className={`group relative overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 break-inside-avoid rounded-md ${review.height}`}
          >
            <img
              src={review.image}
              alt={`Customer Review ${review.id}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="bg-white/90 text-primary px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-sm shadow-md flex items-center gap-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-accent text-lg leading-none">★</span> 
                <span className="text-accent text-lg leading-none">★</span> 
                <span className="text-accent text-lg leading-none">★</span> 
                <span className="text-accent text-lg leading-none">★</span> 
                <span className="text-accent text-lg leading-none">★</span> 
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomerReviews;
