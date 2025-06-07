import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'
import { useCartStore } from './cart'

interface Component {
  id: number
  name: string
  type: string
  price: number
  description: string
  manufacturer: string
  specifications: Record<string, any>
}

interface ConfiguratorState {
  selectedComponents: Record<string, Component | null>
  compatibility: {
    compatible: boolean
    issues: string[]
  } | null
  isLoading: boolean
  error: string | null
}

export const useConfiguratorStore = defineStore('configurator', {
  state: (): ConfiguratorState => ({
    selectedComponents: {
      CPU: null,
      GPU: null,
      RAM: null,
      Motherboard: null,
      Storage: null,
      PowerSupply: null,
      Case: null,
      Cooling: null
    },
    compatibility: null,
    isLoading: false,
    error: null
  }),
  
  getters: {
    getSelectedComponents: (state) => state.selectedComponents,
    getCompatibility: (state) => state.compatibility,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getTotalPrice: (state) => {
      return Object.values(state.selectedComponents)
        .filter(component => component !== null)
        .reduce((total, component) => total + component!.price, 0)
    },
    getSelectedComponentIds: (state) => {
      return Object.values(state.selectedComponents)
        .filter(component => component !== null)
        .map(component => component!.id)
    }
  },
  
  actions: {
    selectComponent(type: string, component: Component | null) {
      this.selectedComponents[type] = component
      this.checkCompatibility()
    },
    
    clearConfiguration() {
      for (const key in this.selectedComponents) {
        this.selectedComponents[key as keyof typeof this.selectedComponents] = null
      }
      this.compatibility = null
    },
    
    async checkCompatibility() {
      const componentIds = this.getSelectedComponentIds
      
      if (componentIds.length < 2) {
        this.compatibility = {
          compatible: true,
          issues: []
        }
        return
      }
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await apiClient.post('/compatibility/check', {
          componentIds
        })
        
        this.compatibility = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to check compatibility'
        return null
      } finally {
        this.isLoading = false
      }
    },
    
    async saveConfiguration(name: string) {
      const componentIds = this.getSelectedComponentIds
      
      if (componentIds.length === 0) {
        this.error = 'Configuration is empty'
        return false
      }
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await apiClient.post('/configurations', {
          name,
          componentIds
        })
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to save configuration'
        return null
      } finally {
        this.isLoading = false
      }
    },
    
    async addConfigurationToCart() {
      const cartStore = useCartStore()
      let success = true
      
      for (const type in this.selectedComponents) {
        const component = this.selectedComponents[type as keyof typeof this.selectedComponents]
        if (component) {
          const result = await cartStore.addToCart(component.id, 1)
          if (!result) {
            success = false
          }
        }
      }
      
      return success
    }
  }
}) 