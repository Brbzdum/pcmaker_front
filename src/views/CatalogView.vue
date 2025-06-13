<template>
  <div class="catalog">
    <h1>Каталог товаров</h1>
    
    <div class="catalog-layout">
      <aside class="filters">
        <h2>Фильтры</h2>
        
        <div class="filter-group">
          <h3>Тип товара</h3>
          <div class="filter-tabs">
            <button 
              class="filter-tab" 
              :class="{ active: viewMode === 'all' }"
              @click="selectComponentType(null); selectPeripheralType(null);"
            >
              Все товары
            </button>
            <button 
              class="filter-tab" 
              :class="{ active: viewMode === 'components' }"
              @click="selectComponentType(selectedComponentType || 'CPU'); selectPeripheralType(null);"
            >
              Компоненты ПК
            </button>
            <button 
              class="filter-tab" 
              :class="{ active: viewMode === 'peripherals' }"
              @click="selectPeripheralType(selectedPeripheralType || 'keyboard'); selectComponentType(null);"
            >
              Периферия
            </button>
          </div>
        </div>
        
        <!-- Фильтр типов компонентов (показывается только при выбранной вкладке "Компоненты ПК") -->
        <div class="filter-group" v-if="viewMode === 'components'">
          <h3>Тип компонента</h3>
          <div class="component-type-buttons">
            <button 
              v-for="type in componentTypes" 
              :key="type"
              class="component-type-button"
              :class="{ active: selectedComponentType === type }"
              @click="selectComponentType(type)"
            >
              {{ translateType(type) }}
            </button>
          </div>
        </div>
        
        <!-- Фильтр типов периферии (показывается только при выбранной вкладке "Периферия") -->
        <div class="filter-group" v-if="viewMode === 'peripherals'">
          <h3>Тип периферии</h3>
          <div v-if="peripheralTypes.length === 0" class="loading-types">
            Загрузка типов периферии...
          </div>
          <div v-else class="component-type-buttons">
            <button 
              v-for="type in peripheralTypes" 
              :key="type"
              class="component-type-button"
              :class="{ active: selectedPeripheralType === type }"
              @click="selectPeripheralType(type)"
            >
              {{ translateType(type) }}
              <small class="debug-info">({{ type }})</small>
            </button>
          </div>
          
          <div class="debug-panel">
            <p>Выбранный тип: {{ selectedPeripheralType }}</p>
            <p>Выбранные категории: {{ selectedCategories }}</p>
          </div>
        </div>
        
        <div class="filter-group">
          <h3>Категории</h3>
          <div v-if="categoryStore.getRootCategories.length === 0 && !categoryStore.getIsLoading" class="loading-categories">
            Загрузка категорий...
          </div>
          <div v-else class="category-tree">
            <div 
              v-for="category in categoryStore.getRootCategories" 
              :key="category.id" 
              class="category-item"
            >
              <div class="category-header">
                <span 
                  v-if="hasSubcategories(category.id)" 
                  class="category-toggle" 
                  @click="toggleCategory(category.id, $event)"
                >
                  <svg v-if="expandedCategories.includes(category.id)" class="toggle-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M7 10l5 5 5-5z"></path>
                  </svg>
                  <svg v-else class="toggle-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M10 17l5-5-5-5v10z"></path>
                  </svg>
                </span>
                <div class="category-checkbox">
                  <input 
                    type="checkbox" 
                    :id="`cat-${category.id}`" 
                    :value="category.id" 
                    v-model="selectedCategories"
                    @change="handleCategoryChange(category.id)"
                  >
                  <label :for="`cat-${category.id}`">{{ category.name }}</label>
                </div>
              </div>
              
              <div class="subcategories" v-if="expandedCategories.includes(category.id)">
                <div 
                  v-for="subcategory in getCategoryChildren(category.id)" 
                  :key="subcategory.id" 
                  class="filter-item subcategory-item"
                >
                  <input 
                    type="checkbox" 
                    :id="`cat-${subcategory.id}`" 
                    :value="subcategory.id" 
                    v-model="selectedCategories"
                    @change="handleCategoryChange(subcategory.id)"
                  >
                  <label :for="`cat-${subcategory.id}`">{{ subcategory.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="filter-group">
          <h3>Производитель</h3>
          <div v-for="manufacturer in catalogStore.getManufacturers" :key="manufacturer" class="filter-item">
            <input 
              type="checkbox" 
              :id="manufacturer" 
              :value="manufacturer" 
              v-model="selectedManufacturers"
              @change="applyFilters"
            >
            <label :for="manufacturer">{{ manufacturer }}</label>
          </div>
        </div>
        
        <div class="filter-group">
          <h3>Ценовой диапазон</h3>
          <div class="price-inputs">
            <div class="price-input">
              <label for="price-min">Мин</label>
              <input 
                type="number" 
                id="price-min" 
                v-model="priceMin" 
                @change="applyFilters"
                min="0"
              >
            </div>
            <div class="price-input">
              <label for="price-max">Макс</label>
              <input 
                type="number" 
                id="price-max" 
                v-model="priceMax" 
                @change="applyFilters"
                min="0"
              >
            </div>
          </div>
        </div>
        
        <button class="btn-clear" @click="clearFilters">Сбросить фильтры</button>
      </aside>
      
      <div class="components-list">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск товаров..." 
            @input="debounceSearch"
          >
          <button class="btn-search" @click="search">Поиск</button>
        </div>
        
        <div class="loading" v-if="catalogStore.getIsLoading">Загрузка товаров...</div>
        <div class="error" v-else-if="catalogStore.getError">{{ catalogStore.getError }}</div>
        <div class="no-results" v-else-if="catalogStore.getFilteredComponents.length === 0">
          Не найдено товаров, соответствующих вашим фильтрам.
        </div>
        
        <div class="component-grid" v-else>
          <RouterLink 
            v-for="component in catalogStore.getFilteredComponents" 
            :key="component.id" 
            :to="`/catalog/${component.id}`" 
            class="component-card"
          >
            <div class="component-image">
              <img :src="component.imageUrl || 'https://via.placeholder.com/200x150?text=Product'" :alt="component.name">
            </div>
            <h3>{{ component.name }}</h3>
            <div class="component-meta">
              <div class="component-type">
                <!-- Для периферии используем название категории -->
                <span v-if="component.category && component.category.isPeripheral">
                  {{ component.category.name }}
                </span>
                <!-- Для компонентов используем тип -->
                <span v-else>
                  {{ translateType(component.type) }}
                </span>
              </div>
              <div class="component-manufacturer">
                {{ getManufacturerName(component) }}
              </div>
            </div>
            
            <div class="component-price">
              <span class="price-value">{{ formatPrice(component.price) }} ₽</span>
              <div class="price-rating" v-if="component.averageRating">
                <span class="stars">
                  <i class="fas fa-star" v-for="i in Math.floor(component.averageRating)" :key="'star-'+i"></i>
                  <i class="fas fa-star-half-alt" v-if="component.averageRating % 1 >= 0.5"></i>
                </span>
                <span class="rating-value">{{ component.averageRating.toFixed(1) }}</span>
              </div>
            </div>
            
            <div class="component-actions">
              <button class="btn-add" @click.prevent="addToConfigurator(component)">
                В конфигуратор
              </button>
              <button class="btn-cart" @click.prevent="addToCart(component)">
                В корзину
              </button>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useConfiguratorStore } from '@/stores/configurator'
import { useCartStore } from '@/stores/cart'
import { useCategoryStore } from '@/stores/category'

const router = useRouter()
const route = useRoute()
const catalogStore = useCatalogStore()
const configuratorStore = useConfiguratorStore()
const cartStore = useCartStore()
const categoryStore = useCategoryStore()

const selectedManufacturers = ref<string[]>([])
const selectedCategories = ref<number[]>([])
const priceMin = ref<number | null>(null)
const priceMax = ref<number | null>(null)
const searchQuery = ref('')
const expandedCategories = ref<number[]>([])
const selectedComponentType = ref<string | null>(null)
const selectedPeripheralType = ref<string | null>(null)
let searchTimeout: number | null = null

// Списки типов компонентов и периферии
const componentTypes = ['CPU', 'GPU', 'RAM', 'MB', 'STORAGE', 'PSU', 'CASE', 'COOLER']
// Получаем типы периферии из каталога
const peripheralTypes = computed(() => catalogStore.getPeripheralTypes)

// Переводы для типов
const typeTranslations = {
  'CPU': 'Процессор',
  'GPU': 'Видеокарта',
  'RAM': 'Оперативная память',
  'MB': 'Материнская плата',
  'STORAGE': 'Накопитель',
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

// Вычисляемое свойство для определения типа просмотра (компоненты или периферия)
const viewMode = computed(() => {
  if (selectedPeripheralType.value) return 'peripherals'
  if (selectedComponentType.value) return 'components'
  return 'all'
})

onMounted(async () => {
  // Загружаем категории и компоненты
  await Promise.all([
    categoryStore.fetchRootCategories(),
    categoryStore.fetchAllCategories(),
    catalogStore.fetchComponents()
  ])
  
  console.log('Peripheral types loaded:', catalogStore.getPeripheralTypes);
  console.log('All categories loaded:', categoryStore.getAllCategories);
  
  // Проверяем параметры URL
  const queryComponentType = route.query.componentType as string
  const queryCategory = route.query.category as string
  const queryPeripheralType = route.query.peripheralType as string
  
  console.log('URL parameters:', { 
    queryComponentType, 
    queryCategory, 
    queryPeripheralType 
  });
  
  if (queryComponentType) {
    selectedComponentType.value = queryComponentType
  } else if (queryCategory) {
    selectedPeripheralType.value = queryCategory
  } else if (queryPeripheralType) {
    selectedPeripheralType.value = queryPeripheralType
    console.log(`Setting peripheral type from URL: ${queryPeripheralType}`);
  }
  
  // Если указан параметр совместимости, применяем его
  const compatibleWith = route.query.compatibleWith as string
  if (compatibleWith) {
    const componentIds = compatibleWith.split(',').map(id => parseInt(id))
    await catalogStore.filterCompatibleComponents(componentIds)
  }
  
  applyFilters()
})

// Функция для добавления компонента в конфигуратор
const addToConfigurator = (component: any) => {
  try {
    if (!component) {
      console.error('Attempted to add undefined component to configurator');
      return;
    }
    
    // Определяем тип компонента
    if (component.type && componentTypes.includes(component.type)) {
      // Это компонент ПК
      console.log(`Adding PC component of type: ${component.type}`);
      
      if (component.type === 'RAM' || component.type === 'STORAGE') {
        // Для RAM и STORAGE добавляем в массив
        configuratorStore.addComponent(component.type, component);
      } else {
        // Для остальных типов используем selectComponent
        configuratorStore.selectComponent(component.type, component);
      }
    } else if (component.category) {
      // Это может быть периферия, определяем тип
      let peripheralType = null;
      
      // Проверяем разные варианты структуры данных
      if (typeof component.category === 'object' && component.category.isPeripheral) {
        // Вариант 1: category - это объект с полем isPeripheral и slug
        const categorySlug = component.category.slug;
        console.log(`Case 1: Adding peripheral with category slug: ${categorySlug}`);
        
        if (categorySlug) {
          const slug = categorySlug.toLowerCase();
          // Маппинг slug'ов к типам периферии
          if (slug === 'monitors' || slug === 'monitor') peripheralType = 'monitor';
          else if (slug === 'keyboards' || slug === 'keyboard') peripheralType = 'keyboard';
          else if (slug === 'mice' || slug === 'mouse') peripheralType = 'mouse';
          else if (slug === 'headsets' || slug === 'headset' || slug === 'headphones') peripheralType = 'headset';
          else if (slug === 'speakers' || slug === 'speaker') peripheralType = 'speakers';
          else if (slug === 'mousepads' || slug === 'mousepad') peripheralType = 'mousepad';
          else if (slug === 'microphones' || slug === 'microphone') peripheralType = 'microphone';
          else peripheralType = slug; // Используем slug как тип по умолчанию
        }
      } else if (typeof component.category === 'string') {
        // Вариант 2: category - это строка с названием категории
        console.log(`Case 2: Adding peripheral with category name: ${component.category}`);
        const categoryName = component.category.toLowerCase();
        
        // Маппинг названий категорий к типам периферии
        if (categoryName.includes('монитор')) peripheralType = 'monitor';
        else if (categoryName.includes('клавиатур')) peripheralType = 'keyboard';
        else if (categoryName.includes('мыш')) peripheralType = 'mouse';
        else if (categoryName.includes('наушник') || categoryName.includes('гарнитур')) peripheralType = 'headset';
        else if (categoryName.includes('колонк') || categoryName.includes('акустик')) peripheralType = 'speakers';
        else if (categoryName.includes('коврик')) peripheralType = 'mousepad';
        else if (categoryName.includes('микрофон')) peripheralType = 'microphone';
      }
      
      // Если не определили по названию, попробуем по ID категории
      if (!peripheralType && component.categoryId) {
        console.log(`Case 3: Adding peripheral with category ID: ${component.categoryId}`);
        // Маппинг ID категорий к типам периферии
        switch (component.categoryId) {
          case 38: peripheralType = 'monitor'; break;
          case 39: peripheralType = 'keyboard'; break;
          case 40: peripheralType = 'mouse'; break;
          case 41: case 49: peripheralType = 'headset'; break;
          case 42: peripheralType = 'speakers'; break;
          case 43: case 50: peripheralType = 'mousepad'; break;
          case 44: case 51: peripheralType = 'microphone'; break;
        }
      }
      
      if (peripheralType) {
        console.log(`Mapped to peripheral type: ${peripheralType}`);
        configuratorStore.addComponent(peripheralType, component);
        
        // Включаем режим полной сборки
      if (!configuratorStore.getIsFullBuild) {
          configuratorStore.toggleFullBuild();
        }
      } else {
        console.error(`Unknown peripheral category: ${component.category}`, component);
        alert('Ошибка: неизвестный тип периферии');
        return;
      }
    } else {
      console.error('Component has no valid type or category information', component);
      alert('Ошибка: неизвестный тип компонента');
      return;
    }
    
    router.push('/configurator');
  } catch (error) {
    console.error('Ошибка при добавлении в конфигуратор:', error);
    alert(`Ошибка при добавлении в конфигуратор: ${error}`);
  }
}

// Функция для добавления товара в корзину
const addToCart = async (component: any) => {
  try {
    await cartStore.addToCart(component.id)
  } catch (error) {
    console.error('Ошибка при добавлении в корзину:', error)
  }
}

// Функция для применения фильтров
const applyFilters = () => {
  catalogStore.filterComponents({
    manufacturers: selectedManufacturers.value,
    categories: selectedCategories.value,
    priceMin: priceMin.value,
    priceMax: priceMax.value,
    searchQuery: searchQuery.value,
    componentType: selectedComponentType.value,
    peripheralType: selectedPeripheralType.value
  })
}

// Функция для отложенного поиска
const debounceSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    search()
  }, 300) as unknown as number
}

