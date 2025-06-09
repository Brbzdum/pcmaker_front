<template>
  <div class="login-page">
    <div class="form-container">
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Вход
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Регистрация
        </button>
      </div>
      
      <div v-if="activeTab === 'login'" class="login-form">
        <h2>Вход в аккаунт</h2>
        
        <div v-if="authStore.getError" class="error-message">
          {{ authStore.getError }}
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">Имя пользователя</label>
            <input 
              type="text" 
              id="username" 
              v-model="loginForm.username" 
              required
              :disabled="authStore.getIsLoading"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Пароль</label>
            <input 
              type="password" 
              id="password" 
              v-model="loginForm.password" 
              required
              :disabled="authStore.getIsLoading"
            >
          </div>
          
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="authStore.getIsLoading"
          >
            {{ authStore.getIsLoading ? 'Выполняется вход...' : 'Войти' }}
          </button>
        </form>
      </div>
      
      <div v-else-if="activeTab === 'register'" class="register-form">
        <h2>Создание аккаунта</h2>
        
        <div v-if="authStore.getError" class="error-message">
          {{ authStore.getError }}
        </div>
        
        <div v-if="registrationSuccess" class="success-message">
          {{ registrationMessage }}
          <p>Пожалуйста, проверьте вашу электронную почту и подтвердите регистрацию, перейдя по ссылке в письме.</p>
        </div>
        
        <form v-if="!registrationSuccess" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="reg-username">Имя пользователя</label>
            <input 
              type="text" 
              id="reg-username" 
              v-model="registerForm.username" 
              required
              :disabled="authStore.getIsLoading"
              @blur="validateUsername"
            >
            <div v-if="validationErrors.username" class="validation-error">
              {{ validationErrors.username }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="name">Полное имя</label>
            <input 
              type="text" 
              id="name" 
              v-model="registerForm.name" 
              required
              :disabled="authStore.getIsLoading"
              placeholder="Введите ваше полное имя"
              @blur="validateName"
            >
            <div v-if="validationErrors.name" class="validation-error">
              {{ validationErrors.name }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="registerForm.email" 
              required
              :disabled="authStore.getIsLoading"
              @blur="validateEmail"
            >
            <div v-if="validationErrors.email" class="validation-error">
              {{ validationErrors.email }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="reg-password">Пароль</label>
            <input 
              type="password" 
              id="reg-password" 
              v-model="registerForm.password" 
              required
              :disabled="authStore.getIsLoading"
              @blur="validatePassword"
            >
            <div v-if="validationErrors.password" class="validation-error">
              {{ validationErrors.password }}
            </div>
            <div class="password-requirements">
              <div :class="{ 'requirement-met': passwordLength }">• Минимум 6 символов</div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirm-password">Подтверждение пароля</label>
            <input 
              type="password" 
              id="confirm-password" 
              v-model="registerForm.confirmPassword" 
              required
              :disabled="authStore.getIsLoading"
              @blur="validateConfirmPassword"
            >
            <div v-if="validationErrors.confirmPassword" class="validation-error">
              {{ validationErrors.confirmPassword }}
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="authStore.getIsLoading || hasValidationErrors"
          >
            {{ authStore.getIsLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeTab = ref('login')
const registrationSuccess = ref(false)
const registrationMessage = ref('')

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Объект для хранения ошибок валидации
const validationErrors = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Проверяем длину пароля
const passwordLength = computed(() => registerForm.value.password.length >= 6)

// Проверяем, есть ли ошибки валидации
const hasValidationErrors = computed(() => {
  return Object.values(validationErrors.value).some(error => error !== '')
})

// Валидация имени пользователя
const validateUsername = () => {
  const username = registerForm.value.username
  if (!username) {
    validationErrors.value.username = 'Имя пользователя не может быть пустым'
  } else if (username.length < 3) {
    validationErrors.value.username = 'Имя пользователя должно быть не менее 3 символов'
  } else if (username.length > 50) {
    validationErrors.value.username = 'Имя пользователя должно быть не более 50 символов'
  } else if (!/^[a-zA-Z0-9_]*$/.test(username)) {
    validationErrors.value.username = 'Имя пользователя может содержать только буквы, цифры и знак подчеркивания'
  } else {
    validationErrors.value.username = ''
  }
}

// Валидация имени
const validateName = () => {
  const name = registerForm.value.name
  if (!name) {
    validationErrors.value.name = 'Имя не может быть пустым'
  } else {
    validationErrors.value.name = ''
  }
}

// Валидация email
const validateEmail = () => {
  const email = registerForm.value.email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    validationErrors.value.email = 'Email не может быть пустым'
  } else if (!emailRegex.test(email)) {
    validationErrors.value.email = 'Некорректный формат email'
  } else {
    validationErrors.value.email = ''
  }
}

// Валидация пароля
const validatePassword = () => {
  const password = registerForm.value.password
  if (!password) {
    validationErrors.value.password = 'Пароль не может быть пустым'
  } else if (password.length < 6) {
    validationErrors.value.password = 'Пароль должен быть не менее 6 символов'
  } else if (password.length > 120) {
    validationErrors.value.password = 'Пароль должен быть не более 120 символов'
  } else {
    validationErrors.value.password = ''
  }

  // Если уже есть подтверждение пароля, проверяем совпадение
  if (registerForm.value.confirmPassword) {
    validateConfirmPassword()
  }
}

// Валидация подтверждения пароля
const validateConfirmPassword = () => {
  const password = registerForm.value.password
  const confirmPassword = registerForm.value.confirmPassword
  if (!confirmPassword) {
    validationErrors.value.confirmPassword = 'Подтверждение пароля не может быть пустым'
  } else if (password !== confirmPassword) {
    validationErrors.value.confirmPassword = 'Пароли не совпадают'
  } else {
    validationErrors.value.confirmPassword = ''
  }
}

// Check if user came from a protected route and set a redirect
const redirectPath = computed(() => route.query.redirect as string || '/')

// If user is already logged in, redirect
watch(() => authStore.getIsAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    router.push(redirectPath.value)
  }
})

const handleLogin = async () => {
  const success = await authStore.login(
    loginForm.value.username,
    loginForm.value.password
  )
  
  if (success) {
    router.push(redirectPath.value)
  }
}

const handleRegister = async () => {
  // Валидация всех полей перед отправкой
  validateUsername()
  validateName()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  
  // Проверяем наличие ошибок валидации
  if (hasValidationErrors.value) return
  
  const result = await authStore.register(
    registerForm.value.username,
    registerForm.value.email,
    registerForm.value.password,
    registerForm.value.name
  )
  
  if (result.success) {
    registrationSuccess.value = true
    registrationMessage.value = result.message
    // Не перенаправляем пользователя, а показываем сообщение о необходимости подтверждения email
  }
}
</script>

<style scoped>
.login-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.form-container {
  width: 100%;
  max-width: 480px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tab-btn.active {
  background-color: #f8f9fa;
  border-bottom: 2px solid #3498db;
}

.login-form,
.register-form {
  padding: 2rem;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.password-requirements {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.requirement-met {
  color: #28a745;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.validation-error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  text-align: center;
}
</style> 