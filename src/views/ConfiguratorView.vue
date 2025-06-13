<template>
  <div class="configurator">
    <h1>Конфигуратор ПК</h1>
    
    <div v-if="authStore.getIsAuthenticated">
      <div class="build-type-toggle">
        <label class="switch">
          <input type="checkbox" v-model="isFullBuild">
          <span class="slider round"></span>
        </label>
        <span class="toggle-label">{{ isFullBuild ? 'Полная сборка с периферией' : 'Только системный блок' }}</span>
      </div>
      
      <div class="configurator-layout">
        <div class="component-selection">
          <h2>Выберите компоненты</h2>
          
          <div class="component-types">
            <!-- Обычные компоненты (одиночные) -->
            <div 
              v-for="type in singleComponentTypes" 
              :key="type"
              class="component-type-card"
              :class="{ 'has-component': getSelectedComponent(type) !== null }"
            >
              <div class="component-type-header">
                <h3>{{ translateComponentType(type) }}</h3>
                <button 
                  v-if="getSelectedComponent(type)" 
                  class="btn-remove" 
                  @click="removeComponent(type)"
                >
                  Удалить
                </button>
              </div>
              
              <div v-if="getSelectedComponent(type)" class="selected-component">
                <h4>{{ getSelectedComponent(type).name }}</h4>
                <div class="component-manufacturer">{{ getManufacturerName(getSelectedComponent(type)) }}</div>
                <div class="component-price">{{ formatPrice(getSelectedComponent(type).price) }} ₽</div>
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
            
            <!-- RAM (множественный выбор) -->
            <div 
              class="component-type-card"
              :class="{ 'has-component': getPeripheralItems('RAM').length > 0 }"
            >
              <div class="component-type-header">
                <h3>{{ translateComponentType('RAM') }}</h3>
                <button 
                  v-if="getPeripheralItems('RAM').length > 0" 
                  class="btn-remove" 
                  @click="removeComponent('RAM')"
                >
                  Удалить все
                </button>
              </div>
              
              <div v-if="getPeripheralItems('RAM').length > 0" class="selected-components">
                <div 
                  v-for="(ram, index) in getPeripheralItems('RAM')" 
                  :key="index"
                  class="selected-component"
                >
                  <h4>{{ ram.name }}</h4>
                  <div class="component-manufacturer">{{ getManufacturerName(ram) }}</div>
                  <div class="component-price">{{ formatPrice(ram.price) }} ₽</div>
                  <button 
                    class="btn-remove-item" 
                    @click="removeComponent('RAM', ram.id)"
                  >
                    Удалить
                  </button>
                </div>
                
                <RouterLink 
                  :to="getComponentSelectionUrl('RAM')" 
                  class="btn-add-more"
                >
                  Добавить еще
                </RouterLink>
              </div>
              
              <div v-else class="no-component">
                <RouterLink 
                  :to="getComponentSelectionUrl('RAM')" 
                  class="btn-add"
                >
                  Выбрать {{ translateComponentType('RAM') }}
                </RouterLink>
              </div>
            </div>
            
            <!-- STORAGE (множественный выбор) -->
            <div 
              class="component-type-card"
              :class="{ 'has-component': getPeripheralItems('STORAGE').length > 0 }"
            >
              <div class="component-type-header">
                <h3>{{ translateComponentType('STORAGE') }}</h3>
                <button 
                  v-if="getPeripheralItems('STORAGE').length > 0" 
                  class="btn-remove" 
                  @click="removeComponent('STORAGE')"
                >
                  Удалить все
                </button>
              </div>
              
              <div v-if="getPeripheralItems('STORAGE').length > 0" class="selected-components">
                <div 
                  v-for="(storage, index) in getPeripheralItems('STORAGE')" 
                  :key="index"
                  class="selected-component"
                >
                  <h4>{{ storage.name }}</h4>
                  <div class="component-manufacturer">{{ getManufacturerName(storage) }}</div>
                  <div class="component-price">{{ formatPrice(storage.price) }} ₽</div>
                  <button 
                    class="btn-remove-item" 
                    @click="removeComponent('STORAGE', storage.id)"
                  >
                    Удалить
                  </button>
                </div>
                
                <RouterLink 
                  :to="getComponentSelectionUrl('STORAGE')" 
                  class="btn-add-more"
                >
                  Добавить еще
                </RouterLink>
              </div>
              
              <div v-else class="no-component">
                <RouterLink 
                  :to="getComponentSelectionUrl('STORAGE')" 
                  class="btn-add"
                >
                  Выбрать {{ translateComponentType('STORAGE') }}
                </RouterLink>
              </div>
            </div>
          </div>
          
          <!-- Периферия (отображается только при полной сборке) -->
          <div v-if="isFullBuild" class="peripherals-section">
            <h2>Периферия</h2>
            
            <div v-if="peripheralTypes.length === 0" class="loading-peripherals">
              Загрузка типов периферии...
            </div>
            
            <div v-else class="component-types">
              <div 
                v-for="type in peripheralTypes" 
                :key="type"
                class="component-type-card"
                :class="{ 'has-component': getPeripheralItems(type).length > 0 }"
              >
                <div class="component-type-header">
                  <h3>{{ translateComponentType(type) }}</h3>
                  <button 
                    v-if="getPeripheralItems(type).length > 0" 
                    class="btn-remove" 
                    @click="removeComponent(type)"
                  >
                    Удалить все
                  </button>
                </div>
                
                <div v-if="getPeripheralItems(type).length > 0" class="selected-components">
                  <div 
                    v-for="(item, index) in getPeripheralItems(type)" 
                    :key="index"
                    class="selected-component"
                  >
                    <h4>{{ item.name }}</h4>
                    <div class="component-manufacturer">{{ getManufacturerName(item) }}</div>
                    <div class="component-price">{{ formatPrice(item.price) }} ₽</div>
                    <button 
                      class="btn-remove-item" 
                      @click="removeComponent(type, item.id)"
                    >
                      Удалить
                    </button>
                  </div>
                  
                  <RouterLink 
                    :to="getPeripheralSelectionUrl(type)" 
                    class="btn-add-more"
                  >
                    Добавить еще
                  </RouterLink>
                </div>
                
                <div v-else class="no-component">
                  <RouterLink 
                    :to="getPeripheralSelectionUrl(type)" 
                    class="btn-add"
                  >
                    Выбрать {{ translateComponentType(type) }}
                  </RouterLink>
                </div>
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
                <span>{{ formatPrice(configuratorStore.getTotalPrice) }} ₽</span>
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
              <label for="config-category">Категория</label>
              <select id="config-category" v-model="configCategory">
                <option value="">Выберите категорию</option>
                <option value="BUDGET">Бюджетная</option>
                <option value="GAMING">Игровая</option>
                <option value="OFFICE">Офисная</option>
                <option value="WORKSTATION">Рабочая станция</option>
                <option value="STREAMING">Стриминг</option>
                <option value="DESIGN">Дизайн</option>
                <option value="CUSTOM">Другое</option>
              </select>
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
import { useCatalogStore } from '@/stores/catalog'

