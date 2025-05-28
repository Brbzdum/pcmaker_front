import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getCartItems: (state) => state.items,
    getCartTotal: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    getCartItemCount: (state) => state.items.reduce((count, item) => count + item.quantity, 0),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchCart() {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/cart')
        this.items = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch cart'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async addToCart(productId: number, quantity: number = 1) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post('/cart', {
          productId,
          quantity
        })
        
        await this.fetchCart()
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to add item to cart'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateCartItem(cartItemId: number, quantity: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.put(`/cart/${cartItemId}`, {
          quantity
        })
        
        await this.fetchCart()
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update cart item'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async removeFromCart(cartItemId: number) {
      this.isLoading = true
      this.error = null

      try {
        await apiClient.delete(`/cart/${cartItemId}`)
        await this.fetchCart()
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to remove item from cart'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async clearCart() {
      this.isLoading = true
      this.error = null

      try {
        await apiClient.delete('/cart')
        this.items = []
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to clear cart'
        return false
      } finally {
        this.isLoading = false
      }
    }
  }
}) 