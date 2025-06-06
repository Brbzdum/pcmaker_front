<template>
  <div class="profile">
    <h1>Личный кабинет</h1>
    
    <div v-if="authStore.getIsAuthenticated">
      <div v-if="isLoading" class="loading">
        Загрузка данных профиля...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else class="profile-content">
        <div class="profile-sidebar">
          <div class="user-info">
            <div class="user-avatar">
              <img src="https://via.placeholder.com/100" alt="Аватар пользователя">
            </div>
            <h2>{{ user.username }}</h2>
            <p>{{ user.email }}</p>
          </div>
          
          <div class="profile-nav">
            <button 
              @click="activeTab = 'orders'"
              class="tab-btn"
              :class="{ active: activeTab === 'orders' }"
            >
              Мои заказы
            </button>
            <button 
              @click="activeTab = 'configurations'"
              class="tab-btn"
              :class="{ active: activeTab === 'configurations' }"
            >
              Сохраненные конфигурации
            </button>
            <button 
              @click="activeTab = 'settings'"
              class="tab-btn"
              :class="{ active: activeTab === 'settings' }"
            >
              Настройки аккаунта
            </button>
          </div>
          
          <button @click="logout" class="btn-logout">
            Выйти из аккаунта
          </button>
        </div>
        
        <div class="profile-main">
          <!-- Вкладка с заказами -->
          <div v-if="activeTab === 'orders'" class="tab-content">
            <h2>Мои заказы</h2>
            
            <div v-if="user.orders && user.orders.length > 0" class="orders-list">
              <div 
                v-for="order in user.orders" 
                :key="order.id"
                class="order-card"
              >
                <div class="order-header">
                  <div class="order-info">
                    <div class="order-number">Заказ #{{ order.id }}</div>
                    <div class="order-date">{{ order.date }}</div>
                  </div>
                  <div class="order-status" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </div>
                </div>
                
                <div class="order-items">
                  <div 
                    v-for="(item, index) in order.items" 
                    :key="index"
                    class="order-item"
                  >
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-details">
                      <span>{{ item.quantity }} × ${{ item.price.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="order-footer">
                  <div class="order-total">
                    <span>Итого:</span>
                    <span>${{ order.total.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <p>У вас пока нет заказов.</p>
              <RouterLink to="/catalog" class="btn-shop">
                Перейти в каталог
              </RouterLink>
            </div>
          </div>
          
          <!-- Вкладка с сохраненными конфигурациями -->
          <div v-else-if="activeTab === 'configurations'" class="tab-content">
            <h2>Сохраненные конфигурации</h2>
            
            <div v-if="user.savedConfigurations && user.savedConfigurations.length > 0" class="configs-list">
              <div 
                v-for="config in user.savedConfigurations" 
                :key="config.id"
                class="config-card"
              >
                <div class="config-header">
                  <h3>{{ config.name }}</h3>
                  <div class="config-date">{{ config.date }}</div>
                </div>
                
                <div class="config-components">
                  <div 
                    v-for="componentId in config.components.slice(0, 3)" 
                    :key="componentId"
                    class="config-component"
                  >
                    {{ getComponentName(componentId) }}
                  </div>
                  
                  <div v-if="config.components.length > 3" class="config-more">
                    И еще {{ config.components.length - 3 }} компонент(ов)
                  </div>
                </div>
                
                <div class="config-actions">
                  <button 
                    @click="loadConfiguration(config)" 
                    class="btn-load"
                  >
                    Загрузить в конфигуратор
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <p>У вас пока нет сохраненных конфигураций.</p>
              <RouterLink to="/configurator" class="btn-config">
                Перейти в конфигуратор
              </RouterLink>
            </div>
          </div>
          
          <!-- Вкладка с настройками аккаунта -->
          <div v-else-if="activeTab === 'settings'" class="tab-content">
            <h2>Настройки аккаунта</h2>
            
            <form @submit.prevent="updateProfile" class="settings-form">
              <div class="form-group">
                <label for="username">Имя пользователя</label>
                <input 
                  type="text" 
                  id="username" 
                  v-model="profileForm.username" 
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="profileForm.email" 
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="current-password">Текущий пароль</label>
                <input 
                  type="password" 
                  id="current-password" 
                  v-model="profileForm.currentPassword"
                >
              </div>
              
              <div class="form-group">
                <label for="new-password">Новый пароль (оставьте пустым, если не хотите менять)</label>
                <input 
                  type="password" 
                  id="new-password" 
                  v-model="profileForm.newPassword"
                >
              </div>
              
              <div class="form-group">
                <label for="confirm-password">Подтвердите новый пароль</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  v-model="profileForm.confirmPassword"
                >
                <div v-if="passwordError" class="validation-error">
                  {{ passwordError }}
                </div>
              </div>
              
              <button 
                type="submit" 
                class="btn-save"
                :disabled="isUpdating"
              >
                {{ isUpdating ? 'Сохранение...' : 'Сохранить изменения' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="login-required">
      <p>Пожалуйста, войдите в аккаунт для просмотра профиля.</p>
      <RouterLink to="/login" class="btn-login">Войти</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfiguratorStore } from '@/stores/configurator'
import { components } from '@/api/mockData'

const router = useRouter()
const authStore = useAuthStore()
const configuratorStore = useConfiguratorStore()

const activeTab = ref('orders')
const isLoading = ref(true)
const error = ref('')
const isUpdating = ref(false)

// Пользовательские данные
const user = ref({
  id: 0,
  username: '',
  email: '',
  orders: [],
  savedConfigurations: []
})

// Форма редактирования профиля
const profileForm = ref({
  username: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Ошибка подтверждения пароля
const passwordError = computed(() => {
  if (profileForm.value.newPassword && 
      profileForm.value.newPassword !== profileForm.value.confirmPassword) {
    return 'Пароли не совпадают'
  }
  return ''
})

onMounted(async () => {
  if (authStore.getIsAuthenticated) {
    await fetchUserProfile()
  }
})

// Получение данных профиля
const fetchUserProfile = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const userData = await authStore.fetchUserProfile()
    if (userData) {
      user.value = userData
      
      // Заполняем форму профиля
      profileForm.value.username = userData.username
      profileForm.value.email = userData.email
    }
  } catch (err: any) {
    error.value = err.message || 'Ошибка при загрузке данных профиля'
  } finally {
    isLoading.value = false
  }
}

// Обновление профиля
const updateProfile = async () => {
  if (passwordError.value) return
  
  isUpdating.value = true
  
  // В реальном приложении здесь был бы запрос к API
  // Сейчас просто имитируем успешное обновление
  setTimeout(() => {
    user.value.username = profileForm.value.username
    user.value.email = profileForm.value.email
    
    profileForm.value.currentPassword = ''
    profileForm.value.newPassword = ''
    profileForm.value.confirmPassword = ''
    
    isUpdating.value = false
    
    alert('Профиль успешно обновлен')
  }, 800)
}

// Выход из аккаунта
const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Получение имени компонента по ID
const getComponentName = (componentId: number) => {
  const component = components.find(c => c.id === componentId)
  return component ? component.name : 'Неизвестный компонент'
}

// Загрузка конфигурации в конфигуратор
const loadConfiguration = (config: any) => {
  // Очищаем текущую конфигурацию
  configuratorStore.resetConfiguration()
  
  // Добавляем компоненты из сохраненной конфигурации
  config.components.forEach((componentId: number) => {
    const component = components.find(c => c.id === componentId)
    if (component) {
      configuratorStore.selectComponent(component.type, component)
    }
  })
  
  // Переходим в конфигуратор
  router.push('/configurator')
}

// Получение класса для статуса заказа
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Выполнен':
      return 'status-completed'
    case 'Обрабатывается':
      return 'status-processing'
    case 'Отменен':
      return 'status-cancelled'
    default:
      return ''
  }
}
</script>

<style scoped>
.profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.profile-content {
  display: flex;
  gap: 2rem;
}

.profile-sidebar {
  flex: 1;
  max-width: 300px;
}

.profile-main {
  flex: 3;
}

.user-info {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
}

.user-avatar {
  margin-bottom: 1rem;
}

.user-avatar img {
  border-radius: 50%;
  width: 100px;
  height: 100px;
}

.user-info h2 {
  margin: 0 0 0.5rem 0;
}

.user-info p {
  color: #666;
  margin: 0;
}

.profile-nav {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.tab-btn {
  display: block;
  width: 100%;
  padding: 1rem;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tab-btn:last-child {
  border-bottom: none;
}

.tab-btn.active {
  background-color: #f8f9fa;
  font-weight: bold;
  border-left: 3px solid #3498db;
}

.tab-btn:hover:not(.active) {
  background-color: #f5f5f5;
}

.btn-logout {
  width: 100%;
  padding: 0.75rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background-color: #c0392b;
}

.tab-content {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tab-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

/* Стили для заказов */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.order-number {
  font-weight: bold;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.order-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-processing {
  background-color: #fff3cd;
  color: #856404;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-items {
  padding: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.order-footer {
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
}

.order-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

/* Стили для конфигураций */
.configs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.config-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.config-header {
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.config-header h3 {
  margin: 0 0 0.5rem 0;
}

.config-date {
  color: #666;
  font-size: 0.9rem;
}

.config-components {
  padding: 1rem;
}

.config-component {
  margin-bottom: 0.5rem;
}

.config-more {
  color: #666;
  font-style: italic;
  margin-top: 0.5rem;
}

.config-actions {
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
}

.btn-load {
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-load:hover {
  background-color: #2980b9;
}

/* Форма настроек */
.settings-form {
  max-width: 600px;
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

.validation-error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.btn-save {
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

.btn-save:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Состояния */
.loading,
.error,
.empty-state,
.login-required {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.error {
  color: #e74c3c;
}

.btn-shop,
.btn-config,
.btn-login {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-shop:hover,
.btn-config:hover,
.btn-login:hover {
  background-color: #2980b9;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }
  
  .profile-sidebar {
    max-width: 100%;
  }
  
  .configs-list {
    grid-template-columns: 1fr;
  }
}
</style> 