<template>
  <div class="catalog-item">
    <div class="container" v-if="component">
      <div class="item-content">
        <div class="item-image">
          <img :src="component.imageUrl || 'https://via.placeholder.com/400x300?text=Component'" :alt="component.name">
        </div>
        
        <div class="item-details">
          <h1>{{ component.name }}</h1>
          <div class="item-meta">
            <span class="item-type">{{ component.type }}</span>
            <span class="item-manufacturer">{{ component.manufacturer }}</span>
          </div>
          
          <div class="item-rating" v-if="productRating > 0">
            <div class="stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= Math.round(productRating) }">★</span>
            </div>
            <span class="rating-text">{{ productRating.toFixed(1) }} из 5</span>
          </div>
          
          <div class="item-price">{{ component.price?.toFixed(2) }} ₽</div>
          
          <div class="item-description">
            <h3>Описание</h3>
            <p>{{ component.description }}</p>
          </div>
          
          <div class="item-actions">
            <button class="btn-add" @click="addToConfigurator(component)">
              Добавить в конфигуратор
            </button>
            <button class="btn-cart" @click="addToCart(component)">
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
      
      <div class="item-specs" v-if="component.specifications">
        <h3>Характеристики</h3>
        <div class="specs-table">
          <div v-for="(value, key) in component.specifications" :key="key" class="spec-row">
            <div class="spec-name">{{ formatSpecName(key) }}</div>
            <div class="spec-value">{{ value }}</div>
          </div>
        </div>
      </div>
      
      <!-- Секция отзывов -->
      <div class="reviews-section">
        <ReviewList 
          :productId="Number(route.params.id)" 
          @add-review="showReviewForm = true"
          @edit-review="editReview"
          @delete-review="deleteReview"
          @report-review="reportReview"
        />
      </div>
      
      <!-- Модальное окно для добавления/редактирования отзыва -->
      <div class="review-modal" v-if="showReviewForm">
        <div class="modal-overlay" @click="closeReviewForm"></div>
        <div class="modal-content">
          <button class="modal-close" @click="closeReviewForm">×</button>
          <ReviewForm 
            :productId="Number(route.params.id)"
            :reviewToEdit="reviewToEdit"
            @success="onReviewSuccess"
            @cancel="closeReviewForm"
          />
        </div>
      </div>
      
      <!-- Модальное окно для жалобы на отзыв -->
      <div class="report-modal" v-if="showReportForm">
        <div class="modal-overlay" @click="closeReportForm"></div>
        <div class="modal-content">
          <button class="modal-close" @click="closeReportForm">×</button>
          <div class="report-form">
            <h3>Пожаловаться на отзыв</h3>
            <p>Пожалуйста, укажите причину жалобы:</p>
            <textarea 
              v-model="reportReason" 
              placeholder="Опишите, почему этот отзыв нарушает правила..."
              rows="4"
            ></textarea>
            <div class="form-actions">
              <button class="btn-secondary" @click="closeReportForm">Отмена</button>
              <button 
                class="btn-primary" 
                :disabled="reportReason.length < 10 || isReporting"
                @click="submitReport"
              >
                {{ isReporting ? 'Отправка...' : 'Отправить' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="loading" v-else-if="loading">Загрузка информации о товаре...</div>
    <div class="error" v-else>
      <h2>Товар не найден</h2>
      <p>Товар, который вы ищете, не существует или был удален.</p>
      <RouterLink to="/catalog" class="btn-back">Вернуться в каталог</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useConfiguratorStore } from '@/stores/configurator'
import { useCartStore } from '@/stores/cart'
import { useReviewStore } from '@/stores/review'
import { useAuthStore } from '@/stores/auth'
import ReviewList from '@/components/review/ReviewList.vue'
import ReviewForm from '@/components/review/ReviewForm.vue'

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const configuratorStore = useConfiguratorStore()
const cartStore = useCartStore()
const reviewStore = useReviewStore()
const authStore = useAuthStore()

const component = ref<any>(null)
const loading = ref(true)
const productRating = ref(0)

// Состояние для модальных окон отзывов
const showReviewForm = ref(false)
const reviewToEdit = ref(null)
const showReportForm = ref(false)
const reportReason = ref('')
const reportingReviewId = ref<number | null>(null)
const isReporting = ref(false)

onMounted(async () => {
  const id = Number(route.params.id)
  
  try {
    // Загружаем данные о товаре
    const product = await catalogStore.fetchComponentById(id)
    if (product) {
      component.value = product
      
      // Загружаем рейтинг товара
      const rating = await reviewStore.fetchProductRating(id)
      productRating.value = rating
    }
  } catch (error) {
    console.error('Error fetching component:', error)
  } finally {
    loading.value = false
  }
})

const formatSpecName = (key: string): string => {
  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

const addToConfigurator = (item: any) => {
  configuratorStore.selectComponent(item.type, item)
  router.push('/configurator')
}

const addToCart = (item: any) => {
  cartStore.addToCart(item)
}

// Функции для работы с отзывами
const editReview = (review: any) => {
  if (!authStore.getIsAuthenticated) {
    router.push('/login')
    return
  }
  
  reviewToEdit.value = review
  showReviewForm.value = true
}

const deleteReview = async (reviewId: number) => {
  if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
    await reviewStore.deleteReview(reviewId)
    // Обновляем рейтинг товара после удаления отзыва
    const rating = await reviewStore.fetchProductRating(Number(route.params.id))
    productRating.value = rating
  }
}

const reportReview = (reviewId: number) => {
  if (!authStore.getIsAuthenticated) {
    router.push('/login')
    return
  }
  
  reportingReviewId.value = reviewId
  showReportForm.value = true
}

const closeReviewForm = () => {
  showReviewForm.value = false
  reviewToEdit.value = null
}

const closeReportForm = () => {
  showReportForm.value = false
  reportReason.value = ''
  reportingReviewId.value = null
}

const onReviewSuccess = async () => {
  closeReviewForm()
  // Обновляем рейтинг товара после добавления/обновления отзыва
  const rating = await reviewStore.fetchProductRating(Number(route.params.id))
  productRating.value = rating
}

const submitReport = async () => {
  if (!reportingReviewId.value || reportReason.value.length < 10) return
  
  isReporting.value = true
  
  try {
    await reviewStore.reportReview(reportingReviewId.value, reportReason.value)
    closeReportForm()
  } catch (error) {
    console.error('Error reporting review:', error)
  } finally {
    isReporting.value = false
  }
}
</script>

<style scoped>
.catalog-item {
  width: 100%;
  padding: 2rem;
  background-color: var(--background-color);
  color: var(--text-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.item-content {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.item-image {
  flex: 0 0 40%;
}

.item-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.item-details {
  flex: 1;
}

h1 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.item-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.item-type, .item-manufacturer {
  background-color: var(--primary-color);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.item-rating {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.stars {
  display: flex;
  margin-right: 0.5rem;
}

.star {
  font-size: 1.2rem;
  color: var(--text-light-color);
  margin-right: 2px;
}

.star.filled {
  color: var(--star-color, gold);
}

.rating-text {
  font-size: 0.9rem;
  color: var(--text-color);
}

.item-price {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.item-description {
  margin-bottom: 2rem;
}

.item-description h3 {
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.item-description p {
  color: var(--text-secondary-color);
  line-height: 1.6;
}

.item-actions {
  display: flex;
  gap: 1rem;
}

.btn-add, .btn-cart {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add {
  background-color: var(--primary-color);
  color: white;
}

.btn-add:hover {
  background-color: var(--primary-dark-color, #2980b9);
}

.btn-cart {
  background-color: var(--secondary-color);
  color: white;
}

.btn-cart:hover {
  background-color: var(--secondary-dark-color, #27ae60);
}

.item-specs {
  background-color: var(--surface-color);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px var(--shadow-color);
  margin-bottom: 2rem;
}

.item-specs h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.specs-table {
  display: grid;
  gap: 1rem;
}

.spec-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.spec-name {
  font-weight: bold;
  color: var(--text-color);
}

.spec-value {
  color: var(--text-secondary-color);
}

.reviews-section {
  margin-top: 3rem;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
}

.error h2 {
  margin-bottom: 1rem;
}

.error p {
  margin-bottom: 2rem;
  color: var(--text-secondary-color);
}

.btn-back {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn-back:hover {
  background-color: var(--primary-dark-color, #2980b9);
}

/* Стили для модальных окон */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 101;
  background-color: var(--background-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
}

.report-form {
  padding: 2rem;
}

.report-form h3 {
  margin-bottom: 1rem;
}

.report-form p {
  margin-bottom: 1rem;
  color: var(--text-secondary-color);
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:disabled {
  background-color: var(--disabled-color);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--surface-alt-color, #f0f0f0);
  color: var(--text-color);
}

@media (max-width: 768px) {
  .item-content {
    flex-direction: column;
  }
  
  .item-image {
    flex: none;
    margin-bottom: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
</style> 