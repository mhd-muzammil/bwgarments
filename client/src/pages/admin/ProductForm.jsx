import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash } from 'react-icons/hi';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    discount: '',
    sku: '',
    mainCategory: '',
    subCategory: '',
    sizes: SIZES.map((s) => ({ size: s, stock: 0 })),
    images: ['', '', '', '', ''],
  });

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await API.get(`/products/${id}`);
          const p = data.data;
          setForm({
            title: p.title,
            description: p.description,
            price: p.price.toString(),
            discount: p.discount?.toString() || '0',
            sku: p.sku,
            mainCategory: p.mainCategory || '',
            subCategory: p.subCategory || '',
            sizes: SIZES.map((s) => {
              const found = p.sizes.find((sz) => sz.size === s);
              return { size: s, stock: found ? found.stock : 0 };
            }),
            images: p.images?.length === 5 ? p.images : ['', '', '', '', ''],
          });
        } catch {
          navigate('/admin/products');
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSizeStock = (size, stock) => {
    setForm({
      ...form,
      sizes: form.sizes.map((s) =>
        s.size === size ? { ...s, stock: Math.max(0, parseInt(stock) || 0) } : s
      ),
    });
  };

  const handleImageUrl = (index, url) => {
    const newImages = [...form.images];
    newImages[index] = url;
    setForm({ ...form, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discount: Number(form.discount) || 0,
        sizes: form.sizes.filter((s) => s.stock >= 0),
      };

      if (isEdit) {
        await API.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        await API.post('/products', payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl animate-fade-in">
      <h2 className="font-heading text-2xl font-bold mb-8">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required className="input-field" />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="input-field resize-none" />
        </div>

        {/* Price & Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Price (₹) *</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} required min="0" className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Discount Price (₹)</label>
            <input name="discount" type="number" value={form.discount} onChange={handleChange} min="0" className="input-field" />
          </div>
        </div>

        {/* SKU, Main Category, Sub Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">SKU *</label>
            <input name="sku" value={form.sku} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Main Category *</label>
            <select name="mainCategory" value={form.mainCategory} onChange={(e) => setForm({ ...form, mainCategory: e.target.value, subCategory: '' })} required className="input-field">
              <option value="">Select Main Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Sub Category *</label>
            <select name="subCategory" value={form.subCategory} onChange={handleChange} required className="input-field" disabled={!form.mainCategory}>
              <option value="">Select Sub Category</option>
              {categories.find(c => c.name === form.mainCategory)?.subcategories.map(s => (
                <option key={s.slug} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sizes & Stock */}
        <div>
          <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-3">Stock Per Size</label>
          <div className="grid grid-cols-5 gap-3">
            {form.sizes.map((s) => (
              <div key={s.size} className="text-center">
                <span className="text-xs font-bold block mb-1">{s.size}</span>
                <input
                  type="number"
                  value={s.stock}
                  onChange={(e) => handleSizeStock(s.size, e.target.value)}
                  min="0"
                  className="input-field text-center text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-3">
            Image URLs (5 Required)
          </label>
          <div className="space-y-2">
            {form.images.map((img, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-xs text-grey-400 w-5">{idx + 1}</span>
                <input
                  value={img}
                  onChange={(e) => handleImageUrl(idx, e.target.value)}
                  placeholder={`Image URL ${idx + 1}`}
                  className="input-field text-xs"
                />
                {img && (
                  <img src={img} alt="" className="w-10 h-12 object-cover bg-grey-100 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-grey-400 mt-2">
            Provide 5 image URLs. Use Cloudinary/Unsplash URLs for best results.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
