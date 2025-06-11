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
      MB: null,
      STORAGE: null,
      PSU: null,
      CASE: null,
      COOLER: null
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
        return this.compatibility
      }
      
      this.isLoading = true
      this.error = null
      
      try {
        // Получаем первый компонент как основу для проверки
        const firstComponentId = componentIds[0]
        // Остальные компоненты как существующие
        const otherComponentIds = componentIds.slice(1)
        
        // Используем API проверки конфигурации
        const response = await apiClient.post(
          `/compatibility/check-configuration?newComponentId=${firstComponentId}`, 
          otherComponentIds
        )
        
        // Если компоненты совместимы
        if (response.data === true) {
          this.compatibility = {
            compatible: true,
            issues: []
          }
        } else {
          // Если не совместимы, нужно получить причины несовместимости
          // Для этого проверяем каждую пару компонентов
          const issues: string[] = []
          
          for (let i = 0; i < componentIds.length; i++) {
            for (let j = i + 1; j < componentIds.length; j++) {
              try {
                const checkResponse = await apiClient.post(
                  `/compatibility/check?sourceId=${componentIds[i]}&targetId=${componentIds[j]}`, 
                  {}
                )
                
                if (checkResponse.data === false) {
                  const sourceComponent = this.getComponentById(componentIds[i])
                  const targetComponent = this.getComponentById(componentIds[j])
                  
                  if (sourceComponent && targetComponent) {
                    issues.push(`Компоненты "${sourceComponent.name}" и "${targetComponent.name}" несовместимы.`)
                  }
                }
              } catch (error) {
                console.error('Error checking component pair compatibility:', error)
              }
            }
          }
          
          this.compatibility = {
            compatible: false,
            issues: issues.length > 0 ? issues : ['Обнаружены проблемы совместимости между компонентами.']
          }
        }
        
        return this.compatibility
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to check compatibility'
        this.compatibility = {
          compatible: false,
          issues: ['Ошибка при проверке совместимости: ' + this.error]
        }
        return this.compatibility
      } finally {
        this.isLoading = false
      }
    },
    
    // Вспомогательный метод для получения компонента по ID
    getComponentById(id: number): Component | null {
      for (const type in this.selectedComponents) {
        const component = this.selectedComponents[type as keyof typeof this.selectedComponents]
        if (component && component.id === id) {
          return component
        }
      }
      return null
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