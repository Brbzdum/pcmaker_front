<template>
  <div class="compare-configurations">
    <h1>Сравнение конфигураций</h1>

    <div v-if="isLoading" class="loading">
      Загрузка конфигураций...
    </div>

    <div v-else-if="error" class="error">
      <p>Произошла ошибка при загрузке конфигураций:</p>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="!configurationsToCompare.length" class="empty-state">
      <p>Выберите конфигурации для сравнения.</p>
      <RouterLink to="/user-configurations" class="btn-select">Выбрать конфигурации</RouterLink>
    </div>

    <div v-else class="comparison-container">
      <!-- Заголовки конфигураций -->
      <div class="comparison-header">
        <div class="component-label">Компонент</div>
        <div 
          v-for="config in configurationsToCompare" 
          :key="config.id" 
          class="config-column"
        >
          <div class="config-title">{{ config.name }}</div>
          <div class="config-price">{{ formatPrice(config.totalPrice) }} ₽</div>
          <div 
            class="config-compatibility"
            :class="{ 'compatible': config.isCompatible, 'incompatible': !config.isCompatible }"
          >
            {{ config.isCompatible ? 'Совместима' : 'Несовместима' }}
          </div>
          <button @click="removeFromComparison(config.id)" class="btn-remove">
            Убрать из сравнения
          </button>
        </div>
      </div>

      <!-- Основные характеристики -->
      <div class="comparison-section">
        <h3>Основные характеристики</h3>
        <div class="comparison-row">
          <div class="component-label">Категория</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            {{ translateCategory(config.category) || 'Не указана' }}
          </div>
        </div>
        <div class="comparison-row">
          <div class="component-label">Производительность</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            {{ config.totalPerformance ? `${config.totalPerformance} баллов` : 'Не указана' }}
          </div>
        </div>
      </div>

      <!-- Сравнение по компонентам -->
      <div class="comparison-section">
        <h3>Компоненты</h3>
        
        <!-- Процессор -->
        <div class="comparison-row">
          <div class="component-label">Процессор</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            <template v-if="getCpuFromConfig(config)">
              <div class="component-name">{{ getCpuFromConfig(config).productName }}</div>
              <div class="component-specs">
                <div v-if="getCpuFromConfig(config).specs.cores">Ядра: {{ getCpuFromConfig(config).specs.cores }}</div>
                <div v-if="getCpuFromConfig(config).specs.frequency">Частота: {{ getCpuFromConfig(config).specs.frequency }} ГГц</div>
              </div>
              <div class="component-price">{{ formatPrice(getCpuFromConfig(config).price) }} ₽</div>
            </template>
            <div v-else class="component-missing">Не выбран</div>
          </div>
        </div>
        
        <!-- Видеокарта -->
        <div class="comparison-row">
          <div class="component-label">Видеокарта</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            <template v-if="getGpuFromConfig(config)">
              <div class="component-name">{{ getGpuFromConfig(config).productName }}</div>
              <div class="component-specs">
                <div v-if="getGpuFromConfig(config).specs.memory">Память: {{ getGpuFromConfig(config).specs.memory }} ГБ</div>
                <div v-if="getGpuFromConfig(config).specs.core_clock">Частота: {{ getGpuFromConfig(config).specs.core_clock }} МГц</div>
              </div>
              <div class="component-price">{{ formatPrice(getGpuFromConfig(config).price) }} ₽</div>
            </template>
            <div v-else class="component-missing">Не выбрана</div>
          </div>
        </div>
        
        <!-- Материнская плата -->
        <div class="comparison-row">
          <div class="component-label">Материнская плата</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            <template v-if="getMotherboardFromConfig(config)">
              <div class="component-name">{{ getMotherboardFromConfig(config).productName }}</div>
              <div class="component-specs">
                <div v-if="getMotherboardFromConfig(config).specs.socket">Сокет: {{ getMotherboardFromConfig(config).specs.socket }}</div>
                <div v-if="getMotherboardFromConfig(config).specs.form_factor">Форм-фактор: {{ getMotherboardFromConfig(config).specs.form_factor }}</div>
              </div>
              <div class="component-price">{{ formatPrice(getMotherboardFromConfig(config).price) }} ₽</div>
            </template>
            <div v-else class="component-missing">Не выбрана</div>
          </div>
        </div>
        
        <!-- Оперативная память -->
        <div class="comparison-row">
          <div class="component-label">Оперативная память</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            <template v-if="getRamFromConfig(config).length > 0">
              <div v-for="ram in getRamFromConfig(config)" :key="ram.id" class="component-item">
                <div class="component-name">{{ ram.productName }}</div>
                <div class="component-specs">
                  <div v-if="ram.specs.capacity">Объем: {{ ram.specs.capacity }} ГБ</div>
                  <div v-if="ram.specs.frequency">Частота: {{ ram.specs.frequency }} МГц</div>
                </div>
                <div class="component-price">{{ formatPrice(ram.price) }} ₽</div>
              </div>
              <div class="total-ram">
                Всего: {{ getTotalRamCapacity(config) }}
              </div>
            </template>
            <div v-else class="component-missing">Не выбрана</div>
          </div>
        </div>
        
        <!-- Накопители -->
        <div class="comparison-row">
          <div class="component-label">Накопители</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            <template v-if="getStorageFromConfig(config).length > 0">
              <div v-for="storage in getStorageFromConfig(config)" :key="storage.id" class="component-item">
                <div class="component-name">{{ storage.productName }}</div>
                <div class="component-specs">
                  <div v-if="storage.specs.capacity">Объем: {{ storage.specs.capacity }} ГБ</div>
                  <div v-if="storage.specs.type">Тип: {{ storage.specs.type }}</div>
                </div>
                <div class="component-price">{{ formatPrice(storage.price) }} ₽</div>
              </div>
              <div class="total-storage">
                Всего: {{ getTotalStorageCapacity(config) }}
              </div>
            </template>
            <div v-else class="component-missing">Не выбраны</div>
          </div>
        </div>
        
        <!-- Блок питания -->
        <div class="comparison-row">
          <div class="component-label">Блок питания</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            <template v-if="getPsuFromConfig(config)">
              <div class="component-name">{{ getPsuFromConfig(config).productName }}</div>
              <div class="component-specs">
                <div v-if="getPsuFromConfig(config).specs.wattage">Мощность: {{ getPsuFromConfig(config).specs.wattage }} Вт</div>
                <div v-if="getPsuFromConfig(config).specs.efficiency">Сертификат: {{ getPsuFromConfig(config).specs.efficiency }}</div>
              </div>
              <div class="component-price">{{ formatPrice(getPsuFromConfig(config).price) }} ₽</div>
            </template>
            <div v-else class="component-missing">Не выбран</div>
          </div>
        </div>
        
        <!-- Корпус -->
        <div class="comparison-row">
          <div class="component-label">Корпус</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            <template v-if="getCaseFromConfig(config)">
              <div class="component-name">{{ getCaseFromConfig(config).productName }}</div>
              <div class="component-specs">
                <div v-if="getCaseFromConfig(config).specs.form_factor">Форм-фактор: {{ getCaseFromConfig(config).specs.form_factor }}</div>
                <div v-if="getCaseFromConfig(config).specs.type">Тип: {{ getCaseFromConfig(config).specs.type }}</div>
              </div>
              <div class="component-price">{{ formatPrice(getCaseFromConfig(config).price) }} ₽</div>
            </template>
            <div v-else class="component-missing">Не выбран</div>
          </div>
        </div>
        
        <!-- Охлаждение -->
        <div class="comparison-row">
          <div class="component-label">Охлаждение</div>
          <div 
            v-for="config in configurationsToCompare" 
            :key="config.id" 
            class="config-column"
          >
            <template v-if="getCoolerFromConfig(config)">
              <div class="component-name">{{ getCoolerFromConfig(config).productName }}</div>
              <div class="component-specs">
                <div v-if="getCoolerFromConfig(config).specs.type">Тип: {{ getCoolerFromConfig(config).specs.type }}</div>
                <div v-if="getCoolerFromConfig(config).specs.tdp">TDP: {{ getCoolerFromConfig(config).specs.tdp }} Вт</div>
              </div>
              <div class="component-price">{{ formatPrice(getCoolerFromConfig(config).price) }} ₽</div>
            </template>
            <div v-else class="component-missing">Не выбрано</div>
          </div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="comparison-actions">
        <RouterLink to="/user-configurations" class="btn-back">
          Вернуться к списку конфигураций
        </RouterLink>
        <button @click="clearComparison" class="btn-clear">
          Очистить сравнение
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfiguratorStore } from '@/stores/configurator'
import { formatPrice } from '@/utils/priceUtils'

