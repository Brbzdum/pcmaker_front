import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface Review {
  id: number
  userId: number
  username: string
  productId: number
  productName: string
  rating: number
  comment: string
  isApproved: boolean
  isVerifiedPurchase: boolean
  reportCount: number
  isModerated: boolean
  createdAt: string
  updatedAt: string
  reported?: boolean
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
        console.log('Raw reviews data:', response.data);
        
        // Проверяем наличие дат в каждом отзыве
        const reviews = response.data.map((review: Review) => {
          console.log(`Review ${review.id} date:`, review.createdAt);
          
          // Если дата не указана или пустая, добавляем текущую дату
          if (!review.createdAt) {
            console.warn(`Review ${review.id} has no date, using current date`);
            review.createdAt = new Date().toISOString();
          }
          
          return {
            ...review,
            reported: review.reportCount > 0
          };
        })
        
        this.productReviews[productId] = reviews
        return reviews
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
        
        // Add reported property
        const review = {
          ...response.data,
          reported: response.data.reportCount > 0
        }
        
        // Обновляем список отзывов для продукта
        if (this.productReviews[productId]) {
          this.productReviews[productId].push(review)
        } else {
          this.productReviews[productId] = [review]
        }
        
        return review
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
        
        // Add reported property
        const review = {
          ...response.data,
          reported: response.data.reportCount > 0
        }
        
        // Обновляем отзыв в списках, если он там есть
        for (const productId in this.productReviews) {
          const index = this.productReviews[productId].findIndex(r => r.id === reviewId)
          if (index !== -1) {
            this.productReviews[productId][index] = review
            break
          }
        }
        
        return review
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
        
        // Add reported property
        const review = {
          ...response.data,
          reported: response.data.reportCount > 0
        }
        
        // Обновляем отзыв в списках
        this.pendingReviews = this.pendingReviews.filter(r => r.id !== reviewId)
        
        for (const productId in this.productReviews) {
          const index = this.productReviews[productId].findIndex(r => r.id === reviewId)
          if (index !== -1) {
            this.productReviews[productId][index] = review
            break
          }
        }
        
        return review
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
        // Add reported property
        const reviews = response.data.map((review: Review) => ({
          ...review,
          reported: review.reportCount > 0
        }))
        this.reportedReviews = reviews
        return reviews
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
        
        // If the report was successful, update the review in all lists
        if (response.data) {
          const review = {
            ...response.data,
            reported: true  // Explicitly mark as reported after reporting
          }
          
          // Update in product reviews
          for (const productId in this.productReviews) {
            const index = this.productReviews[productId].findIndex(r => r.id === reviewId)
            if (index !== -1) {
              this.productReviews[productId][index] = review
              break
            }
          }
          
          return review
        }
        
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