<template>
  <div class="verify-email-page">
    <div class="verify-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Проверка кода подтверждения...</p>
      </div>

      <div v-else-if="verificationError" class="error-message">
        <h2>Ошибка подтверждения</h2>
        <p>{{ errorMessage }}</p>
        <div class="buttons">
          <button @click="goToLogin" class="btn-primary">Вернуться на страницу входа</button>
        </div>
      </div>

      <div v-else-if="verificationSuccess" class="success-message">
        <h2>Email подтвержден!</h2>
        <p>Ваш аккаунт успешно активирован. Теперь вы можете войти в систему.</p>
        <div class="buttons">
          <button @click="goToLogin" class="btn-primary">Перейти на страницу входа</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/api/apiClient'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const verificationSuccess = ref(false)
const verificationError = ref(false)
const errorMessage = ref('Неверный или устаревший код подтверждения')

onMounted(async () => {
  // Получаем код верификации из URL
  const code = route.query.code as string

  if (!code) {
    verificationError.value = true
    errorMessage.value = 'Код подтверждения отсутствует'
    loading.value = false
    return
  }

  try {
    // Отправляем запрос на подтверждение email
    await apiClient.get(`/auth/verify?code=${code}`)
    
    // Axios всегда возвращает статус 2xx в блоке try, иначе переходит в catch
    verificationSuccess.value = true
  } catch (error: any) {
    verificationError.value = true
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    }
    console.error('Verification error:', error)
  } finally {
    loading.value = false
  }
})

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.verify-email-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.verify-container {
  width: 100%;
  max-width: 600px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
}

h2 {
  margin-bottom: 1rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.buttons {
  margin-top: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #2980b9;
}
</style> 