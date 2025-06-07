<template>
  <div class="login-page">
    <div class="form-container">
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Register
        </button>
      </div>
      
      <div v-if="activeTab === 'login'" class="login-form">
        <h2>Login to Your Account</h2>
        
        <div v-if="authStore.getError" class="error-message">
          {{ authStore.getError }}
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              v-model="loginForm.username" 
              required
              :disabled="authStore.getIsLoading"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
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
            {{ authStore.getIsLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
      
      <div v-else-if="activeTab === 'register'" class="register-form">
        <h2>Create an Account</h2>
        
        <div v-if="authStore.getError" class="error-message">
          {{ authStore.getError }}
        </div>
        
        <div v-if="registrationSuccess" class="success-message">
          {{ registrationMessage }}
          <p>Пожалуйста, проверьте вашу электронную почту и подтвердите регистрацию, перейдя по ссылке в письме.</p>
        </div>
        
        <form v-if="!registrationSuccess" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="reg-username">Username</label>
            <input 
              type="text" 
              id="reg-username" 
              v-model="registerForm.username" 
              required
              :disabled="authStore.getIsLoading"
            >
          </div>
          
          <div class="form-group">
            <label for="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="registerForm.name" 
              required
              :disabled="authStore.getIsLoading"
              placeholder="Enter your full name"
            >
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="registerForm.email" 
              required
              :disabled="authStore.getIsLoading"
            >
          </div>
          
          <div class="form-group">
            <label for="reg-password">Password</label>
            <input 
              type="password" 
              id="reg-password" 
              v-model="registerForm.password" 
              required
              :disabled="authStore.getIsLoading"
            >
          </div>
          
          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input 
              type="password" 
              id="confirm-password" 
              v-model="registerForm.confirmPassword" 
              required
              :disabled="authStore.getIsLoading"
            >
            <div v-if="passwordMismatch" class="validation-error">
              Passwords do not match
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="authStore.getIsLoading || passwordMismatch"
          >
            {{ authStore.getIsLoading ? 'Registering...' : 'Register' }}
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

// Check if user came from a protected route and set a redirect
const redirectPath = computed(() => route.query.redirect as string || '/')

// Check if passwords match in register form
const passwordMismatch = computed(() => {
  return registerForm.value.password !== registerForm.value.confirmPassword && 
         registerForm.value.confirmPassword.length > 0
})

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
  if (passwordMismatch.value) return
  
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

:global(.theme-dark) .form-container {
  background-color: #181922 !important;
  color: #fff !important;
}

:global(.theme-dark) .form-container,
:global(.theme-dark) .form-container * {
  color: #fff !important;
}

:global(.theme-dark) .form-group input {
  background-color: #232434 !important;
  color: #ffffff !important;
  border: 1px solid #444 !important;
  box-shadow: 0 0 0 1px rgba(76, 194, 255, 0.1);
}

:global(.theme-dark) .form-group label {
  color: #b8c7ff !important;
  font-weight: bold !important;
}

:global(.theme-dark) h2 {
  color: #fff !important;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
}

:global(.theme-dark) .tabs {
  border-bottom-color: rgba(255, 255, 255, 0.1);
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

:global(.theme-dark) .tab-btn {
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn.active {
  background-color: #f8f9fa;
  border-bottom: 2px solid #3498db;
}

:global(.theme-dark) .tab-btn.active {
  background-color: rgba(0, 170, 255, 0.1);
  border-bottom-color: #4cc2ff;
  color: #ffffff;
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

:global(.theme-dark) .error-message {
  background-color: rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
  border: 1px solid rgba(220, 53, 69, 0.5);
}

.validation-error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

:global(.theme-dark) .validation-error {
  color: #ff6b6b;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  text-align: center;
}

:global(.theme-dark) .success-message {
  background-color: rgba(40, 167, 69, 0.3);
  color: #75b798;
  border: 1px solid rgba(40, 167, 69, 0.5);
}
</style> 