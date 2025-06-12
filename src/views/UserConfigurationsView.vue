<template>
  <div class="user-configurations">
    <h1>Мои конфигурации</h1>
    
    <div v-if="isLoading" class="loading">
      Загрузка конфигураций...
    </div>
    
    <div v-else-if="error" class="error">
      <p>Произошла ошибка при загрузке конфигураций:</p>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="configurations && configurations.length === 0" class="empty-state">
      <p>У вас пока нет сохраненных конфигураций.</p>
      <RouterLink to="/configurator" class="btn-create">Создать конфигурацию</RouterLink>
    </div>
    
    <div v-else class="configurations-list">
      <div 
        v-for="config in configurations" 
        :key="config.id" 
        class="configuration-card"
      >
        <div class="config-header">
          <h2>{{ config.name }}</h2>
          <div class="config-price">{{ formatPrice(config.totalPrice) }} ₽</div>
        </div>
        
        <div class="config-details">
          <div class="config-date">
            Создана: {{ formatDate(config.createdAt) }}
          </div>
          <div 
            class="config-compatibility"
            :class="{ 'compatible': config.isCompatible, 'incompatible': !config.isCompatible }"
          >
            {{ config.isCompatible ? 'Совместима' : 'Несовместима' }}
          </div>
          <div class="config-description" v-if="config.description">
            {{ config.description }}
          </div>
        </div>
        
        <div class="config-actions">
          <button @click="viewDetails(config.id)" class="btn-view">
            Просмотреть детали
          </button>
          <button @click="loadToConfigurator(config.id)" class="btn-load">
            Загрузить в конфигуратор
          </button>
          <button @click="confirmDelete(config.id)" class="btn-delete">
            Удалить
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно с деталями конфигурации -->
    <div v-if="showDetailsModal && currentConfig" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ currentConfig.name || 'Конфигурация' }}</h2>
          <button @click="showDetailsModal = false" class="btn-close">×</button>
        </div>
        
        <div class="modal-content">
          <div class="config-summary">
            <div class="config-price">Общая стоимость: {{ formatPrice(currentConfig.totalPrice || 0) }} ₽</div>
            <div 
              class="config-compatibility"
              :class="{ 'compatible': currentConfig.isCompatible, 'incompatible': !currentConfig.isCompatible }"
            >
              {{ currentConfig.isCompatible ? 'Компоненты совместимы' : 'Компоненты несовместимы' }}
            </div>
          </div>
          
          <h3>Компоненты:</h3>
          <div v-if="currentConfig.components && currentConfig.components.length > 0" class="components-list">
            <div 
              v-for="component in currentConfig.components" 
              :key="component.id"
              class="component-item"
            >
              <div class="component-name">{{ component.productName || 'Неизвестный компонент' }}</div>
              <div class="component-type">{{ translateComponentType(component.type) }}</div>
              <div class="component-price">{{ formatPrice(component.price || 0) }} ₽</div>
            </div>
          </div>
          <div v-else class="no-components">
            Конфигурация не содержит компонентов
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="loadToConfigurator(currentConfig.id)" class="btn-load">
            Загрузить в конфигуратор
          </button>
          <button @click="showDetailsModal = false" class="btn-close-modal">
            Закрыть
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Подтверждение удаления</h2>
          <button @click="showDeleteModal = false" class="btn-close">×</button>
        </div>
        
        <div class="modal-content">
          <p>Вы уверены, что хотите удалить конфигурацию?</p>
          <p>Это действие нельзя отменить.</p>
        </div>
        
        <div class="modal-actions">
          <button @click="deleteConfiguration" class="btn-confirm-delete">
            Удалить
          </button>
          <button @click="showDeleteModal = false" class="btn-cancel">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfiguratorStore } from '@/stores/configurator'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const configuratorStore = useConfiguratorStore()
const authStore = useAuthStore()

// Состояние компонента
const isLoading = ref(false)
const error = ref<string | null>(null)
const showDetailsModal = ref(false)
const showDeleteModal = ref(false)
const configIdToDelete = ref<number | null>(null)