const router = useRouter()
const configuratorStore = useConfiguratorStore()
const authStore = useAuthStore()
const cartStore = useCartStore()
const compatibilityStore = ref(useCompatibilityStore())
const catalogStore = useCatalogStore()

const showSaveModal = ref(false)
const configName = ref('')
const configDescription = ref('')
const configCategory = ref('')
const isFullBuild = ref(false)

// Массивы типов компонентов
const singleComponentTypes = ['CPU', 'GPU', 'MB', 'PSU', 'CASE', 'COOLER']
const multipleComponentTypes = ['RAM', 'STORAGE']
// Получаем типы периферии из каталога
const peripheralTypes = computed(() => catalogStore.getPeripheralTypes)

// Создаем локальные вычисляемые свойства для доступа к свойствам конфигуратора
const compatibilityResult = computed(() => configuratorStore.$state.compatibility)
const isConfigurationComplete = computed(() => {
  // Проверяем, что все обязательные компоненты выбраны
  const components = configuratorStore.getSelectedComponents
  return (
    components.CPU !== null &&
    components.MB !== null &&
    components.RAM.length > 0 &&
    components.STORAGE.length > 0 &&
    components.PSU !== null &&
    components.CASE !== null
  )
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
    'COOLER': 'Охлаждение',
    'keyboard': 'Клавиатура',
    'mouse': 'Мышь',
    'monitor': 'Монитор',
    'headset': 'Наушники',
    'speakers': 'Колонки',
    'mousepad': 'Коврик',
    'microphone': 'Микрофон'
  }
  
  return translations[type] || type
}

