<template>
  <div class="catalog">
    <h1>Component Catalog</h1>
    
    <div class="catalog-layout">
      <aside class="filters">
        <h2>Filters</h2>
        
        <div class="filter-group">
          <h3>Component Type</h3>
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
          <h3>Manufacturer</h3>
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
          <h3>Price Range</h3>
          <div class="price-inputs">
            <div class="price-input">
              <label for="price-min">Min</label>
              <input 
                type="number" 
                id="price-min" 
                v-model="priceMin" 
                @change="applyFilters"
                min="0"
              >
            </div>
            <div class="price-input">
              <label for="price-max">Max</label>
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
        
        <button class="btn-clear" @click="clearFilters">Clear Filters</button>
      </aside>
      
      <div class="components-list">
        <div class="loading" v-if="catalogStore.getIsLoading">Loading components...</div>
        <div class="error" v-else-if="catalogStore.getError">{{ catalogStore.getError }}</div>
        <div class="no-results" v-else-if="catalogStore.getFilteredComponents.length === 0">
          No components found matching your filters.
        </div>
        
        <div class="component-grid" v-else>
          <div 
            v-for="component in catalogStore.getFilteredComponents" 
            :key="component.id" 
            class="component-card"
          >
            <h3>{{ component.name }}</h3>
            <div class="component-type">{{ component.type }}</div>
            <div class="component-manufacturer">{{ component.manufacturer }}</div>
            <p class="component-description">{{ component.description }}</p>
            <div class="component-price">${{ component.price.toFixed(2) }}</div>
            <div class="component-actions">
              <button class="btn-add" @click="addToConfigurator(component)">
                Add to Configurator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useConfiguratorStore } from '@/stores/configurator'

const router = useRouter()
const catalogStore = useCatalogStore()
const configuratorStore = useConfiguratorStore()

const selectedTypes = ref<string[]>([])
const selectedManufacturers = ref<string[]>([])
const priceMin = ref<number | null>(null)
const priceMax = ref<number | null>(null)

onMounted(async () => {
  await catalogStore.fetchComponents()
})

const applyFilters = () => {
  catalogStore.setFilter({
    type: selectedTypes.value.length > 0 ? selectedTypes.value : undefined,
    manufacturer: selectedManufacturers.value.length > 0 ? selectedManufacturers.value : undefined,
    priceMin: priceMin.value !== null ? priceMin.value : undefined,
    priceMax: priceMax.value !== null ? priceMax.value : undefined
  })
}

const clearFilters = () => {
  selectedTypes.value = []
  selectedManufacturers.value = []
  priceMin.value = null
  priceMax.value = null
  catalogStore.clearFilter()
}

const addToConfigurator = (component: any) => {
  configuratorStore.selectComponent(component.type, component)
  router.push('/configurator')
}
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
  width: 250px;
  flex-shrink: 0;
  background-color: var(--surface-color);
  padding: 1.5rem;
  border-radius: 8px;
  align-self: flex-start;
  position: sticky;
  top: 1rem;
  box-shadow: 0 2px 10px var(--shadow-color);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group h3 {
  margin-bottom: 0.5rem;
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
  background-color: var(--light-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: var(--text-color);
}

.btn-clear:hover {
  background-color: #e1e1e1;
}

.components-list {
  flex: 1;
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
}

.component-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px var(--shadow-color);
}

.component-card h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.component-type,
.component-manufacturer {
  color: var(--text-secondary-color);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.component-description {
  margin-bottom: 1rem;
  color: var(--text-secondary-color);
}

.component-price {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.component-actions {
  display: flex;
  justify-content: center;
}

.btn-add {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-add:hover {
  background-color: #2980b9;
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
  }
}
</style> 