// Функция для поиска
const search = () => {
  applyFilters()
}

// Функция для сброса фильтров
const clearFilters = () => {
  selectedManufacturers.value = []
  selectedCategories.value = []
  priceMin.value = null
  priceMax.value = null
  searchQuery.value = ''
  selectedComponentType.value = null
  selectedPeripheralType.value = null
  applyFilters()
}

// Функция для переключения категории
const toggleCategory = (categoryId: number, event: Event) => {
  event.preventDefault()
  if (expandedCategories.value.includes(categoryId)) {
    expandedCategories.value = expandedCategories.value.filter(id => id !== categoryId)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

// Функция для проверки наличия подкатегорий
const hasSubcategories = (categoryId: number) => {
  return categoryStore.getCategoriesByParentId(categoryId).length > 0
}

// Функция для получения дочерних категорий
const getCategoryChildren = (categoryId: number) => {
  return categoryStore.getCategoriesByParentId(categoryId)
}

// Функция для обработки изменения категории
const handleCategoryChange = (_categoryId: number) => {
  applyFilters()
}

// Функция для выбора типа компонента
const selectComponentType = (type: string | null) => {
  selectedComponentType.value = type
  selectedPeripheralType.value = null
  applyFilters()
}

// Функция для выбора типа периферии
const selectPeripheralType = (type: string | null) => {
  console.log(`Selecting peripheral type: ${type}`);
  
  // Если тип не null, преобразуем его в нижний регистр
  const typeLowerCase = type ? type.toLowerCase() : null;
  
  selectedPeripheralType.value = typeLowerCase;
  selectedComponentType.value = null;
  
  // Сбрасываем выбранные категории
  selectedCategories.value = [];
  
  // Если выбран тип периферии, загрузим соответствующие товары
  if (typeLowerCase) {
    // Найдем категории периферии
    const peripheralCategories = categoryStore.getAllCategories.filter(c => c.isPeripheral);
    console.log('Available peripheral categories:', peripheralCategories);
    
    // Проверяем как единственное, так и множественное число
    const singularForm = typeLowerCase.endsWith('s') ? 
      typeLowerCase.slice(0, -1) : typeLowerCase;
    const pluralForm = typeLowerCase.endsWith('s') ? 
      typeLowerCase : typeLowerCase + 's';
      
    console.log(`Looking for category with slug matching: singular=${singularForm}, plural=${pluralForm}`);
    
    // Ищем категории с подходящим slug или именем (в нижнем регистре)
    const matchingCategories = peripheralCategories.filter(c => {
      const slug = c.slug?.toLowerCase();
      const name = c.name?.toLowerCase();
      
      // Проверяем совпадение по slug или по имени
      const matchBySlug = slug === singularForm || slug === pluralForm;
      const matchByName = name && (
        name.includes(singularForm) || 
        name.includes(pluralForm) ||
        singularForm.includes(name) || 
        pluralForm.includes(name)
      );
      
      console.log(`Checking category: ${c.name}, slug: ${slug}, match: ${matchBySlug || matchByName}`);
      return matchBySlug || matchByName;
    });
    
    console.log('Matching categories:', matchingCategories);
    
    if (matchingCategories.length > 0) {
      // Если нашли категории, добавим их ID в выбранные категории
      selectedCategories.value = matchingCategories.map(c => c.id);
      console.log(`Selected category IDs: ${selectedCategories.value}`);
    } else {
      console.warn(`No matching categories found for peripheral type: ${typeLowerCase}`);
    }
  }
  
  applyFilters();
}

// Функция для перевода типа
const translateType = (type: string): string => {
  return typeTranslations[type as keyof typeof typeTranslations] || type
}

// Следим за изменениями параметров URL
watch(() => route.query, (newQuery) => {
  const componentType = newQuery.componentType as string
  const category = newQuery.category as string
  
  if (componentType && componentType !== selectedComponentType.value) {
    selectedComponentType.value = componentType
    selectedPeripheralType.value = null
  } else if (category && category !== selectedPeripheralType.value) {
    selectedPeripheralType.value = category
    selectedComponentType.value = null
  }
  
  applyFilters()
}, { deep: true })

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
  
  return 'Неизвестный производитель';
}

// Функция форматирования цены
const formatPrice = (price: number) => {
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

// Функция для получения верхних спецификаций
const getTopSpecs = (specs: any) => {
  const topSpecs = {};
  for (const key in specs) {
    if (typeof specs[key] === 'string' || typeof specs[key] === 'number') {
      topSpecs[key] = specs[key];
    }
  }
  return topSpecs;
}

// Функция для форматирования имени спецификации
const formatSpecName = (key: string) => {
  const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
}
</script>

<style scoped>
.catalog {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.catalog-layout {
  display: flex;
  gap: 2rem;
}

.filters {
  width: 300px;
  flex-shrink: 0;
}

.components-list {
  flex: 1;
}

.filter-group {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.filter-group h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.filter-item {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.filter-item input[type="checkbox"] {
  margin-right: 0.5rem;
}

.price-inputs {
  display: flex;
  gap: 1rem;
}

.price-input {
  flex: 1;
}

.price-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.price-input input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-clear {
  width: 100%;
  padding: 0.75rem;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-clear:hover {
  background-color: #e1e1e1;
}

.search-box {
  display: flex;
  margin-bottom: 1.5rem;
}

.search-box input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  border-right: none;
}

.btn-search {
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.component-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.component-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.component-image {
  height: 150px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.component-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.component-meta {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.component-type {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.component-manufacturer {
  font-style: italic;
}

.component-price {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  margin-top: auto;
}

.component-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-add, .btn-cart {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: center;
}

.btn-add {
  background-color: #3498db;
  color: white;
}

.btn-cart {
  background-color: #2ecc71;
  color: white;
}

.loading, .error, .no-results {
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.error {
  color: #e74c3c;
}

.category-tree {
  margin-left: 0.5rem;
}

.category-item {
  margin-bottom: 0.5rem;
}

.category-header {
  display: flex;
  align-items: center;
}

.category-toggle {
  cursor: pointer;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.category-checkbox {
  display: flex;
  align-items: center;
}

.subcategories {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
}

.subcategory-item {
  margin-bottom: 0.25rem;
}

.loading-manufacturer {
  font-style: italic;
  color: #999;
}

/* Новые стили для фильтров по типу */
.filter-tabs {
  display: flex;
  margin-bottom: 1rem;
}

.filter-tab {
  flex: 1;
  padding: 0.75rem;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  cursor: pointer;
  text-align: center;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.filter-tab:first-child {
  border-radius: 4px 0 0 4px;
}

.filter-tab:last-child {
  border-radius: 0 4px 4px 0;
}

.filter-tab.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.component-type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.component-type-button {
  padding: 0.5rem 1rem;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.component-type-button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

@media (max-width: 768px) {
  .catalog-layout {
    flex-direction: column;
  }
  
  .filters {
    width: 100%;
  }
  
  .filter-tabs {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-tab:first-child,
  .filter-tab:last-child {
    border-radius: 4px;
  }
}

.debug-info {
  font-size: 0.7rem;
  color: #999;
  display: block;
  margin-top: 0.25rem;
}

.debug-panel {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
}

.debug-panel p {
  margin: 0.25rem 0;
}

.loading-types {
  padding: 1rem;
  text-align: center;
  font-style: italic;
  color: #666;
}
</style> 