// Получаем конфигурации из хранилища
const configurations = computed(() => configuratorStore.getSavedConfigurations)
const currentConfig = computed(() => configuratorStore.getCurrentConfiguration)

// Загружаем конфигурации при монтировании компонента
onMounted(async () => {
  if (!authStore.getIsAuthenticated) {
    router.push('/login')
    return
  }
  
  isLoading.value = true
  try {
    await configuratorStore.getUserConfigurations()
    error.value = configuratorStore.getError
  } catch (err: any) {
    error.value = err.message || 'Ошибка при загрузке конфигураций'
  } finally {
    isLoading.value = false
  }
})

// Форматирование цены
const formatPrice = (price: number) => {
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

// Форматирование даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Перевод типа компонента
const translateComponentType = (type: string) => {
  console.log('Translating component type:', type)
  
  if (!type) {
    console.warn('Component type is undefined or null')
    return 'Неизвестный компонент'
  }
  
  const translations: Record<string, string> = {
    'CPU': 'Процессор',
    'GPU': 'Видеокарта',
    'RAM': 'Оперативная память',
    'MB': 'Материнская плата',
    'MOTHERBOARD': 'Материнская плата',
    'STORAGE': 'Хранилище',
    'PSU': 'Блок питания',
    'CASE': 'Корпус',
    'COOLER': 'Охлаждение'
  }
  
  const result = translations[type] || type
  console.log('Translated to:', result)
  return result
}

// Просмотр деталей конфигурации
const viewDetails = async (configId: number) => {
  isLoading.value = true
  try {
    await configuratorStore.getConfigurationDetails(configId)
    showDetailsModal.value = true
  } catch (err: any) {
    error.value = err.message || 'Ошибка при загрузке деталей конфигурации'
  } finally {
    isLoading.value = false
  }
}

// Загрузка конфигурации в конфигуратор
const loadToConfigurator = async (configId?: number) => {
  if (!configId) return
  
  isLoading.value = true
  try {
    const result = await configuratorStore.loadConfigurationToConfigurator(configId)
    if (result) {
      showDetailsModal.value = false
      router.push('/configurator')
    } else {
      error.value = configuratorStore.getError || 'Ошибка при загрузке конфигурации'
    }
  } catch (err: any) {
    error.value = err.message || 'Ошибка при загрузке конфигурации'
  } finally {
    isLoading.value = false
  }
}

// Подтверждение удаления
const confirmDelete = (configId: number) => {
  configIdToDelete.value = configId
  showDeleteModal.value = true
}

// Удаление конфигурации
const deleteConfiguration = async () => {
  if (!configIdToDelete.value) return
  
  isLoading.value = true
  try {
    await configuratorStore.deleteConfiguration(configIdToDelete.value)
    showDeleteModal.value = false
  } catch (err: any) {
    error.value = err.message || 'Ошибка при удалении конфигурации'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.user-configurations {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.error {
  color: #721c24;
  background-color: #f8d7da;
}

.btn-create {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.configurations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.configuration-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.config-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.config-price {
  font-weight: bold;
  font-size: 1.1rem;
}

.config-details {
  margin-bottom: 1.5rem;
}

.config-date {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.config-compatibility {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.config-compatibility.compatible {
  background-color: #d4edda;
  color: #155724;
}

.config-compatibility.incompatible {
  background-color: #f8d7da;
  color: #721c24;
}

.config-description {
  font-size: 0.9rem;
  color: #333;
  margin-top: 0.5rem;
}

.config-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.config-actions button {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;
}

.btn-view {
  background-color: #f39c12;
  color: white;
}

.btn-load {
  background-color: #3498db;
  color: white;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-content {
  padding: 1.5rem;
}

.config-summary {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.components-list {
  display: grid;
  gap: 1rem;
}

.component-item {
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.component-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.component-type {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  gap: 1rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-cancel, .btn-close-modal {
  background-color: #f1f1f1;
  border: 1px solid #ddd;
}

@media (max-width: 768px) {
  .configurations-list {
    grid-template-columns: 1fr;
  }
  
  .config-actions {
    flex-direction: column;
  }
}
</style> 