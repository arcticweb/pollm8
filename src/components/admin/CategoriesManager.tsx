import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { categoryService, type Category } from '../../services/categoryService';

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!editForm.name || !editForm.slug) {
      alert('Name and slug are required');
      return;
    }

    try {
      await categoryService.createCategory(editForm);
      setShowAddForm(false);
      setEditForm({});
      await loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await categoryService.updateCategory(id, editForm);
      setEditingId(null);
      setEditForm({});
      await loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This will remove it from all topics.')) return;

    try {
      await categoryService.deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm(category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary btn-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {showAddForm && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg">New Category</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input input-bordered"
              />
              <input
                type="text"
                placeholder="Slug (e.g., technology)"
                value={editForm.slug || ''}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                className="input input-bordered"
              />
              <input
                type="text"
                placeholder="Icon (emoji or icon name)"
                value={editForm.icon || ''}
                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                className="input input-bordered"
              />
              <input
                type="text"
                placeholder="Color (hex code)"
                value={editForm.color || ''}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                className="input input-bordered"
              />
            </div>
            <textarea
              placeholder="Description"
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="textarea textarea-bordered"
              rows={2}
            />
            <div className="card-actions justify-end">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditForm({});
                }}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button onClick={handleCreate} className="btn btn-primary btn-sm">
                <Save className="w-4 h-4 mr-2" />
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="card bg-base-100 border border-base-300">
            <div className="card-body">
              {editingId === category.id ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="text"
                      value={editForm.slug || ''}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      className="input input-bordered input-sm"
                    />
                    <input
                      type="text"
                      value={editForm.icon || ''}
                      onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      className="input input-bordered input-sm"
                      placeholder="Icon"
                    />
                    <input
                      type="text"
                      value={editForm.color || ''}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="input input-bordered input-sm"
                      placeholder="Color"
                    />
                  </div>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="textarea textarea-bordered textarea-sm"
                    rows={2}
                  />
                  <div className="card-actions justify-end">
                    <button onClick={cancelEdit} className="btn btn-ghost btn-sm">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleUpdate(category.id)} className="btn btn-primary btn-sm">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {category.icon && (
                        <span className="text-2xl" style={{ color: category.color || undefined }}>
                          {category.icon}
                        </span>
                      )}
                      <div>
                        <h3 className="card-title text-lg">{category.name}</h3>
                        <p className="text-sm text-base-content/60">/{category.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="btn btn-ghost btn-sm btn-square"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="btn btn-ghost btn-sm btn-square text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-base-content/70">{category.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <span className={`badge ${category.is_active ? 'badge-success' : 'badge-error'} badge-sm`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span>Order: {category.display_order}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-base-content/60">
          <p>No categories yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
