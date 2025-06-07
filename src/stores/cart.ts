import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  type: string
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
    getItems: (state) => state.items,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getTotal: (state) => {
      return state.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
    },
    getItemCount: (state) => {
      return state.items.reduce((count, item) => {
        return count + item.quantity
      }, 0)
    }
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
        
        this.items = response.data
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to add item to cart'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async updateCartItem(itemId: number, quantity: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.put(`/cart/${itemId}`, {
          quantity
        })
        
        const index = this.items.findIndex(item => item.id === itemId)
        if (index !== -1) {
          this.items[index] = response.data
        }
        
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update cart item'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async removeFromCart(itemId: number) {
      this.isLoading = true
      this.error = null

      try {
        await apiClient.delete(`/cart/${itemId}`)
        
        this.items = this.items.filter(item => item.id !== itemId)
        
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