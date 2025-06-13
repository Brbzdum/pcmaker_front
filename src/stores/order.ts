import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface OrderItem {
  productId: number
  productName: string
  productPrice: number
  quantity: number
}

interface Order {
  id: number
  userId: number
  status: string
  items: OrderItem[]
  total: number
  address: string
  phone: string
  fullName: string
  comment?: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
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
  orders: Order[]
  currentOrder: Order | null
  orderHistory: OrderStatusHistory[]
  ordersByStatus: Record<string, Order[]>
  statistics: Record<string, any> | null
  isLoading: boolean
  error: string | null
}

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    orders: [],
    currentOrder: null,
    orderHistory: [],
    ordersByStatus: {},
    statistics: null,
    isLoading: false,
    error: null
  }),

  getters: {
    getOrders: (state) => state.orders,
    getCurrentOrder: (state) => state.currentOrder,
    getOrderHistory: (state) => state.orderHistory,
    getOrdersByStatus: (state) => (status: string) => state.ordersByStatus[status] || [],
    getStatistics: (state) => state.statistics,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchOrders() {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/orders')
        this.orders = Array.isArray(response.data) ? response.data : [response.data]
        return this.orders
      } catch (error: any) {
        console.error('Error fetching orders:', error)
        this.error = error.response?.data?.message || 'Ошибка при загрузке заказов'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchOrderById(orderId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/orders/${orderId}`)
        this.currentOrder = response.data
        return this.currentOrder
      } catch (error: any) {
        console.error(`Error fetching order ${orderId}:`, error)
        this.error = error.response?.data?.message || 'Ошибка при загрузке заказа'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async createOrder(orderData: any) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post('/orders', orderData)
        
        // Добавляем новый заказ в список заказов
        if (response.data) {
          this.orders.push(response.data)
        }
        
        return response.data
      } catch (error: any) {
        console.error('Error creating order:', error)
        this.error = error.response?.data?.message || 'Ошибка при создании заказа'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async cancelOrder(orderId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.put(`/orders/${orderId}/cancel`, {})
        
        // Обновляем статус заказа в списке
        const orderIndex = this.orders.findIndex((order) => order.id === orderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex] = response.data
        }
        
        return response.data
      } catch (error: any) {
        console.error(`Error cancelling order ${orderId}:`, error)
        this.error = error.response?.data?.message || 'Ошибка при отмене заказа'
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
    },

    async updateOrderStatus(orderId: number, status: string, comment?: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.put(`/orders/${orderId}/status`, {
          status: status,
          comment: comment || ''
        })
        
        // Обновляем статус заказа в списке
        const orderIndex = this.orders.findIndex((order) => order.id === orderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex] = response.data
        }
        
        // Обновляем текущий заказ, если он загружен
        if (this.currentOrder && this.currentOrder.id === orderId) {
          this.currentOrder = response.data
        }
        
        return response.data
      } catch (error: any) {
        console.error(`Error updating order status ${orderId}:`, error)
        this.error = error.response?.data?.message || 'Ошибка при обновлении статуса заказа'
        return null
      } finally {
        this.isLoading = false
      }
    }
  }
}) 