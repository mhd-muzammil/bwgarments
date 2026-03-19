import { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';
import {
  HiSearch, HiDownload, HiSave, HiExclamation, HiCube,
  HiFilter, HiRefresh,
} from 'react-icons/hi';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const Inventory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [category, setCategory] = useState('');
  const [threshold, setThreshold] = useState(5);
  const [page, setPage] = useState(1);
  const [edits, setEdits] = useState({}); // { productId-size: newStock }
  const [saving, setSaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '50');
      params.set('lowStockThreshold', threshold);
      if (search) params.set('search', search);
      if (stockStatus) params.set('stockStatus', stockStatus);
      if (category) params.set('category', category);

      const { data: res } = await API.get(`/products/admin/inventory?${params}`);
      setData(res);
    } catch {
      toast.error('Failed to load inventory');
    }
    setLoading(false);
  }, [page, search, stockStatus, category, threshold]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleStockEdit = (productId, size, value) => {
    const key = `${productId}-${size}`;
    setEdits((prev) => ({ ...prev, [key]: Math.max(0, parseInt(value) || 0) }));
  };

  const hasEdits = Object.keys(edits).length > 0;

  const handleSaveAll = async () => {
    const updates = Object.entries(edits).map(([key, stock]) => {
      const [productId, size] = key.split('-');
      return { productId, size, stock };
    });

    setSaving(true);
    try {
      const { data: res } = await API.put('/products/admin/bulk-stock', { updates });
      const succeeded = res.data.filter((r) => r.success).length;
      toast.success(`Updated ${succeeded}/${updates.length} stock entries`);
      setEdits({});
      fetchInventory();
    } catch {
      toast.error('Failed to save stock updates');
    }
    setSaving(false);
  };

  const handleExport = async () => {
    try {
      const response = await API.get('/products/admin/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const getStockColor = (stock, isLowStock, soldOut) => {
    if (soldOut || stock === 0) return 'text-red-600 bg-red-50';
    if (isLowStock) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">Inventory</h2>
          <p className="text-sm text-grey-500">Manage stock levels across all products</p>
        </div>
        <div className="flex gap-2">
          {hasEdits && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <HiSave className="w-4 h-4" />
              {saving ? 'Saving...' : `Save ${Object.keys(edits).length} Changes`}
            </button>
          )}
          <button onClick={handleExport} className="btn-outline flex items-center gap-2 text-sm">
            <HiDownload className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Products', value: data.summary.totalProducts, color: 'text-primary' },
            { label: 'Active', value: data.summary.activeProducts, color: 'text-blue-600' },
            { label: 'Total Stock', value: data.summary.totalStock.toLocaleString(), color: 'text-emerald-600' },
            { label: 'Low Stock', value: data.summary.lowStock, color: 'text-amber-600' },
            { label: 'Out of Stock', value: data.summary.outOfStock, color: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-grey-200 p-4">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-grey-500 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title or SKU..."
            className="w-full pl-9 pr-4 py-2 border border-grey-300 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={stockStatus}
          onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
          className="py-2 px-3 border border-grey-300 text-sm bg-white"
        >
          <option value="">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <div className="flex items-center gap-2">
          <label className="text-xs text-grey-500">Low threshold:</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Math.max(1, parseInt(e.target.value) || 5))}
            className="w-16 py-2 px-2 border border-grey-300 text-sm text-center"
            min="1"
          />
        </div>
        <button onClick={() => fetchInventory()} className="p-2 border border-grey-300 hover:bg-grey-50">
          <HiRefresh className="w-4 h-4 text-grey-500" />
        </button>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => <div key={i} className="h-14 bg-grey-100 animate-pulse"></div>)}
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="text-center py-16">
          <HiCube className="w-12 h-12 text-grey-200 mx-auto mb-4" />
          <p className="text-grey-500">No products match your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey-200 text-left">
                <th className="py-3 px-2 text-xs font-semibold text-grey-500 uppercase tracking-wider">Product</th>
                <th className="py-3 px-2 text-xs font-semibold text-grey-500 uppercase tracking-wider">SKU</th>
                <th className="py-3 px-2 text-xs font-semibold text-grey-500 uppercase tracking-wider">Price</th>
                {SIZES.map((s) => (
                  <th key={s} className="py-3 px-2 text-xs font-semibold text-grey-500 uppercase tracking-wider text-center w-16">{s}</th>
                ))}
                <th className="py-3 px-2 text-xs font-semibold text-grey-500 uppercase tracking-wider text-center">Total</th>
                <th className="py-3 px-2 text-xs font-semibold text-grey-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {data.data.map((product) => {
                const totalStock = product.totalStock;
                return (
                  <tr key={product._id} className={`hover:bg-grey-50 ${!product.isActive ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-2">
                      <p className="font-medium truncate max-w-[200px]">{product.title}</p>
                    </td>
                    <td className="py-3 px-2 text-xs text-grey-500 font-mono">{product.sku}</td>
                    <td className="py-3 px-2 text-xs">
                      {product.discount > 0 ? (
                        <span>{formatPrice(product.discount)}</span>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </td>
                    {SIZES.map((size) => {
                      const sizeData = product.sizes.find((s) => s.size === size);
                      const currentStock = sizeData?.stock ?? 0;
                      const editKey = `${product._id}-${size}`;
                      const editedValue = edits[editKey];
                      const displayValue = editedValue !== undefined ? editedValue : currentStock;
                      const isEdited = editedValue !== undefined && editedValue !== currentStock;

                      return (
                        <td key={size} className="py-2 px-1 text-center">
                          {sizeData ? (
                            <input
                              type="number"
                              value={displayValue}
                              onChange={(e) => handleStockEdit(product._id, size, e.target.value)}
                              className={`w-14 py-1 px-1 text-center text-xs border ${
                                isEdited ? 'border-blue-400 bg-blue-50' : 'border-grey-200'
                              } focus:outline-none focus:border-primary`}
                              min="0"
                            />
                          ) : (
                            <span className="text-grey-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs font-bold ${getStockColor(totalStock, product.isLowStock, product.soldOut)}`}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {product.soldOut ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 font-semibold">SOLD OUT</span>
                      ) : product.isLowStock ? (
                        <HiExclamation className="w-4 h-4 text-amber-500 mx-auto" title="Low Stock" />
                      ) : (
                        <span className="text-[10px] text-emerald-500 font-semibold">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <button onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-grey-300 text-sm hover:bg-grey-50">Prev</button>
          )}
          <span className="text-sm text-grey-500">Page {page} of {data.pagination.pages}</span>
          {page < data.pagination.pages && (
            <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-grey-300 text-sm hover:bg-grey-50">Next</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Inventory;
