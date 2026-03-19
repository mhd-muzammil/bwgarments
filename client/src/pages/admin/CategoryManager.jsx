import { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX, HiCheck, HiTag } from 'react-icons/hi';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: '', slug: '', subcategories: [] });
  const [newSub, setNewSub] = useState({ name: '', slug: '' });

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories?withCounts=true');
      setCategories(data.data);
    } catch {
      toast.error('Failed to load categories');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const resetForm = () => {
    setForm({ name: '', slug: '', subcategories: [] });
    setNewSub({ name: '', slug: '' });
    setEditingId(null);
    setShowCreate(false);
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setShowCreate(false);
    setForm({
      name: category.name,
      slug: category.slug,
      subcategories: category.subcategories.map((s) => ({ name: s.name, slug: s.slug })),
    });
  };

  const startCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const addSubcategory = () => {
    if (!newSub.name.trim()) return;
    const slug = newSub.slug.trim() || generateSlug(newSub.name);
    if (form.subcategories.some((s) => s.slug === slug)) {
      toast.error('Subcategory slug already exists');
      return;
    }
    setForm({ ...form, subcategories: [...form.subcategories, { name: newSub.name.trim(), slug }] });
    setNewSub({ name: '', slug: '' });
  };

  const removeSubcategory = (slug) => {
    setForm({ ...form, subcategories: form.subcategories.filter((s) => s.slug !== slug) });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    const slug = form.slug.trim() || generateSlug(form.name);
    const payload = { name: form.name.trim(), slug, subcategories: form.subcategories };

    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, payload);
        toast.success('Category updated');
      } else {
        await API.post('/categories', payload);
        toast.success('Category created');
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-grey-100 w-48"></div>
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-grey-100"></div>)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Categories</h2>
          <p className="text-sm text-grey-500">{categories.length} categories &middot; {totalProducts} products</p>
        </div>
        <button onClick={startCreate} className="btn-primary flex items-center gap-2 text-sm">
          <HiPlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <CategoryForm
          form={form}
          setForm={setForm}
          newSub={newSub}
          setNewSub={setNewSub}
          addSubcategory={addSubcategory}
          removeSubcategory={removeSubcategory}
          generateSlug={generateSlug}
          onSave={handleSave}
          onCancel={resetForm}
          title="New Category"
        />
      )}

      {/* Category List */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white border border-grey-200">
            {editingId === cat._id ? (
              <div className="p-5">
                <CategoryForm
                  form={form}
                  setForm={setForm}
                  newSub={newSub}
                  setNewSub={setNewSub}
                  addSubcategory={addSubcategory}
                  removeSubcategory={removeSubcategory}
                  generateSlug={generateSlug}
                  onSave={handleSave}
                  onCancel={resetForm}
                  title={`Edit: ${cat.name}`}
                />
              </div>
            ) : (
              <div className="p-5">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-grey-900 text-white flex items-center justify-center">
                      <HiTag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg">{cat.name}</h3>
                      <p className="text-xs text-grey-400">/{cat.slug} &middot; {cat.productCount || 0} products</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 text-grey-400 hover:text-primary hover:bg-grey-50 transition-colors"
                      title="Edit"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="p-2 text-grey-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {cat.subcategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3 pl-13">
                    {cat.subcategories.map((sub) => (
                      <span
                        key={sub.slug}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-grey-50 border border-grey-200 text-xs"
                      >
                        <span className="font-medium">{sub.name}</span>
                        {sub.productCount > 0 && (
                          <span className="text-grey-400">({sub.productCount})</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-grey-400 mt-2 pl-13">No subcategories</p>
                )}
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && !showCreate && (
          <div className="text-center py-16">
            <HiTag className="w-12 h-12 text-grey-200 mx-auto mb-4" />
            <p className="text-grey-500 mb-4">No categories yet</p>
            <button onClick={startCreate} className="btn-primary text-sm">
              Create First Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reusable Category Form ───
const CategoryForm = ({ form, setForm, newSub, setNewSub, addSubcategory, removeSubcategory, generateSlug, onSave, onCancel, title }) => (
  <div className="bg-grey-50 border border-grey-200 p-5 space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-heading font-bold text-sm">{title}</h4>
      <button onClick={onCancel} className="text-grey-400 hover:text-primary">
        <HiX className="w-5 h-5" />
      </button>
    </div>

    {/* Name + Slug */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Name *</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || generateSlug(e.target.value) })}
          placeholder="e.g. Men"
          className="input-field"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-1">Slug</label>
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="auto-generated"
          className="input-field"
        />
      </div>
    </div>

    {/* Subcategories */}
    <div>
      <label className="text-xs font-semibold text-grey-600 uppercase tracking-wider block mb-2">
        Subcategories ({form.subcategories.length})
      </label>
      {form.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {form.subcategories.map((sub) => (
            <span key={sub.slug} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-grey-200 text-xs">
              {sub.name}
              <button onClick={() => removeSubcategory(sub.slug)} className="text-grey-400 hover:text-red-500 ml-1">
                <HiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={newSub.name}
          onChange={(e) => setNewSub({ ...newSub, name: e.target.value, slug: generateSlug(e.target.value) })}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategory())}
          placeholder="Subcategory name"
          className="input-field text-sm flex-1"
        />
        <button
          type="button"
          onClick={addSubcategory}
          className="px-3 py-2 bg-grey-900 text-white text-xs font-semibold hover:bg-grey-700 transition-colors"
        >
          <HiPlus className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-3 pt-2">
      <button onClick={onSave} className="btn-primary text-sm flex items-center gap-1.5">
        <HiCheck className="w-4 h-4" /> Save
      </button>
      <button onClick={onCancel} className="btn-outline text-sm">Cancel</button>
    </div>
  </div>
);

export default CategoryManager;
