<template>
  <div class="configuration-details">
    <h1>Детали конфигурации</h1>
    
    <div v-if="isLoading" class="loading">
      Загрузка данных...
    </div>
    
    <div v-else-if="error" class="error">
      <p>Произошла ошибка при загрузке конфигурации:</p>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!configuration" class="not-found">
      <p>Конфигурация не найдена или у вас нет доступа к ней.</p>
      <RouterLink to="/my-configurations" class="btn-back">
        Вернуться к моим конфигурациям
      </RouterLink>
    </div>
    
    <div v-else class="configuration-content">
      <div class="configuration-header">
        <h2>{{ configuration.name }}</h2>
        <div class="configuration-meta">
          <div class="configuration-price">
            Стоимость: {{ formatPrice(configuration.totalPrice) }} ₽
          </div>
          <div 
            class="configuration-compatibility"
            :class="{ 
              'compatible': configuration.isCompatible, 
              'incompatible': !configuration.isCompatible 
            }"
          >
            {{ configuration.isCompatible ? 'Совместима' : 'Несовместима' }}
          </div>
        </div>
      </div>
      
      <div v-if="configuration.description" class="configuration-description">
        <h3>Описание</h3>
        <p>{{ configuration.description }}</p>
      </div>
      
      <div class="configuration-components">
        <h3>Компоненты</h3>
        <div class="components-grid">
          <div 
            v-for="component in configuration.components" 
            :key="component.id"
            class="component-card"
          >
            <h4>{{ component.productName }}</h4>
            <div class="component-type">{{ translateComponentType(component.type) }}</div>
            <div class="component-price">{{ formatPrice(component.price) }} ₽</div>
          </div>
        </div>
      </div>
      
      <div class="configuration-actions">
        <button @click="loadToConfigurator" class="btn-load">
          Загрузить в конфигуратор
        </button>
        <RouterLink to="/my-configurations" class="btn-back">
          Вернуться к списку
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfiguratorStore } from '@/stores/configurator'

const route = useRoute()
const router = useRouter()
const configuratorStore = useConfiguratorStore()

const configuration = ref(null)
const isLoading = ref(false)
const error = ref(null)

onMounted(async () => {
  const configId = Number(route.params.id)
  if (!configId) {
    error.value = 'Неверный идентификатор конфигурации'
    return
  }
  
  isLoading.value = true
  try {
    const result = await configuratorStore.getConfigurationDetails(configId)
    configuration.value = result
  } catch (err) {
    error.value = err.message || 'Ошибка при загрузке конфигурации'
  } finally {
    isLoading.value = false
  }
})

const formatPrice = (price) => {
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

const translateComponentType = (type) => {
  const translations = {
    'CPU': 'Процессор',
    'GPU': 'Видеокарта',
    'RAM': 'Оперативная память',
    'MB': 'Материнская плата',
    'STORAGE': 'Хранилище',
    'PSU': 'Блок питания',
    'CASE': 'Корпус',
    'COOLER': 'Охлаждение'
  }
  
  return translations[type] || type
}

const loadToConfigurator = async () => {
  if (!configuration.value?.id) return
  
  isLoading.value = true
  try {
    const result = await configuratorStore.loadConfigurationToConfigurator(configuration.value.id)
    if (result) {
      router.push('/configurator')
    } else {
      error.value = 'Ошибка при загрузке конфигурации в конфигуратор'
    }
  } catch (err) {
    error.value = err.message || 'Ошибка при загрузке конфигурации'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.configuration-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.loading, .error, .not-found {
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

.configuration-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.configuration-header h2 {
  margin-bottom: 1rem;
}

.configuration-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.configuration-price {
  font-size: 1.25rem;
  font-weight: bold;
}

.configuration-compatibility {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
}

.configuration-compatibility.compatible {
  background-color: #d4edda;
  color: #155724;
}

.configuration-compatibility.incompatible {
  background-color: #f8d7da;
  color: #721c24;
}

.configuration-description {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.configuration-components h3 {
  margin-bottom: 1rem;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.component-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
}

.component-card h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.component-type {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.component-price {
  font-weight: bold;
}

.configuration-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-load, .btn-back {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
}

.btn-load {
  background-color: #3498db;
  color: white;
}

.btn-back {
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  color: #333;
}

@media (max-width: 768px) {
  .components-grid {
    grid-template-columns: 1fr;
  }
  
  .configuration-actions {
    flex-direction: column;
  }
  
  .btn-load, .btn-back {
    width: 100%;
    text-align: center;
  }
}
</style> 