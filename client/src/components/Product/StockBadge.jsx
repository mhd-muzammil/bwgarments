const StockBadge = ({ soldOut, stock }) => {
  if (soldOut || stock === 0) {
    return (
      <span className="badge bg-danger/10 text-danger border border-danger/20">
        <span className="w-2 h-2 bg-danger rounded-full mr-2"></span>
        Sold Out
      </span>
    );
  }

  return (
    <span className="badge bg-success/10 text-success border border-success/20">
      <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
      In Stock
    </span>
  );
};

export default StockBadge;
