<template>
  <div class="configurator">
    <h1>PC Configurator</h1>
    
    <div v-if="authStore.getIsAuthenticated">
      <div class="configurator-layout">
        <div class="component-selection">
          <h2>Select Components</h2>
          
          <div class="component-types">
            <div 
              v-for="(component, type) in configuratorStore.getSelectedComponents" 
              :key="type"
              class="component-type-card"
              :class="{ 'has-component': component !== null }"
            >
              <div class="component-type-header">
                <h3>{{ type }}</h3>
                <button 
                  v-if="component" 
                  class="btn-remove" 
                  @click="removeComponent(type)"
                >
                  Remove
                </button>
              </div>
              
              <div v-if="component" class="selected-component">
                <h4>{{ component.name }}</h4>
                <div class="component-manufacturer">{{ component.manufacturer }}</div>
                <div class="component-price">${{ component.price.toFixed(2) }}</div>
              </div>
              
              <div v-else class="no-component">
                <RouterLink :to="`/catalog?type=${type}`" class="btn-add">
                  Select {{ type }}
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
        
        <div class="configuration-summary">
          <div class="summary-card">
            <h2>Configuration Summary</h2>
            
            <div class="price-summary">
              <div class="total-price">
                <span>Total Price:</span>
                <span>${{ configuratorStore.getTotalPrice.toFixed(2) }}</span>
              </div>
            </div>
            
            <div v-if="configuratorStore.getIsLoading" class="compatibility-checking">
              Checking compatibility...
            </div>
            
            <div 
              v-else-if="configuratorStore.getCompatibilityResult"
              class="compatibility-result"
              :class="{ 
                'compatible': configuratorStore.getCompatibilityResult.compatible,
                'incompatible': !configuratorStore.getCompatibilityResult.compatible
              }"
            >
              <div v-if="configuratorStore.getCompatibilityResult.compatible">
                <h3>✓ Compatible</h3>
                <p>All components are compatible with each other.</p>
              </div>
              <div v-else>
                <h3>✗ Incompatible</h3>
                <ul class="issues-list">
                  <li v-for="(issue, index) in configuratorStore.getCompatibilityResult.issues" :key="index">
                    {{ issue }}
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="actions">
              <button 
                @click="checkCompatibility"
                class="btn-check"
                :disabled="!configuratorStore.isConfigurationComplete"
              >
                Check Compatibility
              </button>
              
              <button 
                @click="addToCart"
                class="btn-add-to-cart"
                :disabled="!canAddToCart"
              >
                Add to Cart
              </button>
              
              <button 
                @click="showSaveModal = true"
                class="btn-save"
                :disabled="!configuratorStore.isConfigurationComplete"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Save Configuration Modal -->
      <div v-if="showSaveModal" class="modal-overlay">
        <div class="modal">
          <h3>Save Configuration</h3>
          <div class="modal-content">
            <div class="form-group">
              <label for="config-name">Configuration Name</label>
              <input type="text" id="config-name" v-model="configName">
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showSaveModal = false" class="btn-cancel">Cancel</button>
            <button @click="saveConfiguration" class="btn-save">Save</button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="login-required">
      <p>Please log in to use the PC Configurator.</p>
      <RouterLink to="/login" class="btn-login">Log In</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfiguratorStore } from '@/stores/configurator'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const configuratorStore = useConfiguratorStore()
const authStore = useAuthStore()
const cartStore = useCartStore()

const showSaveModal = ref(false)
const configName = ref('')

const canAddToCart = computed(() => {
  return configuratorStore.isConfigurationComplete && 
         configuratorStore.getCompatibilityResult && 
         configuratorStore.getCompatibilityResult.compatible
})

const checkCompatibility = async () => {
  await configuratorStore.checkCompatibility()
}

const removeComponent = (type: string) => {
  configuratorStore.removeComponent(type)
}

const addToCart = async () => {
  if (!canAddToCart.value) return
  
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
  
  await configuratorStore.saveConfiguration(configName.value)
  showSaveModal.value = false
  configName.value = ''
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

@media (max-width: 768px) {
  .configurator-layout {
    flex-direction: column;
  }
  
  .summary-card {
    position: static;
  }
}
</style> 