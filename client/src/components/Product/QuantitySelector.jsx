import { HiMinus, HiPlus } from 'react-icons/hi';

const QuantitySelector = ({ quantity, maxStock, onChange }) => {
  return (
    <div>
      <span className="text-xs uppercase tracking-widest font-semibold text-grey-600 mb-3 block">
        Quantity
      </span>
      <div className="flex items-center border border-grey-300 w-fit">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="w-10 h-10 flex items-center justify-center hover:bg-grey-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <HiMinus className="w-3.5 h-3.5" />
        </button>
        <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold border-x border-grey-300">
          {quantity}
        </span>
        <button
          onClick={() => onChange(Math.min(maxStock, quantity + 1))}
          disabled={quantity >= maxStock}
          className="w-10 h-10 flex items-center justify-center hover:bg-grey-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <HiPlus className="w-3.5 h-3.5" />
        </button>
      </div>
      {maxStock <= 5 && maxStock > 0 && (
        <p className="text-xs text-warning mt-1">Only {maxStock} left in stock</p>
      )}
    </div>
  );
};

export default QuantitySelector;
