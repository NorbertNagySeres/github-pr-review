import { useReducer, useEffect, useCallback } from 'react'
import { CartContext } from './cartContext.js'

const API_BASE_URL = 'http://localhost:8000'

// Generate or get cart session ID
const getCartId = () => {
  let cartId = localStorage.getItem('cart-session-id')
  if (!cartId) {
    cartId = 'cart-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
    localStorage.setItem('cart-session-id', cartId)
  }
  return cartId
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        loading: false,
        error: null
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { 
    items: [], 
    loading: false, 
    error: null 
  })

  const cartId = getCartId()

  // Load cart from backend on mount
  const loadCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`)
      if (!response.ok) {
        throw new Error('Failed to load cart')
      }
      const cartData = await response.json()
      
      // Convert backend format to frontend format
      const items = cartData.items.map(item => ({
        id: item.id, // Backend cart item ID
        productId: item.product_id,
        quantity: item.quantity,
        productDetails: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          stock: item.product.stock,
          available_stock: item.product.available_stock
        }
      }))
      
      dispatch({ type: 'SET_CART', payload: { items } })
    } catch (error) {
      console.error('Failed to load cart:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }, [cartId])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addToCart = async (product, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to add to cart')
      }
      
      // Reload cart after adding
      await loadCart()
    } catch (error) {
      console.error('Failed to add to cart:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      // Show error to user
      alert('Error: ' + error.message)
    }
  }

  const removeFromCart = async (productId) => {
    try {
      // Find the cart item ID
      const item = state.items.find(item => item.productId === productId)
      if (!item) return
      
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items/${item.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove from cart')
      }
      
      await loadCart()
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      alert('Error: ' + error.message)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      const item = state.items.find(item => item.productId === productId)
      if (!item) return
      
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update quantity')
      }
      
      await loadCart()
    } catch (error) {
      console.error('Failed to update quantity:', error)
      alert('Error: ' + error.message)
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to clear cart')
      }
      
      dispatch({ type: 'SET_CART', payload: { items: [] } })
    } catch (error) {
      console.error('Failed to clear cart:', error)
      alert('Error: ' + error.message)
    }
  }

  const getCartItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => 
      total + (item.productDetails.price * item.quantity), 0
    )
  }

  const getProductQuantityInCart = (productId) => {
    const item = state.items.find(item => item.productId === productId)
    return item ? item.quantity : 0
  }

  const getAvailableStock = (product) => {
    // Use backend's available_stock if available, otherwise fallback to stock
    return product.available_stock !== undefined ? product.available_stock : product.stock
  }

  const canAddToCart = (product, quantity = 1) => {
    const availableStock = getAvailableStock(product)
    return availableStock >= quantity
  }

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
    getProductQuantityInCart,
    getAvailableStock,
    canAddToCart,
    refreshCart: loadCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}