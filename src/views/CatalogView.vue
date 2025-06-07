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
              <div class="category-header" @click="toggleCategory(category.id)">
                <span class="category-toggle" v-if="hasSubcategories(category.id)">
                  {{ expandedCategories.includes(category.id) ? '▼' : '►' }}
                </span>
                <input 
                  type="checkbox" 
                  :id="`cat-${category.id}`" 
                  :value="category.id" 
                  v-model="selectedCategories"
                  @change="applyFilters"
                >
                <label :for="`cat-${category.id}`">{{ category.name }}</label>
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
                    @change="applyFilters"
                  >
                  <label :for="`cat-${subcategory.id}`">{{ subcategory.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="filter-group">
          <h3>Тип компонента</h3>
          <div v-for="type in catalogStore.getComponentTypes" :key="type" class="filter-item">
            <input 
              type="checkbox" 
              :id="type" 
              :value="type" 
              v-model="selectedTypes"
              @change="applyFilters"
            >
            <label :for="type">{{ type }}</label>
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
              <div class="component-type">{{ component.type }}</div>
              <div class="component-manufacturer">{{ component.manufacturer }}</div>
            </div>
            
            <div class="component-rating" v-if="component.rating > 0">
              <div class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= Math.round(component.rating) }">★</span>
              </div>
              <span class="rating-value">{{ component.rating.toFixed(1) }}</span>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useConfiguratorStore } from '@/stores/configurator'
import { useCartStore } from '@/stores/cart'
import { useCategoryStore } from '@/stores/category'

const router = useRouter()
const catalogStore = useCatalogStore()
const configuratorStore = useConfiguratorStore()
const cartStore = useCartStore()
const categoryStore = useCategoryStore()

const selectedTypes = ref<string[]>([])
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
})

const getCategoryChildren = (categoryId: number) => {
  return categoryStore.getSubcategories(categoryId)
}

const hasSubcategories = (categoryId: number) => {
  return getCategoryChildren(categoryId).length > 0
}

const toggleCategory = (categoryId: number) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index === -1) {
    expandedCategories.value.push(categoryId)
  } else {
    expandedCategories.value.splice(index, 1)
  }
}

const applyFilters = () => {
  catalogStore.setFilter({
    type: selectedTypes.value.length > 0 ? selectedTypes.value : undefined,
    manufacturer: selectedManufacturers.value.length > 0 ? selectedManufacturers.value : undefined,
    priceMin: priceMin.value !== null ? priceMin.value : undefined,
    priceMax: priceMax.value !== null ? priceMax.value : undefined,
    categoryIds: selectedCategories.value.length > 0 ? selectedCategories.value : undefined,
    searchQuery: searchQuery.value.trim() || undefined
  })
}

const clearFilters = () => {
  selectedTypes.value = []
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

const addToCart = (component: any) => {
  cartStore.addToCart(component)
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
  padding: 2rem;
  background-color: var(--background-color);
  color: var(--text-color);
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-color);
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.catalog-layout {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.filters {
  width: 280px;
  flex-shrink: 0;
  background-color: var(--surface-color);
  padding: 1.5rem;
  border-radius: 8px;
  align-self: flex-start;
  position: sticky;
  top: 1rem;
  box-shadow: 0 2px 10px var(--shadow-color);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group h3 {
  margin-bottom: 0.8rem;
  font-size: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
  color: var(--text-color);
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.filter-item label {
  margin-left: 0.5rem;
  cursor: pointer;
}

.price-inputs {
  display: flex;
  gap: 1rem;
}

.price-input {
  flex: 1;
}

.price-input label {
  color: var(--text-color);
  display: block;
  margin-bottom: 0.3rem;
}

.price-input input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--surface-color);
  color: var(--text-color);
}

.btn-clear {
  width: 100%;
  padding: 0.75rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
}

.btn-clear:hover {
  background-color: #d32f2f;
}

.components-list {
  flex: 1;
}

.search-box {
  display: flex;
  margin-bottom: 1.5rem;
}

.search-box input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  background-color: var(--surface-color);
  color: var(--text-color);
}

.btn-search {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  font-weight: bold;
  cursor: pointer;
}

.loading, .error, .no-results {
  padding: 2rem;
  text-align: center;
  color: var(--text-color);
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.component-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  background-color: var(--surface-color);
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
  color: var(--text-color);
  height: 100%;
  text-decoration: none;
  display: flex;
  flex-direction: column;
}

.component-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px var(--shadow-color);
}

.component-image {
  text-align: center;
  margin-bottom: 1rem;
}

.component-image img {
  max-width: 100%;
  height: auto;
  max-height: 150px;
  border-radius: 4px;
}

.component-card h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.component-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.component-type,
.component-manufacturer {
  color: var(--text-secondary-color);
  font-size: 0.9rem;
  background-color: var(--background-light-color);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.component-rating {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stars {
  display: flex;
  margin-right: 0.5rem;
}

.star {
  font-size: 1rem;
  color: var(--text-light-color);
  margin-right: 2px;
}

.star.filled {
  color: var(--star-color, gold);
}

.rating-value {
  font-size: 0.9rem;
  color: var(--text-color);
}

.component-price {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: auto;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.component-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-add, .btn-cart {
  padding: 0.6rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.3s;
  text-align: center;
}

.btn-add {
  background-color: var(--primary-color);
  color: white;
}

.btn-add:hover {
  background-color: var(--primary-dark-color, #2980b9);
}

.btn-cart {
  background-color: var(--secondary-color);
  color: white;
}

.btn-cart:hover {
  background-color: var(--secondary-dark-color, #27ae60);
}

/* Стили для категорий */
.category-tree {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  margin-bottom: 0.25rem;
}

.category-header {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.category-toggle {
  margin-right: 0.25rem;
  font-size: 0.8rem;
  width: 1rem;
  color: var(--text-color);
}

.subcategories {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.subcategory-item {
  margin-bottom: 0;
}

.loading-categories {
  font-size: 0.9rem;
  color: var(--text-secondary-color);
  padding: 0.5rem 0;
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
  .catalog-layout {
    flex-direction: column;
  }
  
  .filters {
    width: 100%;
    position: static;
    margin-bottom: 2rem;
    max-height: none;
  }
  
  .component-actions {
    flex-direction: column;
  }
}
</style> 