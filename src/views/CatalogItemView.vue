<template>
  <div class="catalog-item">
    <div class="container" v-if="component">
      <div class="item-content">
        <div class="item-image">
          <img :src="component.image || 'https://via.placeholder.com/400x300?text=Component'" :alt="component.name">
        </div>
        
        <div class="item-details">
          <h1>{{ component.name }}</h1>
          <div class="item-meta">
            <span class="item-type">{{ component.type }}</span>
            <span class="item-manufacturer">{{ component.manufacturer }}</span>
          </div>
          
          <div class="item-price">${{ component.price?.toFixed(2) }}</div>
          
          <div class="item-description">
            <h3>Description</h3>
            <p>{{ component.description }}</p>
          </div>
          
          <div class="item-actions">
            <button class="btn-add" @click="addToConfigurator(component)">
              Add to Configurator
            </button>
            <button class="btn-cart" @click="addToCart(component)">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      
      <div class="item-specs" v-if="component.specs">
        <h3>Specifications</h3>
        <div class="specs-table">
          <div v-for="(value, key) in component.specs" :key="key" class="spec-row">
            <div class="spec-name">{{ formatSpecName(key) }}</div>
            <div class="spec-value">{{ value }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="loading" v-else-if="loading">Loading component details...</div>
    <div class="error" v-else>
      <h2>Component not found</h2>
      <p>The component you're looking for doesn't exist or has been removed.</p>
      <RouterLink to="/catalog" class="btn-back">Back to Catalog</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useConfiguratorStore } from '@/stores/configurator'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const configuratorStore = useConfiguratorStore()
const cartStore = useCartStore()

const component = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  
  try {
    // If we already have components loaded in the store
    if (catalogStore.getComponents.length > 0) {
      component.value = catalogStore.getComponents.find(c => c.id.toString() === id)
    } 
    
    // If component not found in store or components not loaded yet
    if (!component.value) {
      await catalogStore.fetchComponents()
      component.value = catalogStore.getComponents.find(c => c.id.toString() === id)
    }
  } catch (error) {
    console.error('Error fetching component:', error)
  } finally {
    loading.value = false
  }
})

const formatSpecName = (key: string): string => {
  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

const addToConfigurator = (item: any) => {
  configuratorStore.selectComponent(item.type, item)
  router.push('/configurator')
}

const addToCart = (item: any) => {
  cartStore.addToCart(item)
}
</script>

<style scoped>
.catalog-item {
  width: 100%;
  padding: 2rem;
  background-color: var(--background-color);
  color: var(--text-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.item-content {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.item-image {
  flex: 0 0 40%;
}

.item-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.item-details {
  flex: 1;
}

h1 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.item-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.item-type, .item-manufacturer {
  background-color: var(--primary-color);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.item-price {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.item-description {
  margin-bottom: 2rem;
}

.item-description h3 {
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.item-description p {
  color: var(--text-secondary-color);
  line-height: 1.6;
}

.item-actions {
  display: flex;
  gap: 1rem;
}

.btn-add, .btn-cart {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add {
  background-color: var(--primary-color);
  color: white;
}

.btn-add:hover {
  background-color: #2980b9;
}

.btn-cart {
  background-color: var(--secondary-color);
  color: white;
}

.btn-cart:hover {
  background-color: #27ae60;
}

.item-specs {
  background-color: var(--surface-color);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px var(--shadow-color);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.item-specs h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.specs-table {
  display: grid;
  gap: 1rem;
}

.spec-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.spec-name {
  font-weight: bold;
  color: var(--text-color);
}

.spec-value {
  color: var(--text-secondary-color);
}

.loading, .error {
  text-align: center;
  padding: 3rem;
}

.error h2 {
  margin-bottom: 1rem;
}

.error p {
  margin-bottom: 2rem;
  color: var(--text-secondary-color);
}

.btn-back {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn-back:hover {
  background-color: #2980b9;
}

@media (max-width: 768px) {
  .item-content {
    flex-direction: column;
  }
  
  .item-image {
    flex: none;
    margin-bottom: 1.5rem;
  }
}
</style> 