const router = useRouter()
const route = useRoute()
const configuratorStore = useConfiguratorStore()

// Состояние компонента
const isLoading = ref(false)
const error = ref<string | null>(null)
const configurationsToCompare = ref<any[]>([])

// Получение конфигураций для сравнения из параметров URL
onMounted(async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // Получаем ID конфигураций из параметров URL
    const configIds = route.query.ids
    
    if (configIds) {
      const ids = Array.isArray(configIds) 
        ? configIds.map(id => parseInt(id as string, 10))
        : [parseInt(configIds as string, 10)]
      
      // Загружаем детали каждой конфигурации
      const configPromises = ids.map(id => configuratorStore.getConfigurationDetails(id))
      const configs = await Promise.all(configPromises)
      
      // Фильтруем успешно загруженные конфигурации
      configurationsToCompare.value = configs.filter(config => config !== null)
    }
  } catch (err) {
    console.error('Error loading configurations for comparison:', err)
    error.value = 'Не удалось загрузить конфигурации для сравнения'
  } finally {
    isLoading.value = false
  }
})

// Методы для работы с компонентами конфигураций
const getCpuFromConfig = (config: any) => {
  return config.components?.find((c: any) => c.type === 'CPU') || null
}

const getGpuFromConfig = (config: any) => {
  return config.components?.find((c: any) => c.type === 'GPU') || null
}

