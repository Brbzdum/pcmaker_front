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
            
            <div v-if="orderStore.isLoading" class="loading-indicator">
              Загрузка заказов...
            </div>
            
            <div v-else-if="orderStore.error" class="error-message">
              {{ orderStore.error }}
            </div>
            
            <div v-else-if="orders.length > 0" class="orders-list">
              <OrderCard 
                v-for="order in orders" 
                :key="order.id"
                :order="order"
              />
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
                    v-for="(componentId, index) in config.components.slice(0, 3)" 
                    :key="`${config.id}-${componentId}-${index}`"
                    class="config-component"
                  >
                    <div class="component-name-placeholder" v-if="!componentNameCache[componentId]">
                      Загрузка...
                    </div>
                    <div v-else>
                      {{ componentNameCache[componentId] }}
                    </div>
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
import { useOrderStore } from '@/stores/order'
import apiClient from '@/api/apiClient'
import { components } from '@/api/mockData'
import OrderCard from '@/components/OrderCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const configuratorStore = useConfiguratorStore()
const orderStore = useOrderStore()

const activeTab = ref('orders')
const isLoading = ref(true)
const error = ref('')
const isUpdating = ref(false)

// Типы для пользовательских данных
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  productId: number;
  productName?: string;
  productPrice?: number;
}

