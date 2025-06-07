import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface OrderItem {
  productId: number
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: number
  userId: number
  status: string
  totalPrice: number
  createdAt: string
  updatedAt: string
  deliveryAddress: string
  items: OrderItem[]
}

interface OrderStatusHistory {
  id: number
  status: string
  comment: string
  changedAt: string
}

interface OrderCreateRequest {
  userId: number
  configurationId?: number
}

interface OrderStatusUpdateRequest {
  status: string
  comment?: string
}

interface OrderState {
  userOrders: Order[]
  currentOrder: Order | null
  orderHistory: OrderStatusHistory[]
  ordersByStatus: Record<string, Order[]>
  statistics: Record<string, any> | null
  isLoading: boolean
  error: string | null
}

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    userOrders: [],
    currentOrder: null,
    orderHistory: [],
    ordersByStatus: {},
    statistics: null,
    isLoading: false,
    error: null
  }),

  getters: {
    getUserOrders: (state) => state.userOrders,
    getCurrentOrder: (state) => state.currentOrder,
    getOrderHistory: (state) => state.orderHistory,
    getOrdersByStatus: (state) => (status: string) => state.ordersByStatus[status] || [],
    getStatistics: (state) => state.statistics,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchUserOrders(userId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/orders?userId=${userId}`)
        this.userOrders = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch user orders'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchOrder(orderId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/orders/${orderId}`)
        this.currentOrder = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch order'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async createOrderFromCart(userId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post('/orders/from-cart', { userId })
        
        this.userOrders.push(response.data)
        this.currentOrder = response.data
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create order from cart'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async createOrderFromConfiguration(userId: number, configurationId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post('/orders/from-configuration', {
          userId,
          configurationId
        })
        
        this.userOrders.push(response.data)
        this.currentOrder = response.data
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create order from configuration'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateOrderStatus(orderId: number, status: string, comment?: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.put(`/orders/${orderId}/status`, {
          status,
          comment
        })
        
        this.currentOrder = response.data
        
        // Обновляем заказ в списке заказов пользователя
        const index = this.userOrders.findIndex(o => o.id === orderId)
        if (index !== -1) {
          this.userOrders[index] = response.data
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update order status'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchOrderStatusHistory(orderId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/orders/${orderId}/history`)
        this.orderHistory = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch order status history'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchOrdersByStatus(status: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/orders/by-status?status=${status}`)
        this.ordersByStatus[status] = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch orders by status'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchOrdersByDateRange(startDate: string, endDate: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(
          `/orders/by-date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
        )
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch orders by date range'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchOrderStatistics() {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/orders/statistics')
        this.statistics = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch order statistics'
        return null
      } finally {
        this.isLoading = false
      }
    }
  }
}) 