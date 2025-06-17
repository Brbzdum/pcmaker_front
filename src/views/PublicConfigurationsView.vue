<template>
  <div class="public-configurations">
    <h1>Готовые конфигурации</h1>
    
    <div class="filters">
      <div class="filter-group">
        <label for="category-filter">Категория:</label>
        <select id="category-filter" v-model="selectedCategory">
          <option value="">Все категории</option>
          <option value="BUDGET">Бюджетная</option>
          <option value="GAMING">Игровая</option>
          <option value="OFFICE">Офисная</option>
          <option value="WORKSTATION">Рабочая станция</option>
          <option value="STREAMING">Стриминг</option>
          <option value="DESIGN">Дизайн</option>
          <option value="CUSTOM">Другое</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="sort-by">Сортировать по:</label>
        <select id="sort-by" v-model="sortBy">
          <option value="price_asc">Цена (по возрастанию)</option>
          <option value="price_desc">Цена (по убыванию)</option>
          <option value="name_asc">Название (А-Я)</option>
          <option value="name_desc">Название (Я-А)</option>
        </select>
      </div>

      <!-- Кнопка сравнения конфигураций -->
      <div class="compare-actions" v-if="selectedConfigurations.length > 0">
        <span class="selected-count">Выбрано: {{ selectedConfigurations.length }}</span>
        <button 
          @click="compareConfigurations" 
          class="btn-compare"
          :disabled="selectedConfigurations.length < 2"
        >
          Сравнить выбранное
        </button>
        <button @click="clearSelection" class="btn-clear-selection">
          Очистить выбор
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading">
      Загрузка конфигураций...
    </div>
    
    <div v-else-if="error" class="error">
      <p>Произошла ошибка при загрузке конфигураций:</p>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!filteredConfigurations || filteredConfigurations.length === 0" class="empty-state">
      <p>Готовые конфигурации пока не добавлены.</p>
    </div>
    
    <div v-else class="configurations-list">
      <div 
        v-for="config in filteredConfigurations" 
        :key="config.id" 
        class="configuration-card"
        :class="{ 'selected': isConfigurationSelected(config.id) }"
      >
        <!-- Чекбокс для выбора конфигурации -->
        <div class="config-select">
          <input 
            type="checkbox" 
            :id="`config-${config.id}`" 
            :checked="isConfigurationSelected(config.id)"
            @change="toggleConfigurationSelection(config.id)"
          />
          <label :for="`config-${config.id}`"></label>
        </div>

        <div class="config-header">
          <h2>{{ config.name }}</h2>
          <div class="config-price">{{ formatPrice(config.totalPrice) }} ₽</div>
        </div>
        
        <div class="config-details">
          <div class="config-date" v-if="config.createdAt">
            Создана: {{ formatDate(config.createdAt) }}
          </div>
          <div class="config-category" v-if="config.category">
            Категория: {{ translateCategory(config.category) }}
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
            <div class="config-category" v-if="currentConfig.category">
              Категория: {{ translateCategory(currentConfig.category) }}
            </div>
            <div class="config-date" v-if="currentConfig.createdAt">
              Создана: {{ formatDateWithTime(currentConfig.createdAt) }}
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
              <div class="component-manufacturer">{{ component.manufacturerName || 'Неизвестный производитель' }}</div>
              <div class="component-type">{{ translateComponentType(component.type) }}</div>
              <div class="component-price">{{ formatPrice(component.price || 0) }} ₽</div>
            </div>
          </div>
          <div v-else class="no-components">
            Конфигурация не содержит компонентов
          </div>
          
          <div class="config-description" v-if="currentConfig.description">
            <h3>Описание:</h3>
            <p>{{ currentConfig.description }}</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfiguratorStore } from '@/stores/configurator'
import { formatDate, formatDateWithTime } from '@/utils/dateUtils'
import apiClient from '@/api/apiClient'
import { formatPrice } from '@/utils/priceUtils'

const router = useRouter()
const configuratorStore = useConfiguratorStore()

// Состояние компонента
const isLoading = ref(false)
const error = ref<string | null>(null)
const showDetailsModal = ref(false)
const publicConfigurations = ref<any[]>([])
const currentConfig = ref<any>(null)
const selectedCategory = ref('')
const sortBy = ref('')
const selectedConfigurations = ref<number[]>([])

