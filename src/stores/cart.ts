import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface CartItemDto {
  productId: number
  productName: string
  productDescription: string
  productImageUrl: string
  productPrice: number
  quantity: number
  totalPrice: number
  stockError?: boolean // Флаг для отслеживания ошибок наличия на складе
  outOfStock?: boolean // Флаг для отображения в UI
}

interface CartDto {
  id: number
  userId: number
  userName: string
  items: CartItemDto[]
  createdAt: string
  updatedAt: string
}

interface CartState {
  cart: CartDto | null
  isLoading: boolean
  error: string | null
  lastErrorProductId: number | null // Хранит ID товара, вызвавшего последнюю ошибку
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    cart: null,
    isLoading: false,
    error: null,
    lastErrorProductId: null
  }),

  getters: {
    getItems: (state) => state.cart?.items || [],
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getTotal: (state) => {
      if (!state.cart?.items) return 0
      return state.cart.items.reduce((sum, item) => {
        return sum + item.totalPrice
      }, 0)
    },
    getItemCount: (state) => {
      if (!state.cart?.items) return 0
      return state.cart.items.reduce((count, item) => {
        return count + item.quantity
      }, 0)
    }
  },

  actions: {
    async fetchCart() {
      this.isLoading = true
      this.error = null

      try {
        const userId = localStorage.getItem('user_id') || '1'
        const response = await apiClient.get(`/cart?userId=${userId}`)
        this.cart = response.data
        
        // Проверяем товары на наличие ошибок
        if (this.cart?.items && this.lastErrorProductId) {
          const updatedItems = [];
          for (let i = 0; i < this.cart.items.length; i++) {
            const item = this.cart.items[i];
            if (item.productId === this.lastErrorProductId) {
              updatedItems.push({
                ...item,
                outOfStock: true,
                stockError: true
              });
            } else {
              updatedItems.push(item);
            }
          }
          this.cart.items = updatedItems;
        }
        
        return response.data
      } catch (error: any) {
        console.error('Error fetching cart:', error)
        // Не показываем ошибку в UI
        return null
      } finally {
        this.isLoading = false
      }
    },

    async addToCart(productId: number, quantity: number = 1) {
      this.isLoading = true
      this.error = null

      try {
        // Получаем ID пользователя из localStorage
        const userId = localStorage.getItem('user_id') || '1' // Временно используем 1, если ID не найден
        
        // Используем правильный URL и параметры запроса
        const response = await apiClient.post(`/cart/items?userId=${userId}&productId=${productId}&quantity=${quantity}`)
        
        this.cart = response.data
        return true
      } catch (error: any) {
        console.error('Error adding to cart:', error)
        
        // Запоминаем ID товара, вызвавшего ошибку
        this.lastErrorProductId = productId
        
        // После ошибки перезагружаем корзину, чтобы обновить состояние
        await this.fetchCart()
        return false
      } finally {
        this.isLoading = false
      }
    },

    async updateCartItem(productId: number, quantity: number) {
      this.isLoading = true
      this.error = null

      try {
        const userId = localStorage.getItem('user_id') || '1'
        const response = await apiClient.put(`/cart/items/${productId}?userId=${userId}&quantity=${quantity}`)
        
        this.cart = response.data
        return true
      } catch (error: any) {
        console.error('Error updating cart item:', error)
        
        // Запоминаем ID товара, вызвавшего ошибку
        this.lastErrorProductId = productId
        
        // После ошибки перезагружаем корзину, чтобы обновить состояние
        await this.fetchCart()
        return false
      } finally {
        this.isLoading = false
      }
    },

    async removeFromCart(productId: number) {
      this.isLoading = true
      this.error = null

      try {
        const userId = localStorage.getItem('user_id') || '1'
        const response = await apiClient.delete(`/cart/items/${productId}?userId=${userId}`)
        
        this.cart = response.data
        return true
      } catch (error: any) {
        console.error('Error removing from cart:', error)
        // Не показываем ошибку в UI
        return false
      } finally {
        this.isLoading = false
      }
    },

    async clearCart() {
      this.isLoading = true
      this.error = null

      try {
        const userId = localStorage.getItem('user_id') || '1'
        await apiClient.delete(`/cart?userId=${userId}`)
        
        this.cart = null
        this.lastErrorProductId = null
        return true
      } catch (error: any) {
        console.error('Error clearing cart:', error)
        // Не показываем ошибку в UI
        return false
      } finally {
        this.isLoading = false
      }
    }
  }
}) 