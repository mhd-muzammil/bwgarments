import toast from 'react-hot-toast';

/**
 * Show a rich toast with product thumbnail
 */
export const productToast = (message, product, type = 'success') => {
  const image = product?.images?.[0];
  const title = product?.title;

  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 px-4 py-3 shadow-xl max-w-sm pointer-events-auto transition-all duration-300 ${
          t.visible ? 'animate-slide-down opacity-100' : 'opacity-0 translate-y-[-10px]'
        } ${
          type === 'error' ? 'bg-danger' : type === 'info' ? 'bg-blue-600' : 'bg-grey-900'
        }`}
        onClick={() => toast.dismiss(t.id)}
      >
        {image && (
          <img src={image} alt="" className="w-11 h-14 object-cover shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-white text-[13px] font-semibold">{message}</p>
          {title && (
            <p className="text-white/60 text-[10px] truncate mt-0.5">{title}</p>
          )}
        </div>
      </div>
    ),
    { duration: 2500 }
  );
};

/**
 * Simple success toast (no product)
 */
export const successToast = (message) => {
  toast.success(message);
};

/**
 * Simple error toast (no product)
 */
export const errorToast = (message) => {
  toast.error(message);
};
