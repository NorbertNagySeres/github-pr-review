import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  DollarSign, 
  Layers, 
  X,
  Sparkles,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description || null,
      stock: parseInt(formData.stock)
    };

    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, productData);
      } else {
        await axios.post(`${API_URL}/products/`, productData);
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      stock: product.stock.toString()
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '', stock: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <ShoppingBag className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-6xl font-bold gradient-text animate-gradient bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-300%">
              Product Manager
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Manage your inventory with style</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass-morphism rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-white">{products.length}</p>
              </div>
              <Package className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          <div className="glass-morphism rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-white">
                  ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div className="glass-morphism rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Stock</p>
                <p className="text-3xl font-bold text-white">
                  {products.reduce((sum, p) => sum + p.stock, 0)}
                </p>
              </div>
              <Layers className="w-10 h-10 text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Add Product Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <button
            onClick={() => setShowForm(true)}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold text-white shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Product
              <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
            </span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
          </button>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="glass-morphism rounded-2xl p-6 card-hover group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all">
                    {product.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 min-h-[40px]">
                  {product.description || 'No description available'}
                </p>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-purple-400">${product.price}</p>
                    <p className="text-sm text-gray-500">per unit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">{product.stock}</p>
                    <p className="text-sm text-gray-500">in stock</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-glass-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Value</span>
                    <span className="text-sm font-semibold text-green-400">
                      ${(product.price * product.stock).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={resetForm}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-morphism rounded-3xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold gradient-text">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all resize-none"
                      rows="3"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-6 py-3 rounded-xl bg-gray-700/50 hover:bg-gray-700/70 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                      {editingProduct ? 'Update' : 'Create'} Product
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;