// Загружаем публичные конфигурации при монтировании компонента
onMounted(async () => {
  await loadPublicConfigurations()
})

// Загрузка публичных конфигураций
const loadPublicConfigurations = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await apiClient.get('/configurations/public')
    console.log('Raw public configurations data:', response.data)
    
    // Проверяем наличие дат в каждой конфигурации
    publicConfigurations.value = response.data.map((config: any) => {
      console.log(`Configuration ${config.id} date:`, config.createdAt)
      
      // Если дата не указана или пустая, добавляем текущую дату
      if (!config.createdAt) {
        console.warn(`Configuration ${config.id} has no date, using current date`)
        config.createdAt = new Date().toISOString()
      }
      
      return config
    })
  } catch (err: any) {
    console.error('Error loading public configurations:', err)
    error.value = err.response?.data?.message || 'Ошибка при загрузке публичных конфигураций'
  } finally {
    isLoading.value = false
  }
}

// Перевод типа компонента
const translateComponentType = (type: string) => {
  if (!type) {
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
  
  return translations[type] || type
}

// Просмотр деталей конфигурации
const viewDetails = async (configId: number) => {
  isLoading.value = true
  try {
    const response = await apiClient.get(`/configurations/${configId}`)
    currentConfig.value = response.data
    showDetailsModal.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка при загрузке деталей конфигурации'
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

// Вычисляемое свойство для фильтрации и сортировки конфигураций
const filteredConfigurations = computed(() => {
  // Фильтрация по категории
  let filtered = [...publicConfigurations.value];
  
  if (selectedCategory.value) {
    filtered = filtered.filter(config => config.category === selectedCategory.value);
  }
  
  // Сортировка
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'price_asc':
          return (a.totalPrice || 0) - (b.totalPrice || 0);
        case 'price_desc':
          return (b.totalPrice || 0) - (a.totalPrice || 0);
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });
  }
  
  return filtered;
});

// Перевод категории
const translateCategory = (category: string) => {
  const translations: Record<string, string> = {
    'BUDGET': 'Бюджетная',
    'GAMING': 'Игровая',
    'OFFICE': 'Офисная',
    'WORKSTATION': 'Рабочая станция',
    'STREAMING': 'Стриминг',
    'DESIGN': 'Дизайн',
    'CUSTOM': 'Другое'
  }
  
  return translations[category] || category
}

// Методы для работы с выбором конфигураций для сравнения
const isConfigurationSelected = (configId: number) => {
  return selectedConfigurations.value.includes(configId)
}

const toggleConfigurationSelection = (configId: number) => {
  const index = selectedConfigurations.value.indexOf(configId)
  if (index === -1) {
    // Если не выбрана, добавляем
    selectedConfigurations.value.push(configId)
  } else {
    // Если выбрана, убираем
    selectedConfigurations.value.splice(index, 1)
  }
}

const clearSelection = () => {
  selectedConfigurations.value = []
}

const compareConfigurations = () => {
  if (selectedConfigurations.value.length < 2) {
    // Требуется минимум 2 конфигурации для сравнения
    return
  }
  
  // Переходим на страницу сравнения с выбранными ID
  router.push({
    path: '/compare-configurations',
    query: { ids: selectedConfigurations.value }
  })
}
</script>

<style scoped>
.public-configurations {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-right: 10px;
}

.filter-group select {
  padding: 0.5rem;
}

.compare-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 10px;
}

.selected-count {
  font-weight: 500;
}

.btn-compare, .btn-clear-selection {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-compare {
  background-color: #1976d2;
  color: white;
}

.btn-compare:hover:not(:disabled) {
  background-color: #1565c0;
}

.btn-compare:disabled {
  background-color: #bbdefb;
  cursor: not-allowed;
}

.btn-clear-selection {
  background-color: #e0e0e0;
  color: #424242;
}

.btn-clear-selection:hover {
  background-color: #bdbdbd;
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

.configurations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.configuration-card {
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.configuration-card.selected {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.config-select {
  position: absolute;
  top: 15px;
  right: 15px;
}

.config-select input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
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
  font-size: 0.9rem;
  color: var(--text-light-color, #666);
  margin-bottom: 0.5rem;
}

.config-category {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  background-color: #e9ecef;
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.config-compatibility {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
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

.component-manufacturer {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
  font-style: italic;
}

.component-type {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.component-price {
  font-weight: bold;
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

.btn-close-modal {
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