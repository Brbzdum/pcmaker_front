<template>
  <div class="catalog">
    <h1>Каталог товаров</h1>
    
    <div class="catalog-layout">
      <aside class="filters">
        <h2>Фильтры</h2>
        
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
              <div class="component-type" v-if="component.type">{{ component.type }}</div>
              <div class="component-manufacturer">
                <template v-if="component.manufacturer === 'Загрузка...'">
                  <span class="loading-manufacturer">Загрузка...</span>
                </template>
                <template v-else>
                  {{ component.manufacturer }}
                </template>
              </div>
            </div>
            
            <div class="component-rating" v-if="component.rating && component.rating > 0">
              <div class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= Math.round(component.rating || 0) }">★</span>
              </div>
              <span class="rating-value">{{ (component.rating || 0).toFixed(1) }}</span>
            </div>
            
            <div class="component-price">{{ component.price.toFixed(2) }} ₽</div>
            
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
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useConfiguratorStore } from '@/stores/configurator'
import { useCartStore } from '@/stores/cart'
import { useCategoryStore } from '@/stores/category'
import apiClient from '@/api/apiClient'

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
let searchTimeout: number | null = null

onMounted(async () => {
  // Загружаем категории и компоненты
  await Promise.all([
    categoryStore.fetchRootCategories(),
    catalogStore.fetchComponents()
  ])
  
  // Для каждой корневой категории загружаем подкатегории
  for (const category of categoryStore.getRootCategories) {
    await categoryStore.fetchSubcategories(category.id)
  }
  
  // Применяем фильтры из URL если они есть
  const componentType = route.query.componentType as string
  if (componentType) {
    // Проверяем, соответствует ли тип компонента тем, что используются в бэкенде
    const backendComponentTypes = ['CPU', 'GPU', 'RAM', 'MB', 'STORAGE', 'PSU', 'CASE', 'COOLER']
    const mappedComponentType = componentType
    
    // Если тип компонента не соответствует бэкенду, преобразуем его
    const componentTypeMapping: Record<string, string> = {
      'Motherboard': 'MB',
      'Storage': 'STORAGE',
      'Case': 'CASE',
      'Cooling': 'COOLER'
    }
    
    const actualType = componentTypeMapping[componentType] || componentType
    
    catalogStore.setFilter({
      componentType: actualType
    })
  }
  
  // Проверяем есть ли параметр совместимости
  const compatibleWith = route.query.compatibleWith as string
  if (compatibleWith) {
    const componentIds = compatibleWith.split(',').map(id => parseInt(id))
    // Получаем тип компонента, который мы хотим выбрать
    const componentType = route.query.componentType as string
    
    if (componentIds.length > 0 && componentType) {
      console.log('Фильтрация по совместимым компонентам:', componentIds)
      // Показываем индикатор загрузки
      catalogStore.isLoading = true
      
      try {
        // Используем первый компонент как источник для проверки совместимости
        const sourceId = componentIds[0]
        
        // Вызываем API для получения совместимых компонентов
        const response = await apiClient.get(
          `/compatibility/compatible/${sourceId}?targetType=${componentType}`
        )
        
        // Получаем ID совместимых компонентов
        const compatibleIds = response.data.map((item: any) => item.id)
        
        if (compatibleIds.length > 0) {
          // Фильтруем компоненты по полученным ID
          catalogStore.setFilter({
            componentType,
            compatibleIds
          })
        } else {
          // Если нет совместимых компонентов, показываем сообщение
          alert('Не найдено совместимых компонентов для выбранной конфигурации')
        }
      } catch (error) {
        console.error('Error fetching compatible components:', error)
      } finally {
        catalogStore.isLoading = false
      }
    }
  }
})

const getCategoryChildren = (categoryId: number) => {
  return categoryStore.getSubcategories(categoryId)
}

const hasSubcategories = (categoryId: number) => {
  return getCategoryChildren(categoryId).length > 0
}

const toggleCategory = (categoryId: number, event: Event) => {
  // Теперь event.stopPropagation() не нужен, т.к. клик на стрелку обрабатывается отдельно
  const index = expandedCategories.value.indexOf(categoryId)
  if (index === -1) {
    expandedCategories.value.push(categoryId)
  } else {
    expandedCategories.value.splice(index, 1)
  }
}

// Обработчик изменения выбранных категорий
const handleCategoryChange = (categoryId: number) => {
  console.log('Category selection changed:', categoryId, 'Selected categories:', selectedCategories.value)
  applyFilters()
}

