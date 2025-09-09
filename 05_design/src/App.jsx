import { useState, useEffect } from 'react'
import { Eye, Edit, Trash2, Search, Plus, X } from 'lucide-react'
import { useCart } from './hooks/useCart.js'
import { CartWidget } from './components/CartWidget.jsx'

const API_BASE_URL = 'http://localhost:8000'

function AddProductDialog({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      // Reset form and close dialog
      setFormData({ name: '', description: '', price: '', stock: '' })
      onSuccess()
      onClose()
    } catch (err) {
      alert('Error creating product: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', price: '', stock: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto">
      <div className="bg-white rounded-lg shadow-lg w-[388px] min-h-[338px] relative p-6">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
        >
          <X size={12} className="text-black" strokeWidth={2} />
        </button>

        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Title */}
          <h2 className="text-base font-semibold text-black mb-8">Add New Product</h2>

          {/* Product Name */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-black mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="w-full h-8 px-3 py-2 bg-gray-50 border-0 rounded text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-black mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 border-0 rounded text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Price and Stock */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-xs font-medium text-black mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full h-8 px-3 py-2 bg-gray-50 border-0 rounded text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-black mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full h-8 px-3 py-2 bg-gray-50 border-0 rounded text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end mt-auto">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 h-8 bg-white border border-gray-200 rounded text-xs font-medium text-black hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 h-8 bg-black text-white text-xs font-medium rounded hover:bg-gray-900 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}

function EditProductDialog({ isOpen, onClose, onSuccess, product }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data when dialog opens or product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || ''
      })
    }
  }, [product, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!product) return
    
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      onSuccess()
      onClose()
    } catch (err) {
      alert('Error updating product: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto">
      <div className="bg-white rounded-lg shadow-lg w-[388px] min-h-[351px] relative p-6">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
        >
          <X size={12} className="text-black" strokeWidth={2} />
        </button>

        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Title */}
          <h2 className="text-base font-semibold text-black mb-8">Edit Product</h2>

          {/* Product Name */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-black mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full h-8 px-3 py-2 bg-gray-50 border-0 rounded text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-black mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 border-0 rounded text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Price and Stock */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-xs font-medium text-black mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full h-8 px-3 py-2 bg-gray-50 border-0 rounded text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-black mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className="w-full h-8 px-3 py-2 bg-gray-50 border-0 rounded text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end mt-auto">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 h-8 bg-white border border-gray-200 rounded text-xs font-medium text-black hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 h-8 bg-black text-white text-xs font-medium rounded hover:bg-gray-900 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}

function ViewProductDialog({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <div className="bg-white rounded-lg shadow-lg w-[444px] max-h-[90vh] relative p-6">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
          >
            <X size={12} className="text-black" strokeWidth={2} />
          </button>

          <div className="h-full flex flex-col">
            {/* Title */}
            <h2 className="text-base font-semibold text-black mb-8">Product Details</h2>

            {/* Product Name */}
            <h3 className="text-base font-medium text-black mb-8">{product.name}</h3>

            {/* Description */}
            <p className="text-base text-gray-500 leading-6 mb-6 flex-grow">
              {product.description}
            </p>

            {/* Separator */}
            <div className="w-full h-px bg-black bg-opacity-10 mb-4"></div>

            {/* Details */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Price:</div>
                <div className="text-xs font-medium text-black">$ {product.price}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Stock:</div>
                <div className="text-xs text-black">{product.stock} units</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500">Product ID:</div>
                <div className="text-xs text-black">{product.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteProductDialog({ isOpen, onClose, onConfirm, product, isDeleting }) {
  if (!isOpen || !product) return null

  const handleConfirm = async () => {
    await onConfirm(product.id)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <div className="bg-white rounded-lg shadow-lg w-[444px] min-h-[156px] relative p-6">
          <div className="h-full flex flex-col">
            {/* Title */}
            <h2 className="text-base font-semibold text-black mb-6">Delete Product</h2>

            {/* Warning message */}
            <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-grow">
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-2 justify-end mt-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 h-8 bg-white border border-gray-200 rounded text-xs font-medium text-black hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isDeleting}
                className="px-6 py-2 h-8 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onDelete, onView, onEdit }) {
  const { addToCart, canAddToCart, getProductQuantityInCart, loading } = useCart()
  
  const handleDelete = () => {
    onDelete(product)
  }
  
  const handleAddToCart = () => {
    if (canAddToCart(product)) {
      addToCart(product)
    }
  }
  
  // Use backend's available_stock if available, otherwise fallback to stock
  const availableStock = product.available_stock !== undefined ? product.available_stock : product.stock
  const cartQuantity = getProductQuantityInCart(product.id)
  const canAdd = canAddToCart(product) && !loading

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col min-h-[200px]">
      <h4 className="text-sm font-normal text-black mb-2 leading-none">
        {product.name}
      </h4>
      
      <div className="space-y-3 mb-4 flex-grow">
        <p className="text-xs text-gray-500 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-black">${product.price}</span>
          <div className="text-xs text-gray-500">
            <div>Stock: {availableStock}</div>
            {cartQuantity > 0 && (
              <div className="text-blue-600">In cart: {cartQuantity}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-1 mt-auto">
        <button 
          onClick={() => onView(product)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 bg-white border border-gray-200 rounded text-xs font-medium text-black hover:bg-gray-50"
        >
          <Eye size={12} />
          View
        </button>
        <button 
          onClick={() => onEdit(product)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 bg-white border border-gray-200 rounded text-xs font-medium text-black hover:bg-gray-50"
        >
          <Edit size={12} />
          Edit
        </button>
        <button 
          onClick={handleAddToCart}
          disabled={!canAdd}
          className="inline-flex items-center justify-center w-8 h-8 bg-green-600 rounded text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          title={canAdd ? 'Add to cart' : 'Out of stock'}
        >
          <Plus size={12} />
        </button>
        <button 
          onClick={handleDelete}
          className="inline-flex items-center justify-center w-8 h-8 bg-red-600 rounded text-white hover:bg-red-700"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function App() {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/products/`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async (productId) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete product')
      }
      
      // Close dialog and refresh products list
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
      await fetchProducts()
    } catch (err) {
      alert('Error deleting product: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleEditProductSuccess = async () => {
    await fetchProducts()
  }

  const handleAddProduct = () => {
    setIsAddDialogOpen(true)
  }

  const handleAddProductSuccess = async () => {
    await fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-lg font-normal text-black mb-6">Product Management</h1>
        
        <div className="flex justify-between items-center mb-8 gap-8">
          <div className="relative flex-1 max-w-md">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button 
            onClick={handleAddProduct}
            className="inline-flex items-center gap-2 px-6 py-2 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900"
          >
            <Plus size={12} />
            Add Product
          </button>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {products.length === 0 ? 'No products found. Add some products to get started.' : 'No products match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onDelete={handleDeleteProduct}
                onView={handleViewProduct}
                onEdit={handleEditProduct}
              />
            ))}
          </div>
        )}
      </div>

      <AddProductDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddProductSuccess}
      />

      <EditProductDialog 
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedProduct(null)
        }}
        onSuccess={handleEditProductSuccess}
        product={selectedProduct}
      />

      <ViewProductDialog 
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />

      <DeleteProductDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedProduct(null)
          setIsDeleting(false)
        }}
        onConfirm={handleDeleteConfirm}
        product={selectedProduct}
        isDeleting={isDeleting}
      />
      
      <CartWidget />
    </div>
  )
}

export default App
