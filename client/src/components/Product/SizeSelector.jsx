import { useState } from 'react';
import { HiX } from 'react-icons/hi';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const SizeSelector = ({ sizes, selectedSize, onSelect }) => {
  const [showGuide, setShowGuide] = useState(false);

  const getStock = (size) => {
    const s = sizes?.find((s) => s.size === size);
    return s ? s.stock : 0;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-grey-600">Select Size</span>
        <button
          onClick={() => setShowGuide(true)}
          className="text-xs text-accent hover:text-accent-light transition-colors underline"
        >
          Size Guide
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {SIZES.map((size) => {
          const stock = getStock(size);
          const isDisabled = stock === 0;
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              disabled={isDisabled}
              onClick={() => onSelect(isSelected ? null : size)}
              className={`w-12 h-12 text-sm font-semibold border-2 transition-all duration-200 ${
                isDisabled
                  ? 'border-grey-200 text-grey-300 bg-grey-50 cursor-not-allowed line-through'
                  : isSelected
                  ? 'border-primary bg-primary text-white'
                  : 'border-grey-300 text-grey-700 hover:border-primary'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {selectedSize && (
        <button
          onClick={() => onSelect(null)}
          className="mt-2 text-xs text-grey-500 hover:text-primary transition-colors flex items-center gap-1"
        >
          <HiX className="w-3 h-3" /> Clear selection
        </button>
      )}

      {/* Size Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowGuide(false)}>
          <div className="bg-white p-8 max-w-md w-full mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-bold">Size Guide</h3>
              <button onClick={() => setShowGuide(false)} className="p-1 hover:bg-grey-100 rounded">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey-200">
                  <th className="text-left py-2 font-semibold">Size</th>
                  <th className="text-left py-2 font-semibold">Bust (in)</th>
                  <th className="text-left py-2 font-semibold">Waist (in)</th>
                  <th className="text-left py-2 font-semibold">Length (in)</th>
                </tr>
              </thead>
              <tbody className="text-grey-600">
                <tr className="border-b border-grey-100"><td className="py-2">S</td><td>34</td><td>28</td><td>44</td></tr>
                <tr className="border-b border-grey-100"><td className="py-2">M</td><td>36</td><td>30</td><td>45</td></tr>
                <tr className="border-b border-grey-100"><td className="py-2">L</td><td>38</td><td>32</td><td>46</td></tr>
                <tr className="border-b border-grey-100"><td className="py-2">XL</td><td>40</td><td>34</td><td>47</td></tr>
                <tr><td className="py-2">XXL</td><td>42</td><td>36</td><td>48</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeSelector;