const applyFilters = () => {
  console.log('Applying filters:',
    'Manufacturers:', selectedManufacturers.value,
    'Categories:', selectedCategories.value,
    'PriceMin:', priceMin.value,
    'PriceMax:', priceMax.value,
    'Search:', searchQuery.value
  )
  
  catalogStore.setFilter({
    manufacturer: selectedManufacturers.value.length > 0 ? selectedManufacturers.value : undefined,
    priceMin: priceMin.value !== null ? priceMin.value : undefined,
    priceMax: priceMax.value !== null ? priceMax.value : undefined,
    categoryIds: selectedCategories.value.length > 0 ? selectedCategories.value : undefined,
    searchQuery: searchQuery.value.trim() || undefined
  })
}

const clearFilters = () => {
  selectedManufacturers.value = []
  selectedCategories.value = []
  priceMin.value = null
  priceMax.value = null
  searchQuery.value = ''
  catalogStore.clearFilter()
}

const debounceSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    search()
  }, 500) as unknown as number
}

const search = () => {
  applyFilters()
}

const addToConfigurator = (component: any) => {
  configuratorStore.selectComponent(component.type, component)
  router.push('/configurator')
}

const addToCart = async (component: any) => {
  try {
    const result = await cartStore.addToCart(component.id, 1)
    if (result) {
      alert('Товар добавлен в корзину')
    } else {
      alert('Ошибка при добавлении товара в корзину: ' + cartStore.getError)
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    alert('Ошибка при добавлении товара в корзину')
  }
}

// Очищаем таймаут при размонтировании компонента
watch(() => {
  return () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  }
})
</script>

