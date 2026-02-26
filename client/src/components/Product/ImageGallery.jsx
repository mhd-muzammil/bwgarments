import { useState } from 'react';

const ImageGallery = ({ images, discount, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages = images?.length > 0
    ? images
    : Array(5).fill('https://via.placeholder.com/800x1000');

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            onMouseEnter={() => setSelectedIndex(idx)}
            className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 border-2 overflow-hidden transition-all duration-200 ${
              selectedIndex === idx ? 'border-primary' : 'border-grey-200 hover:border-grey-400'
            }`}
          >
            <img src={img} alt={`${title} view ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 aspect-[3/4] bg-grey-100 overflow-hidden">
        <img
          src={displayImages[selectedIndex]}
          alt={title}
          className="w-full h-full object-cover transition-all duration-500"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 bg-primary text-white text-sm font-bold px-4 py-2 tracking-wider">
            -{discount}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
