import { useState } from 'react'
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react'
import { useCart } from '../hooks/useCart.js'

export function CartWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { 
    items, 
    getCartItemCount, 
    getCartTotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart()
  
  const itemCount = getCartItemCount()
  const total = getCartTotal()
  
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }
  
  const handleRemoveItem = (productId) => {
    removeFromCart(productId)
  }
  
  const toggleCart = () => {
    setIsExpanded(!isExpanded)
  }
  
  if (itemCount === 0 && !isExpanded) {
    return null
  }
  
  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isExpanded ? (
        <button
          onClick={toggleCart}
          className="bg-black text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
        >
          <div className="relative">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-black">Shopping Cart</h3>
            <button
              onClick={toggleCart}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
            >
              <X size={16} />
            </button>
          </div>
          
          {items.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-black truncate">
                        {item.productDetails.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        ${item.productDetails.price} each
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.productDetails.stock}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-black">Total:</span>
                  <span className="text-base font-semibold text-black">
                    ${total.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200"
                  >
                    Clear Cart
                  </button>
                  <button
                    className="flex-1 py-2 px-3 bg-black text-white text-xs font-medium rounded hover:bg-gray-900"
                    onClick={() => alert('Checkout functionality would go here!')}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}