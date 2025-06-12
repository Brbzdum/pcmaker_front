<template>
  <div class="configurator">
    <h1>Конфигуратор ПК</h1>
    
    <div v-if="authStore.getIsAuthenticated">
      <div class="configurator-layout">
        <div class="component-selection">
          <h2>Выберите компоненты</h2>
          
          <div class="component-types">
            <div 
              v-for="(component, type) in configuratorStore.getSelectedComponents" 
              :key="type"
              class="component-type-card"
              :class="{ 'has-component': component !== null }"
            >
              <div class="component-type-header">
                <h3>{{ translateComponentType(type) }}</h3>
                <button 
                  v-if="component" 
                  class="btn-remove" 
                  @click="removeComponent(type)"
                >
                  Удалить
                </button>
              </div>
              
              <div v-if="component" class="selected-component">
                <h4>{{ component.name }}</h4>
                <div class="component-manufacturer">{{ componentManufacturers[type] || 'Загрузка...' }}</div>
                <div class="component-price">{{ component.price.toFixed(2) }} ₽</div>
              </div>
              
              <div v-else class="no-component">
                <RouterLink 
                  :to="getComponentSelectionUrl(type)" 
                  class="btn-add"
                >
                  Выбрать {{ translateComponentType(type) }}
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
        
        <div class="configuration-summary">
          <div class="summary-card">
            <h2>Сводка конфигурации</h2>
            
            <div class="price-summary">
              <div class="total-price">
                <span>Общая стоимость:</span>
                <span>{{ configuratorStore.getTotalPrice.toFixed(2) }} ₽</span>
              </div>
            </div>
            
            <div v-if="configuratorStore.getIsLoading" class="compatibility-checking">
              Проверка совместимости...
            </div>
            
            <div 
              v-else-if="compatibilityResult"
              class="compatibility-result"
              :class="{ 
                'compatible': compatibilityResult.compatible,
                'incompatible': !compatibilityResult.compatible
              }"
            >
              <div v-if="compatibilityResult.compatible">
                <h3>✓ Совместимо</h3>
                <p>Все компоненты совместимы друг с другом.</p>
              </div>
              <div v-else>
                <h3>✗ Несовместимо</h3>
                <ul class="issues-list">
                  <li v-for="(issue, index) in compatibilityResult.issues" :key="index">
                    {{ issue }}
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="actions">
              <button 
                @click="checkCompatibility"
                class="btn-check"
                :disabled="!isConfigurationComplete"
              >
                Проверить совместимость
              </button>
              
              <button 
                @click="addToCart"
                class="btn-add-to-cart"
                :disabled="!canAddToCart"
              >
                Добавить в корзину
              </button>
              
              <button 
                @click="showSaveModal = true"
                class="btn-save"
                :disabled="!isConfigurationComplete"
              >
                Сохранить конфигурацию
              </button>
              
              <RouterLink 
                to="/my-configurations" 
                class="btn-my-configs"
              >
                Мои конфигурации
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Save Configuration Modal -->
      <div v-if="showSaveModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>Сохранить конфигурацию</h3>
            <button @click="showSaveModal = false" class="btn-close">×</button>
          </div>
          <div class="modal-content">
            <div class="form-group">
              <label for="config-name">Название конфигурации</label>
              <input type="text" id="config-name" v-model="configName" placeholder="Введите название">
            </div>
            <div class="form-group">
              <label for="config-description">Описание (необязательно)</label>
              <textarea id="config-description" v-model="configDescription" placeholder="Введите описание" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showSaveModal = false" class="btn-cancel">Отмена</button>
            <button @click="saveConfiguration" class="btn-save" :disabled="!configName">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="login-required">
      <p>Пожалуйста, войдите в аккаунт, чтобы использовать конфигуратор ПК.</p>
      <RouterLink to="/login" class="btn-login">Войти</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfiguratorStore } from '@/stores/configurator'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCompatibilityStore } from '@/stores/compatibility'
import apiClient from '@/api/apiClient'