// Функция форматирования цены
const formatPrice = (price: number) => {
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

// Функция для получения имени производителя
const getManufacturerName = (component: any) => {
  if (!component) return 'Неизвестный производитель';
  
  // Если manufacturer - это строка, возвращаем её
  if (typeof component.manufacturer === 'string') {
    return component.manufacturer;
  }
  
  // Если есть manufacturerName, возвращаем его
  if (component.manufacturerName) {
    return component.manufacturerName;
  }
  
  // Если manufacturer - это объект с полем name, возвращаем его
  if (typeof component.manufacturer === 'object' && component.manufacturer?.name) {
    return component.manufacturer.name;
  }
  
  // Если есть ID производителя, попробуем получить его имя через API
  if (component.manufacturerId) {
    return `Производитель #${component.manufacturerId}`;
  }
  
  return 'Неизвестный производитель';
}

// Типизированный доступ к компонентам по строковому ключу
const getSelectedComponent = (type: string) => {
  if (type in configuratorStore.getSelectedComponents) {
    return (configuratorStore.getSelectedComponents as any)[type];
  }
  return null;
}

const getPeripheralItems = (type: string) => {
  // Для RAM и STORAGE используем массив из selectedComponents
  if (type === 'RAM' || type === 'STORAGE') {
    return (configuratorStore.getSelectedComponents as any)[type] || [];
  }
  
  // Для остальных типов используем peripherals
  if (type in configuratorStore.getPeripherals) {
    return (configuratorStore.getPeripherals as any)[type] || [];
  }
  return [];
}

// Обновляем функцию для удаления компонента
const removeComponent = (type: string, componentId?: number) => {
  configuratorStore.removeComponent(type, componentId);
}

// Отслеживаем изменение флага полной сборки
watch(() => isFullBuild.value, async (newValue) => {
  configuratorStore.isFullBuild = newValue;
  
  // Если включен режим полной сборки, убедимся что типы периферии загружены
  if (newValue && peripheralTypes.value.length === 0) {
    console.log('Full build mode enabled, loading peripheral types...');
    await catalogStore.fetchComponents();
    console.log('Peripheral types after loading:', peripheralTypes.value);
  }
});

// Автоматически проверяем совместимость при изменении компонентов
watch(() => [
  configuratorStore.getSelectedComponents.CPU,
  configuratorStore.getSelectedComponents.GPU,
  configuratorStore.getSelectedComponents.MB,
  configuratorStore.getSelectedComponents.PSU,
  configuratorStore.getSelectedComponents.CASE,
  configuratorStore.getSelectedComponents.COOLER,
  configuratorStore.getSelectedComponents.RAM.length,
  configuratorStore.getSelectedComponents.STORAGE.length
], () => {
  const hasComponents = 
    configuratorStore.getSelectedComponents.CPU !== null ||
    configuratorStore.getSelectedComponents.GPU !== null ||
    configuratorStore.getSelectedComponents.MB !== null ||
    configuratorStore.getSelectedComponents.PSU !== null ||
    configuratorStore.getSelectedComponents.CASE !== null ||
    configuratorStore.getSelectedComponents.COOLER !== null ||
    configuratorStore.getSelectedComponents.RAM.length > 0 ||
    configuratorStore.getSelectedComponents.STORAGE.length > 0;
  
  const multipleComponents = 
    (configuratorStore.getSelectedComponents.CPU !== null ? 1 : 0) +
    (configuratorStore.getSelectedComponents.GPU !== null ? 1 : 0) +
    (configuratorStore.getSelectedComponents.MB !== null ? 1 : 0) +
    (configuratorStore.getSelectedComponents.PSU !== null ? 1 : 0) +
    (configuratorStore.getSelectedComponents.CASE !== null ? 1 : 0) +
    (configuratorStore.getSelectedComponents.COOLER !== null ? 1 : 0) +
    configuratorStore.getSelectedComponents.RAM.length +
    configuratorStore.getSelectedComponents.STORAGE.length;
  
  if (hasComponents && multipleComponents >= 2) {
    checkCompatibility();
  }
}, { deep: true });

const checkCompatibility = async () => {
  try {
    await configuratorStore.checkCompatibility()
  } catch (error) {
    console.error('Ошибка при проверке совместимости:', error)
  }
}

const addToCart = async () => {
  if (!canAddToCart.value) {
    alert('Невозможно добавить в корзину: проверьте совместимость компонентов')
    return
  }
  
  try {
    const result = await configuratorStore.addConfigurationToCart()
    if (result) {
      router.push('/cart')
    } else {
      alert('Ошибка при добавлении в корзину: ' + (configuratorStore.getError || 'Неизвестная ошибка'))
    }
  } catch (error: any) {
    alert('Ошибка при добавлении в корзину: ' + (error.message || 'Неизвестная ошибка'))
  }
}

const saveConfiguration = async () => {
  if (!configName.value) return
  
  try {
    showSaveModal.value = false // Закрываем модальное окно сразу
    const result = await configuratorStore.saveConfiguration(configName.value, configDescription.value, configCategory.value)
    if (result) {
      configName.value = ''
      configDescription.value = ''
      configCategory.value = ''
      alert('Конфигурация успешно сохранена!')
    } else {
      console.error('Failed to save configuration, result is falsy')
      alert('Ошибка при сохранении конфигурации: ' + (configuratorStore.getError || 'Неизвестная ошибка'))
      showSaveModal.value = true // Открываем модальное окно снова в случае ошибки
    }
  } catch (error: any) {
    console.error('Ошибка при сохранении конфигурации:', error)
    alert('Ошибка при сохранении конфигурации: ' + (error.message || 'Неизвестная ошибка'))
    showSaveModal.value = true // Открываем модальное окно снова в случае ошибки
  }
}

// Функция для получения URL для выбора компонента с учетом совместимости
const getComponentSelectionUrl = (type: string) => {
  // Собираем ID всех выбранных компонентов
  const selectedComponentIds: number[] = [];
  
  // Добавляем одиночные компоненты
  for (const t of singleComponentTypes) {
    const component = configuratorStore.getSelectedComponents[t as keyof typeof configuratorStore.getSelectedComponents];
    if (component && !Array.isArray(component)) {
      selectedComponentIds.push(component.id);
    }
  }
  
  // Добавляем компоненты из массивов
  for (const t of multipleComponentTypes) {
    const components = configuratorStore.getSelectedComponents[t as 'RAM' | 'STORAGE'];
    components.forEach(c => selectedComponentIds.push(c.id));
  }
  
  // Преобразуем тип компонента в формат, понятный бэкенду
  const componentTypeMapping: Record<string, string> = {
    'Motherboard': 'MB',
    'Storage': 'STORAGE',
    'Case': 'CASE',
    'Cooling': 'COOLER'
  }
  
  const actualType = componentTypeMapping[type] || type;
  
  // Если еще нет выбранных компонентов, просто переходим в каталог с фильтром по типу
  if (selectedComponentIds.length === 0) {
    return `/catalog?componentType=${actualType}`;
  }
  
  // Если есть выбранные компоненты, добавляем параметр для фильтрации по совместимости
  return `/catalog?componentType=${actualType}&compatibleWith=${selectedComponentIds.join(',')}`;
}

// Функция для получения URL для выбора периферии
const getPeripheralSelectionUrl = (type: string) => {
  console.log(`Getting URL for peripheral type: ${type}`);
  
  // Используем тип периферии в нижнем регистре
  const typeLowerCase = type.toLowerCase();
  
  return `/catalog?peripheralType=${typeLowerCase}`;
}

onMounted(async () => {
  // Инициализируем флаг полной сборки из хранилища
  isFullBuild.value = configuratorStore.getIsFullBuild;
  
  // Загружаем компоненты и типы периферии
  await catalogStore.fetchComponents();
  
  console.log('Peripheral types loaded:', catalogStore.getPeripheralTypes);
});
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

.build-type-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-right: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.toggle-label {
  font-weight: bold;
  font-size: 1.1rem;
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
  margin-bottom: 0.5rem;
  position: relative;
}

.selected-component h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.component-manufacturer {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.component-price {
  font-weight: bold;
}

.btn-remove-item {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.selected-components {
  margin-bottom: 1rem;
}

.btn-add-more {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #2ecc71;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.btn-add-more:hover {
  background-color: #27ae60;
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

.peripherals-section {
  margin-top: 2rem;
  border-top: 1px solid #ddd;
  padding-top: 1.5rem;
}

.peripherals-section h2 {
  margin-bottom: 1.5rem;
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

.form-group input, .form-group select {
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

.loading-peripherals {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-style: italic;
  color: #666;
}

.error-message {
  color: #666;
}
</style> 