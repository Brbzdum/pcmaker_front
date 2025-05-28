import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface Component {
  id: number
  name: string
  type: string
  price: number
  description: string
}

interface CompatibilityResult {
  compatible: boolean
  issues?: string[]
}

interface ConfiguratorState {
  selectedComponents: { [type: string]: Component | null }
  compatibilityResult: CompatibilityResult | null
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
    compatibilityResult: null,
    isLoading: false,
    error: null
  }),

  getters: {
    getSelectedComponents: (state) => state.selectedComponents,
    getCompatibilityResult: (state) => state.compatibilityResult,
    getTotalPrice: (state) => {
      let total = 0
      Object.values(state.selectedComponents).forEach(component => {
        if (component) {
          total += component.price
        }
      })
      return total
    },
    isConfigurationComplete: (state) => {
      // Check if all required components are selected
      const requiredTypes = ['CPU', 'Motherboard', 'RAM', 'Storage', 'PowerSupply', 'Case']
      return requiredTypes.every(type => state.selectedComponents[type] !== null)
    },
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    selectComponent(type: string, component: Component) {
      this.selectedComponents[type] = component
      // Reset compatibility result when components change
      this.compatibilityResult = null
    },

    removeComponent(type: string) {
      this.selectedComponents[type] = null
      // Reset compatibility result when components change
      this.compatibilityResult = null
    },

    resetConfiguration() {
      Object.keys(this.selectedComponents).forEach(type => {
        this.selectedComponents[type] = null
      })
      this.compatibilityResult = null
    },

    async checkCompatibility() {
      this.isLoading = true
      this.error = null

      // Create a payload with component IDs
      const componentIds = Object.entries(this.selectedComponents)
        .filter(([_, component]) => component !== null)
        .map(([_, component]) => component!.id)

      try {
        const response = await apiClient.post('/compatibility/check', {
          componentIds
        })
        
        this.compatibilityResult = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to check compatibility'
        this.compatibilityResult = {
          compatible: false,
          issues: ['An error occurred while checking compatibility']
        }
        return this.compatibilityResult
      } finally {
        this.isLoading = false
      }
    },

    async saveConfiguration(name: string) {
      this.isLoading = true
      this.error = null

      // Create a payload with component IDs
      const componentIds = Object.entries(this.selectedComponents)
        .filter(([_, component]) => component !== null)
        .map(([_, component]) => component!.id)

      try {
        const response = await apiClient.post('/profile/configurations', {
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
    }
  }
}) 