interface Order {
  id: number;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Configuration {
  id: number;
  name: string;
  date: string;
  components: number[];
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  savedConfigurations: Configuration[];
}

// Пользовательские данные
const user = ref<UserProfile>({
  id: 0,
  username: '',
  email: '',
  savedConfigurations: []
})

// Получаем заказы из хранилища
const orders = computed(() => {
  return orderStore.orders
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

// Кэш для имен компонентов
const componentNameCache = ref<Record<number, string>>({});

onMounted(async () => {
  if (authStore.getIsAuthenticated) {
    isLoading.value = true
    await fetchUserProfile()
    await orderStore.fetchOrders()
    isLoading.value = false
  }
})

// Получение данных профиля
const fetchUserProfile = async () => {
  error.value = ''
  
  try {
    const userData = await authStore.fetchUserProfile()
    if (userData) {
      user.value = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        savedConfigurations: [] // Инициализируем пустым массивом
      }
      
      // Заполняем форму профиля
      profileForm.value.username = userData.username
      profileForm.value.email = userData.email
      
      // Загружаем сохраненные конфигурации пользователя
      await fetchUserConfigurations()
    }
  } catch (err: any) {
    error.value = err.message || 'Ошибка при загрузке данных профиля'
  }
}

// Предзагрузка имен компонентов для всех конфигураций
const preloadComponentNames = async () => {
  if (!user.value.savedConfigurations || user.value.savedConfigurations.length === 0) {
    return;
  }
  
  // Собираем все уникальные ID компонентов
  const componentIds = new Set<number>();
  user.value.savedConfigurations.forEach(config => {
    config.components.forEach((id: number) => {
      componentIds.add(id);
    });
  });
  
  // Загружаем имена компонентов
  const promises = Array.from(componentIds).map(id => getComponentName(id));
  await Promise.all(promises);
}

// Обновляем fetchUserConfigurations
const fetchUserConfigurations = async () => {
  try {
    const configs = await configuratorStore.getUserConfigurations()
    if (configs && Array.isArray(configs)) {
      // Преобразуем конфигурации в нужный формат
      user.value.savedConfigurations = configs.map(config => ({
        id: config.id,
        name: config.name || `Конфигурация #${config.id}`,
        date: formatDate(config.createdAt),
        components: config.components ? config.components.map((comp: any) => comp.productId || comp.id) : []
      }))
      
      // Предзагружаем имена компонентов
      await preloadComponentNames();
    }
  } catch (err) {
    console.error('Ошибка при загрузке конфигураций:', err)
  }
}

// Форматирование даты
const formatDate = (dateString: string) => {
  // Если дата пустая, возвращаем заглушку
  if (!dateString) {
    return 'Дата не указана';
  }
  
  try {
    // Пробуем напрямую преобразовать строку в объект Date
    let date = new Date(dateString);
    
    // Проверяем валидность даты
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Если не получилось, пробуем разные форматы
    
    // Проверяем формат ISO с Z в конце (UTC)
    if (dateString.includes('T') && dateString.includes('Z')) {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Проверяем формат ISO без Z (локальное время)
    if (dateString.includes('T')) {
      return new Date(dateString + 'Z').toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Проверяем формат dd.MM.yyyy
    if (dateString.includes('.') && dateString.split('.').length === 3) {
      const parts = dateString.split('.');
      const newDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(newDate.getTime())) {
        return newDate.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }
    
    // Если ничего не помогло, возвращаем дату как есть
    return dateString;
  } catch (error) {
    console.error('Ошибка при форматировании даты:', error);
    return 'Ошибка даты';
  }
}

// Перевод статуса заказа
const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDING': 'Обрабатывается',
    'PROCESSING': 'В обработке',
    'SHIPPED': 'Отправлен',
    'DELIVERED': 'Доставлен',
    'CANCELLED': 'Отменен',
    'COMPLETED': 'Выполнен'
  };
  
  return statusMap[status] || status;
}

// Обновление профиля
const updateProfile = async () => {
  if (passwordError.value) return
  
  isUpdating.value = true
  
  try {
    // Отправляем запрос на обновление профиля
    const updateData = {
      username: profileForm.value.username,
      email: profileForm.value.email
    }
    
    if (profileForm.value.newPassword) {
      updateData.currentPassword = profileForm.value.currentPassword
      updateData.newPassword = profileForm.value.newPassword
    }
    
    await apiClient.put('/users/profile', updateData)
    
    // Обновляем локальные данные
    user.value.username = profileForm.value.username
    user.value.email = profileForm.value.email
    
    // Очищаем поля пароля
    profileForm.value.currentPassword = ''
    profileForm.value.newPassword = ''
    profileForm.value.confirmPassword = ''
    
    alert('Профиль успешно обновлен')
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка при обновлении профиля')
  } finally {
    isUpdating.value = false
  }
}

// Выход из аккаунта
const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Получение имени компонента по ID
const getComponentName = async (componentId: number) => {
  // Проверяем кэш
  if (componentNameCache.value[componentId]) {
    return componentNameCache.value[componentId];
  }
  
  try {
    // Загружаем информацию о компоненте
    const component = await configuratorStore.fetchProductById(componentId);
    if (component) {
      // Сохраняем в кэш и возвращаем
      componentNameCache.value[componentId] = component.name;
      return component.name;
    }
  } catch (error) {
    console.error('Ошибка при получении информации о компоненте:', error);
  }
  
  // Если не удалось получить имя, возвращаем заглушку
  return 'Компонент #' + componentId;
}

// Загрузка конфигурации в конфигуратор
const loadConfiguration = (config: Configuration) => {
  // Загружаем конфигурацию по её ID
  configuratorStore.loadConfigurationToConfigurator(config.id)
    .then(() => {
      // Переходим в конфигуратор
      router.push('/configurator');
    })
    .catch(error => {
      console.error('Ошибка при загрузке конфигурации:', error);
      alert('Не удалось загрузить конфигурацию. Попробуйте позже.');
    });
}

// Получение класса для статуса заказа
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Выполнен':
    case 'COMPLETED':
    case 'DELIVERED':
      return 'status-completed'
    case 'Обрабатывается':
    case 'PROCESSING':
    case 'PENDING':
    case 'SHIPPED':
      return 'status-processing'
    case 'Отменен':
    case 'CANCELLED':
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
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.user-info h2 {
  margin: 0.5rem 0;
  font-size: 1.5rem;
}

.user-info p {
  margin: 0.5rem 0;
  color: #666;
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

.component-name-placeholder {
  color: #999;
  font-style: italic;
}

.config-component {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 0.9rem;
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

.loading-indicator {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
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