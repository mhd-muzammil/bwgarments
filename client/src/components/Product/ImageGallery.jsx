import { useState, useRef } from 'react';
import { HiChevronLeft, HiChevronRight, HiZoomIn } from 'react-icons/hi';

const ImageGallery = ({ images, discount, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);

  const displayImages = images?.length > 0
    ? images
    : ['https://via.placeholder.com/800x1000'];

  const handleMouseMove = (e) => {
    if (!zoomed || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const nextImage = () => setSelectedIndex((i) => (i + 1) % displayImages.length);
  const prevImage = () => setSelectedIndex((i) => (i - 1 + displayImages.length) % displayImages.length);

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3">
      {/* Thumbnails */}
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible scrollbar-hide">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            onMouseEnter={() => setSelectedIndex(idx)}
            className={`flex-shrink-0 w-16 h-20 sm:w-[72px] sm:h-[90px] overflow-hidden transition-all duration-200 ${
              selectedIndex === idx
                ? 'ring-2 ring-primary ring-offset-1 opacity-100'
                : 'opacity-50 hover:opacity-80'
            }`}
          >
            <img src={img} alt={`${title} view ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div
        ref={imageRef}
        className="relative flex-1 aspect-[3/4] bg-grey-100 overflow-hidden cursor-zoom-in group"
        onClick={() => setZoomed(!zoomed)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomed(false)}
      >
        <img
          src={displayImages[selectedIndex]}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300"
          style={zoomed ? {
            transform: 'scale(2)',
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
          } : {}}
          draggable={false}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-4 py-2 tracking-wider">
            -{discount}%
          </span>
        )}

        {/* Zoom hint */}
        {!zoomed && (
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <HiZoomIn className="w-5 h-5 text-grey-600" />
          </div>
        )}

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); setZoomed(false); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); setZoomed(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium">
          {selectedIndex + 1} / {displayImages.length}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