const getMotherboardFromConfig = (config: any) => {
  return config.components?.find((c: any) => c.type === 'MB') || null
}

const getRamFromConfig = (config: any) => {
  return config.components?.filter((c: any) => c.type === 'RAM') || []
}

const getStorageFromConfig = (config: any) => {
  return config.components?.filter((c: any) => c.type === 'STORAGE') || []
}

const getPsuFromConfig = (config: any) => {
  return config.components?.find((c: any) => c.type === 'PSU') || null
}

const getCaseFromConfig = (config: any) => {
  return config.components?.find((c: any) => c.type === 'CASE') || null
}

const getCoolerFromConfig = (config: any) => {
  return config.components?.find((c: any) => c.type === 'COOLER') || null
}

// Вычисляемые значения для компонентов
const getTotalRamCapacity = (config: any) => {
  const ramModules = getRamFromConfig(config)
  const totalCapacity = ramModules.reduce((total: number, ram: any) => {
    // Убедимся, что capacity - это число
    const capacity = ram.specs?.capacity ? Number(ram.specs.capacity) : 0
    return total + capacity
  }, 0)
  // Преобразуем в число, чтобы избавиться от ведущих нулей
  return `${Number(totalCapacity)} ГБ`
}

const getTotalStorageCapacity = (config: any) => {
  const storageDevices = getStorageFromConfig(config)
  const totalCapacity = storageDevices.reduce((total: number, storage: any) => {
    // Убедимся, что capacity - это число
    const capacity = storage.specs?.capacity ? Number(storage.specs.capacity) : 0
    return total + capacity
  }, 0)
  // Преобразуем в число, чтобы избавиться от ведущих нулей
  return `${Number(totalCapacity)} ГБ`
}

// Методы для работы со сравнением
const removeFromComparison = (configId: number) => {
  configurationsToCompare.value = configurationsToCompare.value.filter(config => config.id !== configId)
  
  // Обновляем URL с новым списком ID
  const newIds = configurationsToCompare.value.map(config => config.id)
  router.replace({ query: { ...route.query, ids: newIds } })
}

const clearComparison = () => {
  configurationsToCompare.value = []
  router.replace({ query: {} })
}

// Вспомогательные функции
const translateCategory = (category: string) => {
  const categories: Record<string, string> = {
    'GAMING': 'Игровая',
    'OFFICE': 'Офисная',
    'WORKSTATION': 'Рабочая станция',
    'BUDGET': 'Бюджетная',
    'STREAMING': 'Стриминг',
    'DESIGN': 'Дизайн',
    'CUSTOM': 'Другое'
  }
  
  return categories[category] || category
}
</script>

<style scoped>
.compare-configurations {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  text-align: center;
}

.loading, .error, .empty-state {
  text-align: center;
  margin: 40px 0;
}

.error {
  color: #e53935;
}

.btn-select, .btn-back, .btn-clear {
  display: inline-block;
  padding: 10px 20px;
  margin: 10px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-select:hover, .btn-back:hover {
  background-color: #1565c0;
}

.btn-clear {
  background-color: #9e9e9e;
}

.btn-clear:hover {
  background-color: #757575;
}

.btn-remove {
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 0.9em;
}

.btn-remove:hover {
  background-color: #d32f2f;
}

.comparison-container {
  overflow-x: auto;
  margin-top: 20px;
}

.comparison-header, .comparison-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.comparison-section {
  margin-bottom: 30px;
}

.comparison-section h3 {
  margin: 20px 0 10px;
  padding-bottom: 5px;
  border-bottom: 2px solid #1976d2;
}

.component-label {
  flex: 0 0 200px;
  padding: 15px;
  font-weight: 500;
  background-color: #f5f5f5;
}

.config-column {
  flex: 1;
  min-width: 250px;
  padding: 15px;
  border-left: 1px solid #e0e0e0;
}

.config-title {
  font-weight: 600;
  font-size: 1.1em;
  margin-bottom: 5px;
}

.config-price {
  font-weight: 500;
  color: #2e7d32;
  margin-bottom: 5px;
}

.config-compatibility {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.compatible {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.incompatible {
  background-color: #ffcdd2;
  color: #c62828;
}

.component-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.component-specs {
  font-size: 0.9em;
  color: #616161;
  margin-bottom: 5px;
}

.component-price {
  font-weight: 500;
  color: #2e7d32;
}

.component-missing {
  color: #9e9e9e;
  font-style: italic;
}

.component-item {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e0e0e0;
}

.component-item:last-child {
  border-bottom: none;
}

.total-ram, .total-storage {
  margin-top: 10px;
  font-weight: 500;
  color: #1976d2;
}

.comparison-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .component-label {
    flex: 0 0 150px;
  }
  
  .config-column {
    min-width: 200px;
  }
}
</style> 