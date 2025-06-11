<template>
  <div class="review-list">
    <h3 class="review-list-title">Отзывы ({{ reviews.length }})</h3>
    
    <div v-if="isLoading" class="review-loading">
      <div class="spinner"></div>
      <p>Загрузка отзывов...</p>
    </div>
    
    <div v-else-if="error" class="review-error">
      <p>{{ error }}</p>
      <button @click="loadReviews" class="btn btn-retry">Повторить</button>
    </div>
    
    <div v-else-if="reviews.length === 0" class="review-empty">
      <p>Отзывов еще нет. Будьте первым, кто оставит отзыв!</p>
      <button @click="$emit('add-review')" class="btn btn-primary">Написать отзыв</button>
    </div>
    
    <div v-else class="review-content">
      <!-- Rating summary -->
      <div class="review-summary">
        <div class="review-avg-rating">
          <span class="avg-rating-value">{{ avgRating.toFixed(1) }}</span>
          <div class="stars">
            <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= Math.round(avgRating) }">★</span>
          </div>
          <span class="review-count">{{ reviews.length }} отзывов</span>
        </div>
        
        <div class="rating-bars">
          <div v-for="i in 5" :key="i" class="rating-bar">
            <span class="rating-label">{{ 6 - i }}</span>
            <div class="bar-container">
              <div class="bar" :style="{ width: getRatingPercentage(6 - i) + '%' }"></div>
            </div>
            <span class="rating-count">{{ getRatingCount(6 - i) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Review list -->
      <div class="review-items">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="review-user">
              <div class="avatar">{{ review.username?.charAt(0) || 'U' }}</div>
              <div class="user-info">
                <div class="username">{{ review.username || 'Пользователь' }}</div>
                <div class="review-date">{{ formatDate(review.createdAt) }}</div>
              </div>
            </div>
            <div class="review-rating">
              <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= review.rating }">★</span>
            </div>
          </div>
          
          <div class="review-body">
            <p>{{ review.comment }}</p>
          </div>
          
          <div class="review-footer">
            <div class="review-actions">
              <button 
                v-if="canEdit(review)" 
                @click="$emit('edit-review', review)" 
                class="btn btn-text"
              >
                Редактировать
              </button>
              <button 
                v-if="canEdit(review)" 
                @click="$emit('delete-review', review.id)" 
                class="btn btn-text btn-danger"
              >
                Удалить
              </button>
              <button 
                v-if="!canEdit(review)" 
                @click="$emit('report-review', review.id)" 
                class="btn btn-text"
              >
                Пожаловаться
              </button>
            </div>
            
            <div v-if="review.reported" class="review-reported">
              Отзыв был отмечен как неуместный
            </div>
          </div>
        </div>
      </div>
      
      <div class="review-actions-bottom">
        <button @click="$emit('add-review')" class="btn btn-primary">Написать отзыв</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useReviewStore } from '@/stores/review'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  productId: number
}>()

const emit = defineEmits<{
  (e: 'add-review'): void
  (e: 'edit-review', review: any): void
  (e: 'delete-review', reviewId: number): void
  (e: 'report-review', reviewId: number): void
}>()

const reviewStore = useReviewStore()
const authStore = useAuthStore()

const reviews = computed(() => reviewStore.getProductReviews(props.productId))
const isLoading = computed(() => reviewStore.getIsLoading)
const error = computed(() => reviewStore.getError)

// Computed properties for rating statistics
const avgRating = computed(() => {
  if (reviews.value.length === 0) return 0
  
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.value.length
})

// Helper methods
const getRatingCount = (rating: number) => {
  return reviews.value.filter(review => review.rating === rating).length
}

const getRatingPercentage = (rating: number) => {
  if (reviews.value.length === 0) return 0
  
  return (getRatingCount(rating) / reviews.value.length) * 100
}

const formatDate = (dateStr: string) => {
  if (!dateStr) {
    return 'Н/Д';
  }
  
  try {
    const date = new Date(dateStr);
    
    // Проверка на валидность даты
    if (isNaN(date.getTime())) {
      return 'Некорректная дата';
    }
    
    return new Intl.DateTimeFormat('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return 'Ошибка даты';
  }
}

const canEdit = (review: any) => {
  return authStore.getIsAuthenticated && 
         authStore.getUser && 
         review.userId === authStore.getUser.id
}

// Load reviews on component mount
const loadReviews = async () => {
  await reviewStore.fetchProductReviews(props.productId)
}

onMounted(loadReviews)
</script>

<style scoped>
.review-list {
  margin: 2rem 0;
  width: 100%;
}

.review-list-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.review-loading,
.review-error,
.review-empty {
  padding: 2rem;
  text-align: center;
  background-color: var(--surface-color, #fff);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary-color, #3498db);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.review-content {
  width: 100%;
}

.review-summary {
  display: flex;
  padding: 1.5rem;
  background-color: var(--surface-color, #fff);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  gap: 2rem;
}

.review-avg-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 2rem;
  border-right: 1px solid var(--border-color, #eee);
}

.avg-rating-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stars {
  display: flex;
  margin-bottom: 0.5rem;
}

.star {
  font-size: 1.2rem;
  color: var(--text-light-color, #aaa);
  margin: 0 2px;
}

.star.filled {
  color: gold;
}

.review-count {
  font-size: 0.9rem;
  color: var(--text-light-color, #aaa);
}

.rating-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.rating-bar {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.rating-label {
  width: 1.5rem;
  text-align: right;
  margin-right: 0.5rem;
}

.bar-container {
  flex: 1;
  height: 8px;
  background-color: var(--background-light-color, #f0f0f0);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 0.5rem;
}

.bar {
  height: 100%;
  background-color: var(--primary-color, #3498db);
}

.rating-count {
  width: 2rem;
  text-align: left;
  font-size: 0.9rem;
  color: var(--text-light-color, #aaa);
}

.review-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-item {
  padding: 1.5rem;
  background-color: var(--surface-color, #fff);
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.review-user {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color, #3498db);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.review-date {
  font-size: 0.9rem;
  color: var(--text-light-color, #aaa);
}

.review-body {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color, #eee);
  padding-top: 1rem;
}

.review-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: var(--primary-color, #3498db);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark-color, #2980b9);
}

.btn-text {
  background-color: transparent;
  color: var(--primary-color, #3498db);
  padding: 0.5rem;
}

.btn-text:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.btn-danger {
  color: var(--error-color, #d32f2f);
}

.review-reported {
  font-size: 0.9rem;
  color: var(--warning-color, #f39c12);
}

.review-actions-bottom {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .review-summary {
    flex-direction: column;
  }
  
  .review-avg-rating {
    padding-right: 0;
    padding-bottom: 1.5rem;
    border-right: none;
    border-bottom: 1px solid var(--border-color, #eee);
    margin-bottom: 1.5rem;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .review-rating {
    margin-top: 1rem;
  }
}
</style> 