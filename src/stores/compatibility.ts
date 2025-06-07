import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface CompatibilityRule {
  id?: number
  sourceType: string
  targetType: string
  ruleType: string
  sourceProperty: string
  targetProperty: string
  comparisonOperator: string
  valueModifier?: string
  description?: string
  isActive: boolean
}

interface Product {
  id: number
  name: string
  type: string
  price: number
  description: string
  manufacturer: string
  specifications: Record<string, any>
}

interface CompatibilityState {
  compatibilityRules: Record<string, CompatibilityRule[]>
  compatibleComponents: Record<string, Product[]>
  isLoading: boolean
  error: string | null
}

export const useCompatibilityStore = defineStore('compatibility', {
  state: (): CompatibilityState => ({
    compatibilityRules: {},
    compatibleComponents: {},
    isLoading: false,
    error: null
  }),

  getters: {
    getRulesForComponentType: (state) => (componentType: string) => 
      state.compatibilityRules[componentType] || [],
    getCompatibleComponents: (state) => (sourceId: number, targetType: string) => 
      state.compatibleComponents[`${sourceId}-${targetType}`] || [],
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async checkCompatibility(sourceId: number, targetId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post(`/compatibility/check?sourceId=${sourceId}&targetId=${targetId}`, {})
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to check compatibility'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async checkConfigurationCompatibility(newComponentId: number, existingComponentIds: number[]) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post(`/compatibility/check-configuration?newComponentId=${newComponentId}`, 
          existingComponentIds)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to check configuration compatibility'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async getCompatibleComponentsForType(sourceId: number, targetType: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/compatibility/compatible/${sourceId}?targetType=${targetType}`)
        this.compatibleComponents[`${sourceId}-${targetType}`] = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to get compatible components'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async createCompatibilityRule(rule: CompatibilityRule) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post('/compatibility/rules', rule)
        
        // Обновляем правила для типа компонентов
        if (this.compatibilityRules[rule.sourceType]) {
          this.compatibilityRules[rule.sourceType].push(response.data)
        } else {
          this.compatibilityRules[rule.sourceType] = [response.data]
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create compatibility rule'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateCompatibilityRule(id: number, rule: CompatibilityRule) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.put(`/compatibility/rules/${id}`, rule)
        
        // Обновляем правило в списке
        if (this.compatibilityRules[rule.sourceType]) {
          const index = this.compatibilityRules[rule.sourceType].findIndex(r => r.id === id)
          if (index !== -1) {
            this.compatibilityRules[rule.sourceType][index] = response.data
          }
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update compatibility rule'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchRulesForComponentType(componentType: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/compatibility/rules/${componentType}`)
        this.compatibilityRules[componentType] = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch compatibility rules'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async updateProductCompatibility(sourceId: number, targetId: number) {
      this.isLoading = true
      this.error = null

      try {
        await apiClient.post(`/compatibility/update-compatibility?sourceId=${sourceId}&targetId=${targetId}`, {})
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update product compatibility'
        return false
      } finally {
        this.isLoading = false
      }
    }
  }
}) 