const router = useRouter()
const configuratorStore = useConfiguratorStore()
const authStore = useAuthStore()
const cartStore = useCartStore()
const compatibilityStore = ref(useCompatibilityStore())

const showSaveModal = ref(false)
const configName = ref('')
const configDescription = ref('')
const componentManufacturers = ref<Record<string, string>>({})

// Создаем локальные вычисляемые свойства для доступа к свойствам конфигуратора
const compatibilityResult = computed(() => configuratorStore.$state.compatibility)
const isConfigurationComplete = computed(() => {
  // Проверяем, что все обязательные компоненты выбраны
  const components = configuratorStore.getSelectedComponents
  const requiredTypes = ['CPU', 'MB', 'RAM', 'STORAGE', 'PSU', 'CASE']
  return requiredTypes.every(type => components[type] !== null)
})

const canAddToCart = computed(() => {
  return isConfigurationComplete.value && 
         compatibilityResult.value && 
         compatibilityResult.value.compatible
})

// Функция для перевода типов компонентов
const translateComponentType = (type: string) => {
  const translations: Record<string, string> = {
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

// Функция для получения имени производителя
const getManufacturerName = async (component: any) => {
  if (!component || !component.manufacturer) return 'Неизвестный производитель';
  
  // Если manufacturer - это строка, возвращаем её
  if (typeof component.manufacturer === 'string') {
    return component.manufacturer;
  }
  
  // Если manufacturer - это объект с полем name, возвращаем его
  if (typeof component.manufacturer === 'object' && component.manufacturer.name) {
    return component.manufacturer.name;
  }
  
  // Если manufacturer - это число, делаем запрос к API
  if (typeof component.manufacturer === 'number' || typeof component.manufacturerId === 'number') {
    const manufacturerId = component.manufacturer || component.manufacturerId;
    try {
      // Используем метод из apiClient для получения имени производителя
      if (typeof apiClient.getManufacturerName === 'function') {
        return await apiClient.getManufacturerName(manufacturerId);
      }
      return `Производитель #${manufacturerId}`;
    } catch (error) {
      console.error('Ошибка при получении имени производителя:', error);
      return `Производитель #${manufacturerId}`;
    }
  }
  
  return 'Неизвестный производитель';
}

// Обновляем имена производителей при изменении выбранных компонентов
watch(() => configuratorStore.getSelectedComponents, async (components) => {
  for (const [type, component] of Object.entries(components)) {
    if (component) {
      componentManufacturers.value[type] = await getManufacturerName(component);
    } else {
      componentManufacturers.value[type] = '';
    }
  }
  
  // Автоматически проверяем совместимость при изменении компонентов
  const hasComponents = Object.values(components).some(component => component !== null);
  const multipleComponents = Object.values(components).filter(component => component !== null).length >= 2;
  
  if (hasComponents && multipleComponents) {
    checkCompatibility();
  }
}, { deep: true, immediate: true });

const checkCompatibility = async () => {
  try {
    // Предполагаем, что в store есть метод для проверки совместимости
    await configuratorStore.checkCompatibility()
  } catch (error) {
    console.error('Ошибка при проверке совместимости:', error)
  }
}

const removeComponent = (type: string) => {
  // Предполагаем, что в store есть метод для удаления компонента
  // Если метод не существует, создаем альтернативный подход
  if (typeof configuratorStore.removeComponent === 'function') {
    configuratorStore.removeComponent(type)
  } else {
    // Альтернативный подход: устанавливаем компонент в null
    configuratorStore.selectComponent(type, null)
  }
}

const addToCart = async () => {
  if (!canAddToCart.value) {
    alert('Невозможно добавить в корзину: проверьте совместимость компонентов')
    return
  }
  
  // Here we would convert the configuration to cart items
  // For now, we'll assume the backend has an endpoint to add a full configuration
  const components = Object.values(configuratorStore.getSelectedComponents)
    .filter(component => component !== null)
  
  for (const component of components) {
    await cartStore.addToCart(component!.id)
  }
  
  router.push('/cart')
}

const saveConfiguration = async () => {
  if (!configName.value) return
  
  console.log('Saving configuration with name:', configName.value)
  console.log('Description:', configDescription.value)
  console.log('Component IDs:', configuratorStore.getSelectedComponentIds)
  console.log('User:', authStore.getUser)
  
  try {
    showSaveModal.value = false // Закрываем модальное окно сразу
    const result = await configuratorStore.saveConfiguration(configName.value, configDescription.value)
    console.log('Save result:', result)
    if (result) {
      configName.value = ''
      configDescription.value = ''
      alert('Конфигурация успешно сохранена!')
    } else {
      console.error('Failed to save configuration, result is falsy')
      alert('Ошибка при сохранении конфигурации: ' + (configuratorStore.getError || 'Неизвестная ошибка'))
      showSaveModal.value = true // Открываем модальное окно снова в случае ошибки
    }
  } catch (error) {
    console.error('Ошибка при сохранении конфигурации:', error)
    alert('Ошибка при сохранении конфигурации: ' + (error.message || 'Неизвестная ошибка'))
    showSaveModal.value = true // Открываем модальное окно снова в случае ошибки
  }
}

// Функция для получения URL для выбора компонента с учетом совместимости
const getComponentSelectionUrl = (type: string) => {
  const selectedComponents = configuratorStore.getSelectedComponents;
  const hasComponents = Object.values(selectedComponents).some(component => component !== null);
  
  // Преобразуем тип компонента в формат, понятный бэкенду
  const componentTypeMapping: Record<string, string> = {
    'Motherboard': 'MB',
    'Storage': 'STORAGE',
    'Case': 'CASE',
    'Cooling': 'COOLER'
  }
  
  const actualType = componentTypeMapping[type] || type;
  
  // Если еще нет выбранных компонентов, просто переходим в каталог с фильтром по типу
  if (!hasComponents) {
    return `/catalog?componentType=${actualType}`;
  }
  
  // Если есть выбранные компоненты, добавляем параметр для фильтрации по совместимости
  const selectedComponentIds = Object.values(selectedComponents)
    .filter(component => component !== null)
    .map(component => component!.id);
  
  return `/catalog?componentType=${actualType}&compatibleWith=${selectedComponentIds.join(',')}`;
}
</script>

<style scoped>
.configurator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.configurator-layout {
  display: flex;
  gap: 2rem;
}

.component-selection {
  flex: 2;
}

.configuration-summary {
  flex: 1;
}

.component-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.component-type-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: border-color 0.3s;
}

.component-type-card.has-component {
  border-color: #3498db;
}

.component-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.component-type-header h3 {
  margin: 0;
}

.btn-remove {
  padding: 0.25rem 0.5rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.selected-component {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

.selected-component h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.component-manufacturer {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.component-price {
  font-weight: bold;
}

.no-component {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.btn-add {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-add:hover {
  background-color: #2980b9;
}

.summary-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 1rem;
}

.price-summary {
  margin: 1.5rem 0;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 1rem 0;
}

.total-price {
  display: flex;
  justify-content: space-between;
  font-size: 1.25rem;
  font-weight: bold;
}

.compatibility-result {
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 4px;
}

.compatibility-result.compatible {
  background-color: #d4edda;
  color: #155724;
}

.compatibility-result.incompatible {
  background-color: #f8d7da;
  color: #721c24;
}

.issues-list {
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-check {
  background-color: #f39c12;
  color: white;
}

.btn-check:hover:not(:disabled) {
  background-color: #e67e22;
}

.btn-add-to-cart {
  background-color: #2ecc71;
  color: white;
}

.btn-add-to-cart:hover:not(:disabled) {
  background-color: #27ae60;
}

.btn-save {
  background-color: #3498db;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #2980b9;
}

.login-required {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.btn-login {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
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
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.btn-my-configs {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: #9b59b6;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-my-configs:hover {
  background-color: #8e44ad;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

@media (max-width: 768px) {
  .configurator-layout {
    flex-direction: column;
  }
  
  .summary-card {
    position: static;
  }
}
</style> 