<style scoped>
.catalog {
  width: 100%;
  padding: 2.5rem;
  background-color: var(--background-color, #f8f9fa);
  color: var(--text-color, #333);
  min-height: 100vh;
}

h1 {
  margin-bottom: 2.5rem;
  text-align: center;
  color: var(--text-color, #333);
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  font-size: 2.2rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

h1:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.catalog-layout {
  display: flex;
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.filters {
  width: 280px;
  flex-shrink: 0;
  background-color: var(--surface-color);
  padding: 1.5rem;
  border-radius: 12px;
  align-self: flex-start;
  position: sticky;
  top: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.filters h2 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  font-weight: 600;
  text-align: center;
  position: relative;
  padding-bottom: 0.8rem;
}

.filters h2:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

.filter-group {
  margin-bottom: 1.8rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-group h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--text-color);
  font-weight: 500;
  position: relative;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.7rem;
  color: var(--text-color);
  transition: transform 0.2s;
  padding: 0.3rem 0;
}

.filter-item:hover {
  transform: translateX(3px);
}

.filter-item input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  margin-right: 0.6rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  background-color: rgba(255, 255, 255, 0.8);
}

.filter-item input[type="checkbox"]:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.filter-item input[type="checkbox"]:checked:after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.filter-item label {
  margin-left: 0.2rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.filter-item label:hover {
  color: var(--primary-color);
}

.price-inputs {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.price-input {
  flex: 1;
}

.price-input label {
  color: var(--text-color);
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.price-input input {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--surface-color);
  color: var(--text-color);
  transition: all 0.3s;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.price-input input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  outline: none;
}

.btn-clear {
  width: 100%;
  padding: 0.9rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(244, 67, 54, 0.2);
}

.btn-clear:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(244, 67, 54, 0.25);
}

.btn-clear:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.25);
}

.components-list {
  flex: 1;
}

.search-box {
  display: flex;
  margin-bottom: 1.5rem;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  overflow: hidden;
}

.search-box input {
  flex: 1;
  padding: 0.9rem 1.2rem;
  border: 1px solid var(--border-color);
  border-right: none;
  border-radius: 10px 0 0 10px;
  font-size: 1rem;
  background-color: var(--surface-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: inset 0 0 0 1px var(--primary-color);
}

.btn-search {
  padding: 0.9rem 1.8rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0 10px 10px 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-search:hover {
  background-color: #2980b9;
  transform: translateX(2px);
}

.btn-search:before {
  content: "🔍";
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.loading, .error, .no-results {
  padding: 3rem;
  text-align: center;
  color: var(--text-color);
  background-color: var(--surface-color);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  font-size: 1.1rem;
}

.error {
  color: #e74c3c;
  border-left: 4px solid #e74c3c;
}

.no-results {
  color: #7f8c8d;
  border-left: 4px solid #7f8c8d;
  font-style: italic;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
}

.component-card {
  border: none;
  border-radius: 16px;
  padding: 1.8rem;
  background-color: var(--surface-color);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  color: var(--text-color);
  height: 100%;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.component-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.component-card:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.component-card:hover:after {
  transform: scaleX(1);
}

.component-image {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  transition: all 0.3s;
}

.component-card:hover .component-image {
  background-color: rgba(0, 0, 0, 0.03);
}

.component-image img {
  max-width: 100%;
  height: auto;
  max-height: 160px;
  border-radius: 8px;
  transition: all 0.3s;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.05));
}

.component-card:hover .component-image img {
  transform: scale(1.05);
  filter: drop-shadow(0 8px 15px rgba(0, 0, 0, 0.08));
}

.component-card h3 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  transition: color 0.3s;
}

.component-card:hover h3 {
  color: var(--primary-color);
}

.component-meta {
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.component-type,
.component-manufacturer {
  color: var(--text-secondary-color, #666);
  font-size: 0.85rem;
  background-color: var(--background-light-color, #f0f0f0);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  transition: all 0.3s;
  font-weight: 500;
}

.component-card:hover .component-type,
.component-card:hover .component-manufacturer {
  background-color: rgba(52, 152, 219, 0.1);
  color: var(--primary-color);
}

.component-rating {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.stars {
  display: flex;
  margin-right: 0.8rem;
}

.star {
  font-size: 1.1rem;
  color: var(--text-light-color, #ddd);
  margin-right: 3px;
}

.star.filled {
  color: #FFD700;
  text-shadow: 0 0 2px rgba(255, 215, 0, 0.4);
}

.rating-value {
  font-size: 0.95rem;
  color: var(--text-color, #333);
  font-weight: 600;
}

.component-price {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: auto;
  margin-bottom: 1.5rem;
  color: var(--primary-color, #3498db);
  display: flex;
  align-items: center;
}

.component-price:after {
  content: "₽";
  font-size: 1rem;
  margin-left: 0.3rem;
  opacity: 0.8;
}

.component-actions {
  display: flex;
  gap: 0.8rem;
}

.btn-add, .btn-cart {
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  transition: all 0.3s;
  text-align: center;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.btn-add:before, .btn-cart:before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.4s;
  z-index: -1;
}

.btn-add:hover:before, .btn-cart:hover:before {
  left: 0;
}

.btn-add {
  background-color: var(--primary-color, #3498db);
  color: white;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.25);
}

.btn-add:hover {
  background-color: #2980b9;
  transform: translateY(-3px);
  box-shadow: 0 7px 15px rgba(52, 152, 219, 0.3);
}

.btn-add:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.btn-cart {
  background-color: var(--secondary-color, #2ecc71);
  color: white;
  box-shadow: 0 4px 10px rgba(46, 204, 113, 0.25);
}

.btn-cart:hover {
  background-color: #27ae60;
  transform: translateY(-3px);
  box-shadow: 0 7px 15px rgba(46, 204, 113, 0.3);
}

.btn-cart:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
}

/* Стили для категорий */
.category-tree {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.category-item {
  margin-bottom: 0.35rem;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 0.4rem 0;
  border-radius: 4px;
  transition: all 0.2s;
}

.category-header:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.category-toggle {
  margin-right: 0.4rem;
  width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  transition: all 0.2s;
  border-radius: 50%;
  background-color: rgba(52, 152, 219, 0.08);
  cursor: pointer;
}

.category-checkbox {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.category-header:hover .category-toggle {
  background-color: rgba(52, 152, 219, 0.15);
  transform: scale(1.1);
}

.toggle-icon {
  transition: transform 0.3s ease;
}

.category-header:active .toggle-icon {
  transform: scale(0.9);
}

.subcategories {
  margin-left: 1.8rem;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-left: 0.8rem;
  border-left: 1px dashed rgba(0, 0, 0, 0.1);
}

.subcategory-item {
  margin-bottom: 0;
  padding: 0.3rem 0;
}

.loading-categories {
  font-size: 0.9rem;
  color: var(--text-secondary-color);
  padding: 0.5rem 0;
}

.loading-manufacturer {
  display: inline-block;
  position: relative;
  color: #999;
  font-style: italic;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (min-width: 1600px) {
  .catalog-layout, h1 {
    max-width: 1600px;
  }
  
  .component-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .catalog {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  
  .catalog-layout {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .filters {
    width: 100%;
    position: static;
    margin-bottom: 1.5rem;
    max-height: none;
  }
  
  .component-actions {
    flex-direction: column;
  }
}
</style> 