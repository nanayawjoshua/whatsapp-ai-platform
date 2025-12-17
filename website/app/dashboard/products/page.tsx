'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Package, Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface Product {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string;
  is_active: boolean;
  low_stock_threshold: number;
  created_at: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadProducts();
    }
  }, [status]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/vendor/products');
      const data = await response.json();
      setProducts(data.products || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load products:', error);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.quantity <= p.low_stock_threshold && p.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-text-secondary">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight text-text-primary mb-2">
            Product Inventory
          </h1>
          <p className="text-text-secondary">
            Manage your products from WhatsApp or dashboard
          </p>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="mb-6 bg-warning/10 border border-warning/20 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-warning mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Low Stock Alert</h3>
                <p className="text-sm text-text-secondary mb-3">
                  {lowStockProducts.length} {lowStockProducts.length === 1 ? 'product' : 'products'} running low on stock
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map(p => (
                    <span key={p.product_id} className="text-xs bg-surface px-3 py-1.5 rounded-full border border-cream-border">
                      {p.name} ({p.quantity} left)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all text-text-primary placeholder:text-text-tertiary"
            />
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="ml-4 px-6 py-3 bg-gradient-beeline text-white font-semibold rounded-xl hover:shadow-hover transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} onUpdate={loadProducts} />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-cream-border p-12 text-center">
            <Package size={48} className="text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first product via WhatsApp or the dashboard'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-beeline text-white font-semibold rounded-xl hover:shadow-hover transition-all"
              >
                <Plus size={20} />
                Add Your First Product
              </button>
            )}
          </div>
        )}

        {/* WhatsApp Instructions */}
        <div className="mt-8 bg-gradient-to-br from-beeline-yellow/10 to-beeline-orange/5 border border-beeline-yellow/20 rounded-2xl p-6">
          <h3 className="font-semibold text-text-primary mb-3">💬 Manage from WhatsApp</h3>
          <div className="text-sm text-text-secondary space-y-2">
            <p><strong>Add product:</strong> Send photo + "Add product: Nike Shoes, ₵450, 10 units"</p>
            <p><strong>Check stock:</strong> "Check stock: Nike Shoes"</p>
            <p><strong>Update quantity:</strong> "Update stock: Nike Shoes, add 5"</p>
            <p><strong>Remove product:</strong> "Remove product: Nike Shoes"</p>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} onSuccess={loadProducts} />
      )}
    </div>
  );
}

function ProductCard({ product, onUpdate }: { product: Product; onUpdate: () => void }) {
  const isLowStock = product.quantity <= product.low_stock_threshold;

  return (
    <div className="bg-surface rounded-2xl border border-cream-border overflow-hidden hover:shadow-soft transition-all">
      {/* Product Image */}
      {product.image_url ? (
        <div className="aspect-square bg-cream-dark">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-cream-dark flex items-center justify-center">
          <Package size={48} className="text-text-tertiary" />
        </div>
      )}

      {/* Product Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary mb-1">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-text-secondary line-clamp-2">{product.description}</p>
            )}
          </div>
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-text-primary">₵{product.price.toFixed(2)}</span>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isLowStock
              ? 'bg-warning/10 text-warning border border-warning/20'
              : 'bg-success/10 text-success border border-success/20'
          }`}>
            {product.quantity} in stock
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 border border-cream-border rounded-xl hover:bg-cream-dark transition-all flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary">
            <Edit size={16} />
            Edit
          </button>
          <button className="px-4 py-2 border border-error/20 text-error rounded-xl hover:bg-error/10 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          quantity: parseInt(quantity),
        }),
      });

      if (!response.ok) throw new Error('Failed to create product');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-3xl shadow-large border border-cream-border p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nike Air Max"
              className="w-full px-4 py-3 bg-surface border border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comfortable running shoes, size 42"
              className="w-full px-4 py-3 bg-surface border border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Price (₵)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="450.00"
                className="w-full px-4 py-3 bg-surface border border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="w-full px-4 py-3 bg-surface border border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-cream-border rounded-xl hover:bg-cream-dark transition-all text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-beeline text-white font-semibold rounded-xl hover:shadow-hover transition-all disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
