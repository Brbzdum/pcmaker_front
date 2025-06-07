<template>
  <div class="review-form">
    <h3 class="form-title">{{ isEditing ? 'Редактировать отзыв' : 'Написать отзыв' }}</h3>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <form @submit.prevent="submitReview">
      <div class="form-group">
        <label class="rating-label">Ваша оценка</label>
        <div class="rating-input">
          <span 
            v-for="star in 5" 
            :key="star"
            class="rating-star" 
            :class="{ 'filled': star <= reviewData.rating, 'hovered': star <= hoveredRating }"
            @click="setRating(star)"
            @mouseenter="hoveredRating = star"
            @mouseleave="hoveredRating = 0"
          >
            ★
          </span>
        </div>
        <span class="rating-text">{{ getRatingText() }}</span>
      </div>
      
      <div class="form-group">
        <label for="review-comment">Ваш отзыв</label>
        <textarea 
          id="review-comment"
          v-model="reviewData.comment"
          rows="5"
          placeholder="Расскажите о вашем опыте использования этого товара..."
          :maxlength="maxCommentLength"
          required
        ></textarea>
        <div class="char-counter">
          {{ reviewData.comment.length }}/{{ maxCommentLength }}
        </div>
      </div>
      
      <div class="form-actions">
        <button 
          type="button" 
          class="btn btn-secondary" 
          @click="$emit('cancel')"
        >
          Отмена
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="isSubmitting || !isFormValid"
        >
          {{ isSubmitting ? 'Отправка...' : (isEditing ? 'Сохранить' : 'Отправить') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import { useReviewStore } from '@/stores/review'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  productId: number
  reviewToEdit?: any
}>()

const emit = defineEmits<{
  (e: 'success', review: any): void
  (e: 'cancel'): void
}>()

const reviewStore = useReviewStore()
const authStore = useAuthStore()

const isEditing = computed(() => !!props.reviewToEdit)
const isSubmitting = ref(false)
const error = ref('')
const hoveredRating = ref(0)
const maxCommentLength = 1000

// Initialize review data
const reviewData = reactive({
  userId: authStore.getUser?.id || 0,
  rating: props.reviewToEdit?.rating || 0,
  comment: props.reviewToEdit?.comment || ''
})

// Update userId if user changes
watch(() => authStore.getUser, (newUser) => {
  if (newUser) {
    reviewData.userId = newUser.id
  }
})

// Initialize from reviewToEdit if provided
watch(() => props.reviewToEdit, (newReview) => {
  if (newReview) {
    reviewData.rating = newReview.rating
    reviewData.comment = newReview.comment
  }
}, { immediate: true })

const isFormValid = computed(() => {
  return reviewData.rating > 0 && 
         reviewData.comment.trim().length >= 10 &&
         reviewData.userId > 0
})

// Set rating when user clicks on a star
const setRating = (rating: number) => {
  reviewData.rating = rating
}

// Get text description based on rating
const getRatingText = () => {
  switch (reviewData.rating) {
    case 0: return 'Выберите оценку'
    case 1: return 'Ужасно'
    case 2: return 'Плохо'
    case 3: return 'Нормально'
    case 4: return 'Хорошо'
    case 5: return 'Отлично'
    default: return 'Выберите оценку'
  }
}

// Submit review
const submitReview = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    let response
    
    if (isEditing.value && props.reviewToEdit) {
      response = await reviewStore.updateReview(props.reviewToEdit.id, reviewData)
    } else {
      response = await reviewStore.createReview(props.productId, reviewData)
    }
    
    if (response) {
      emit('success', response)
    } else {
      error.value = reviewStore.getError || 'Не удалось отправить отзыв'
    }
  } catch (err: any) {
    error.value = err.message || 'Произошла ошибка при отправке отзыва'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.review-form {
  background-color: var(--surface-color);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.error-message {
  background-color: var(--error-light-color);
  color: var(--error-color);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.rating-label {
  margin-bottom: 0.5rem;
}

.rating-input {
  display: flex;
  margin-bottom: 0.5rem;
}

.rating-star {
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-light-color);
  margin-right: 0.25rem;
  transition: color 0.2s ease;
}

.rating-star.filled {
  color: var(--star-color, gold);
}

.rating-star.hovered {
  color: var(--star-hover-color, #ffd700);
}

.rating-text {
  display: block;
  font-size: 0.9rem;
  margin-top: 0.25rem;
  color: var(--text-color);
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.char-counter {
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-light-color);
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark-color);
}

.btn-primary:disabled {
  background-color: var(--disabled-color);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--surface-alt-color, #f0f0f0);
  color: var(--text-color);
}

.btn-secondary:hover {
  background-color: var(--surface-alt-hover-color, #e0e0e0);
}

@media (max-width: 768px) {
  .review-form {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 