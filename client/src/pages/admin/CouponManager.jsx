import { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';
import {
  HiPlus, HiPencil, HiTrash, HiX, HiCheck, HiTicket,
  HiSearch, HiClock, HiExclamation,
} from 'react-icons/hi';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const emptyCoupon = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '',
  perUserLimit: '1',
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: '',
  isActive: true,
};

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyCoupon });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '20');
      if (search) params.set('search', search);
      const { data } = await API.get(`/coupons?${params}`);
      setCoupons(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load coupons');
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const resetForm = () => {
    setForm({ ...emptyCoupon });
    setShowForm(false);
    setEditingId(null);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      perUserLimit: coupon.perUserLimit?.toString() || '1',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 10) : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 10) : '',
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.value || !form.validUntil) {
      toast.error('Code, value, and expiry date are required');
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      perUserLimit: Number(form.perUserLimit) || 1,
      validFrom: form.validFrom ? new Date(form.validFrom) : new Date(),
      validUntil: new Date(form.validUntil),
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/coupons/${editingId}`, payload);
        toast.success('Coupon updated');
      } else {
        await API.post('/coupons', payload);
        toast.success('Coupon created');
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await API.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await API.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      toast.success(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated');
      fetchCoupons();
    } catch {
      toast.error('Failed to update');
    }
  };

  const isExpired = (date) => new Date(date) < new Date();
  const isUsedUp = (coupon) => coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">Coupons</h2>
          <p className="text-sm text-grey-500">{pagination.total || 0} total coupons</p>
        </div>
        <button onClick={startCreate} className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by coupon code..."
          className="w-full pl-9 pr-4 py-2.5 border border-grey-300 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-grey-50 border border-grey-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-sm">{editingId ? 'Edit Coupon' : 'New Coupon'}</h4>
            <button onClick={resetForm} className="text-grey-400 hover:text-primary"><HiX className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" className="input-field uppercase" />
            </div>
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (Rs)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">
                Value * {form.type === 'percentage' ? '(%)' : '(Rs)'}
              </label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} min="0" max={form.type === 'percentage' ? '100' : undefined} className="input-field" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Summer sale discount" className="input-field" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Min Order (Rs)</label>
              <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} min="0" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Max Discount (Rs)</label>
              <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} min="0" placeholder="No cap" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Total Uses</label>
              <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} min="0" placeholder="Unlimited" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Per User</label>
              <input type="number" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} min="1" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Valid From</label>
              <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Valid Until *</label>
              <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="input-field" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
              <HiCheck className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={resetForm} className="btn-outline text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Coupon List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-grey-100 animate-pulse"></div>)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16">
          <HiTicket className="w-12 h-12 text-grey-200 mx-auto mb-4" />
          <p className="text-grey-500">No coupons found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.validUntil);
            const usedUp = isUsedUp(coupon);
            const inactive = !coupon.isActive || expired || usedUp;

            return (
              <div key={coupon._id} className={`bg-white border border-grey-200 p-4 ${inactive ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-grey-900 text-white flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `Rs${coupon.value}`}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm">{coupon.code}</span>
                        {expired && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 font-semibold">EXPIRED</span>}
                        {usedUp && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 font-semibold">USED UP</span>}
                        {!coupon.isActive && <span className="text-[10px] px-1.5 py-0.5 bg-grey-100 text-grey-500 border border-grey-200 font-semibold">INACTIVE</span>}
                      </div>
                      <p className="text-xs text-grey-400 mt-0.5">
                        {coupon.description || (coupon.type === 'percentage' ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`)}
                        {coupon.minOrderAmount > 0 && ` on orders above ${formatPrice(coupon.minOrderAmount)}`}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold">{coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</p>
                      <p className="text-[10px] text-grey-400 uppercase">Used</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-grey-500">{formatDate(coupon.validUntil)}</p>
                      <p className="text-[10px] text-grey-400 uppercase">Expires</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleActive(coupon)} className="p-2 text-grey-400 hover:text-primary hover:bg-grey-50" title={coupon.isActive ? 'Deactivate' : 'Activate'}>
                      {coupon.isActive ? <HiExclamation className="w-4 h-4" /> : <HiCheck className="w-4 h-4" />}
                    </button>
                    <button onClick={() => startEdit(coupon)} className="p-2 text-grey-400 hover:text-primary hover:bg-grey-50"><HiPencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(coupon._id, coupon.code)} className="p-2 text-grey-400 hover:text-red-500 hover:bg-red-50"><HiTrash className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && <button onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-grey-300 text-sm hover:bg-grey-50">Previous</button>}
          <span className="text-sm text-grey-500">Page {page} of {pagination.pages}</span>
          {page < pagination.pages && <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-grey-300 text-sm hover:bg-grey-50">Next</button>}
        </div>
      )}
    </div>
  );
};

export default CouponManager;
