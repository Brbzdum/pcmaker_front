import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface Review {
  id: number
  userId: number
  productId: number
  rating: number
  comment: string
  createdAt: string
  moderated: boolean
  approved: boolean
  reportCount: number
}

interface ReviewDto {
  userId: number
  rating: number
  comment: string
}

interface ReviewState {
  productReviews: Record<number, Review[]>
  pendingReviews: Review[]
  reportedReviews: Review[]
  isLoading: boolean
  error: string | null
}

export const useReviewStore = defineStore('review', {
  state: (): ReviewState => ({
    productReviews: {},
    pendingReviews: [],
    reportedReviews: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getProductReviews: (state) => (productId: number) => state.productReviews[productId] || [],
    getPendingReviews: (state) => state.pendingReviews,
    getReportedReviews: (state) => state.reportedReviews,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchProductReviews(productId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/reviews/product/${productId}`)
        this.productReviews[productId] = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch product reviews'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchProductRating(productId: number) {
      try {
        const response = await apiClient.get(`/reviews/product/${productId}/rating`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch product rating'
        return 0
      }
    },

    async createReview(productId: number, reviewData: ReviewDto) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post(`/reviews/product/${productId}`, reviewData)
        
        // Обновляем список отзывов для продукта
        if (this.productReviews[productId]) {
          this.productReviews[productId].push(response.data)
        } else {
          this.productReviews[productId] = [response.data]
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create review'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateReview(reviewId: number, reviewData: ReviewDto) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.put(`/reviews/${reviewId}`, reviewData)
        
        // Обновляем отзыв в списках, если он там есть
        for (const productId in this.productReviews) {
          const index = this.productReviews[productId].findIndex(r => r.id === reviewId)
          if (index !== -1) {
            this.productReviews[productId][index] = response.data
            break
          }
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update review'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async deleteReview(reviewId: number) {
      this.isLoading = true
      this.error = null

      try {
        await apiClient.delete(`/reviews/${reviewId}`)
        
        // Удаляем отзыв из списков
        for (const productId in this.productReviews) {
          this.productReviews[productId] = this.productReviews[productId].filter(r => r.id !== reviewId)
        }
        
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to delete review'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async fetchPendingReviews() {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/reviews/pending')
        this.pendingReviews = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch pending reviews'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async moderateReview(reviewId: number, approved: boolean) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.put(`/reviews/${reviewId}/moderate?approved=${approved}`, {})
        
        // Обновляем отзыв в списках
        this.pendingReviews = this.pendingReviews.filter(r => r.id !== reviewId)
        
        for (const productId in this.productReviews) {
          const index = this.productReviews[productId].findIndex(r => r.id === reviewId)
          if (index !== -1) {
            this.productReviews[productId][index] = response.data
            break
          }
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to moderate review'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchReportedReviews() {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/reviews/reported')
        this.reportedReviews = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch reported reviews'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async reportReview(reviewId: number, reason: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post(`/reviews/${reviewId}/report?reason=${encodeURIComponent(reason)}`, {})
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to report review'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async getReviewAnalytics(productId: number) {
      try {
        const response = await apiClient.get(`/reviews/analytics/product/${productId}`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch review analytics'
        return null
      }
    }
  }
}) 