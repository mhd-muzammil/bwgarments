import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';
import { HiPencil, HiTrash, HiPlus, HiEye, HiEyeOff } from 'react-icons/hi';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/products/admin/all?page=${page}&limit=20`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleToggleSoldOut = async (id) => {
    try {
      await API.patch(`/products/${id}/soldout`);
      toast.success('Sold out status toggled');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to toggle');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deactivated');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading text-2xl font-bold">Products</h2>
          <p className="text-sm text-grey-500">{pagination.total || 0} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-accent flex items-center gap-2 text-xs">
          <HiPlus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-grey-200 text-left">
              <th className="py-3 pr-4 font-semibold text-xs uppercase tracking-wider text-grey-500">Product</th>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-grey-500">SKU</th>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-grey-500">Price</th>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-grey-500">Stock</th>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-grey-500">Status</th>
              <th className="py-3 pl-4 font-semibold text-xs uppercase tracking-wider text-grey-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const totalStock = p.sizes?.reduce((s, sz) => s + sz.stock, 0) ?? 0;
              return (
                <tr key={p._id} className={`border-b border-grey-100 ${!p.isActive ? 'opacity-50' : ''}`}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt="" className="w-10 h-12 object-cover bg-grey-100" />
                      <span className="font-medium truncate max-w-[200px]">{p.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-grey-500 text-xs">{p.sku}</td>
                  <td className="py-3 px-4">
                    {p.discount > 0 ? (
                      <div>
                        <span className="font-semibold">{formatPrice(p.discount)}</span>
                        <span className="text-xs text-grey-400 line-through ml-1">{formatPrice(p.price)}</span>
                      </div>
                    ) : (
                      <span className="font-semibold">{formatPrice(p.price)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${totalStock === 0 ? 'text-danger' : totalStock <= 5 ? 'text-warning' : 'text-success'}`}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.soldOut ? (
                      <span className="badge bg-danger/10 text-danger text-[10px]">Sold Out</span>
                    ) : !p.isActive ? (
                      <span className="badge bg-grey-100 text-grey-500 text-[10px]">Inactive</span>
                    ) : (
                      <span className="badge bg-success/10 text-success text-[10px]">Active</span>
                    )}
                  </td>
                  <td className="py-3 pl-4">
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/products/${p._id}/edit`} className="p-1.5 hover:bg-grey-100 rounded transition-colors">
                        <HiPencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleToggleSoldOut(p._id)} className="p-1.5 hover:bg-grey-100 rounded transition-colors" title="Toggle Sold Out">
                        {p.soldOut ? <HiEye className="w-4 h-4 text-success" /> : <HiEyeOff className="w-4 h-4 text-warning" />}
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-grey-100 rounded transition-colors text-danger">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 text-xs font-semibold ${p === page ? 'bg-primary text-white' : 'border border-grey-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductManager;
