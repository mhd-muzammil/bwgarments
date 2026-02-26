export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const calcDiscount = (price, discount) => {
  if (!discount || discount === 0) return 0;
  return Math.round(((price - discount) / price) * 100);
};
