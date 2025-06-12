import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'
import { useCartStore } from './cart'
import { useAuthStore } from './auth'

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
  savedConfigurations: any[]
  currentConfiguration: any | null
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
    error: null,
    savedConfigurations: [],
    currentConfiguration: null
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
    },
    getSavedConfigurations: (state) => state.savedConfigurations,
    getCurrentConfiguration: (state) => state.currentConfiguration
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
    
    async saveConfiguration(name: string, description: string = '', category: string = '') {
      const componentIds = this.getSelectedComponentIds
      
      console.log('Saving configuration with name:', name)
      console.log('Description:', description)
      console.log('Category:', category)
      console.log('Component IDs:', componentIds)
      
      if (componentIds.length === 0) {
        this.error = 'Configuration is empty'
        console.error('Configuration is empty')
        return false
      }
      
      this.isLoading = true
      this.error = null
      
      try {
        // Получаем пользователя из хранилища авторизации
        const authStore = useAuthStore()
        const user = authStore.getUser
        
        console.log('User from authStore:', user)
        
        if (!user || !user.id) {
          this.error = 'User not authenticated'
          console.error('User not authenticated')
          return false
        }
        
        const userId = user.id
        
        // Создаем конфигурацию с компонентами сразу через endpoint /configurations/with-components
        const request = {
          userId: userId,
          name: name,
          description: description,
          category: category,
          componentIds: componentIds
        }
        
        console.log('Sending request to /configurations/with-components:', request)
        
        // Используем endpoint для создания конфигурации с компонентами
        const response = await apiClient.post('/configurations/with-components', request)
        
        console.log('Response from /configurations/with-components:', response.data)
        
        if (!response.data || !response.data.id) {
          this.error = 'Failed to create configuration'
          console.error('Failed to create configuration, response data:', response.data)
          return false
        }
        
        // После успешного создания, получаем обновленную конфигурацию
        const configId = response.data.id
        const updatedConfigResponse = await apiClient.get(`/configurations/${configId}`)
        
        console.log('Updated configuration:', updatedConfigResponse.data)
        
        return updatedConfigResponse.data
      } catch (error: any) {
        console.error('Error saving configuration:', error)
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
    },
    
    async getUserConfigurations() {
      const authStore = useAuthStore()
      const user = authStore.getUser
      
      if (!user || !user.id) {
        this.error = 'User not authenticated'
        return false
      }
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await apiClient.get(`/configurations/user/${user.id}`)
        this.savedConfigurations = response.data
        return this.savedConfigurations
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch user configurations'
        return null
      } finally {
        this.isLoading = false
      }
    },
    
    async getConfigurationDetails(configId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Getting configuration details for ID:', configId)
        const response = await apiClient.get(`/configurations/${configId}`)
        const config = response.data
        console.log('Configuration details received:', config)
        
        // Проверяем наличие компонентов
        if (config && config.components) {
          // Убедимся, что у каждого компонента есть необходимые поля
          config.components = config.components.map((component: any) => {
            if (!component.name && component.productName) {
              component.name = component.productName
            }
            return component
          })
        }
        
        this.currentConfiguration = config
        return this.currentConfiguration
      } catch (error: any) {
        console.error('Error fetching configuration details:', error)
        this.error = error.response?.data?.message || 'Failed to fetch configuration details'
        return null
      } finally {
        this.isLoading = false
      }
    },
    
    // Добавляем метод для загрузки информации о продукте по ID
    async fetchProductById(productId: number): Promise<Component | null> {
      try {
        console.log('Fetching product info for ID:', productId)
        const response = await apiClient.get(`/products/${productId}`)
        const product = response.data
        
        if (!product) {
          console.warn('Product not found for ID:', productId)
          return null
        }
        
        console.log('Product info received:', product)
        
        // Преобразуем в формат Component
        const component: Component = {
          id: product.id,
          name: product.title || product.name || `Product ${product.id}`,
          type: product.componentType || 'UNKNOWN',
          price: product.price || 0,
          description: product.description || '',
          manufacturer: product.manufacturer?.name || 'Неизвестный производитель',
          specifications: product.specifications || {}
        }
        
        return component
      } catch (error) {
        console.error('Error fetching product info:', error)
        return null
      }
    },
    
    // Обновляем метод loadConfigurationToConfigurator
    async loadConfigurationToConfigurator(configId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Loading configuration with ID:', configId)
        const response = await apiClient.get(`/configurations/${configId}`)
        const config = response.data
        console.log('Loaded configuration:', config)
        
        // Clear current configuration
        this.clearConfiguration()
        
        // Проверяем наличие компонентов в конфигурации
        if (config) {
          console.log('Processing configuration:', config)
          
          // Обработка компонентов из массива components
          if (config.components && config.components.length > 0) {
            console.log('Configuration has components array:', config.components)
            for (const component of config.components) {
              console.log('Processing component:', component)
              if (!component) {
                console.warn('Component is undefined, skipping')
                continue
              }
              
              const componentType = this.mapComponentTypeToStore(component.type)
              console.log('Mapped component type:', component.type, 'to', componentType)
              
              if (componentType) {
                // Create a proper component object
                const componentObj: Component = {
                  id: component.productId || component.id,
                  name: component.productName || 'Unknown component',
                  type: component.type,
                  price: component.price || 0,
                  description: '',
                  manufacturer: component.manufacturerName || 'Неизвестный производитель',
                  specifications: component.specs || {}
                }
                
                console.log('Adding component to configurator:', componentObj)
                this.selectedComponents[componentType] = componentObj
              } else {
                console.warn('Could not map component type:', component.type)
              }
            }
          } else {
            console.warn('Configuration has no components array or it is empty')
          }
          
          // Проверяем наличие отдельных полей для компонентов (для обратной совместимости)
          const componentFields = [
            { field: 'cpuId', type: 'CPU' },
            { field: 'motherboardId', type: 'MB' },
            { field: 'gpuId', type: 'GPU' },
            { field: 'psuId', type: 'PSU' },
            { field: 'caseId', type: 'CASE' }
          ]
          
          for (const { field, type } of componentFields) {
            if (config[field] && !this.selectedComponents[type]) {
              console.log(`Found component ID in field ${field}:`, config[field])
              
              // Загружаем информацию о продукте по ID
              const productId = config[field]
              const productInfo = await this.fetchProductById(productId)
              
              if (productInfo) {
                console.log(`Adding component from field ${field} to configurator:`, productInfo)
                this.selectedComponents[type] = productInfo
              } else {
                // Если не удалось загрузить информацию, создаем заглушку
                const componentObj: Component = {
                  id: productId,
                  name: `Component ${productId}`,
                  type,
                  price: 0,
                  description: '',
                  manufacturer: '',
                  specifications: {}
                }
                
                console.log(`Adding placeholder component for ${field} to configurator:`, componentObj)
                this.selectedComponents[type] = componentObj
              }
            }
          }
          
          // Обработка массивов ramIds и storageIds
          if (config.ramIds && config.ramIds.length > 0) {
            const ramId = config.ramIds[0] // Берем первый элемент для простоты
            console.log('Found RAM ID:', ramId)
            
            if (!this.selectedComponents['RAM']) {
              const ramInfo = await this.fetchProductById(ramId)
              
              if (ramInfo) {
                console.log('Adding RAM component to configurator:', ramInfo)
                this.selectedComponents['RAM'] = ramInfo
              } else {
                // Заглушка
                const ramComponent: Component = {
                  id: ramId,
                  name: `RAM ${ramId}`,
                  type: 'RAM',
                  price: 0,
                  description: '',
                  manufacturer: '',
                  specifications: {}
                }
                
                console.log('Adding placeholder RAM component to configurator:', ramComponent)
                this.selectedComponents['RAM'] = ramComponent
              }
            }
          }
          
          if (config.storageIds && config.storageIds.length > 0) {
            const storageId = config.storageIds[0] // Берем первый элемент для простоты
            console.log('Found STORAGE ID:', storageId)
            
            if (!this.selectedComponents['STORAGE']) {
              const storageInfo = await this.fetchProductById(storageId)
              
              if (storageInfo) {
                console.log('Adding STORAGE component to configurator:', storageInfo)
                this.selectedComponents['STORAGE'] = storageInfo
              } else {
                // Заглушка
                const storageComponent: Component = {
                  id: storageId,
                  name: `Storage ${storageId}`,
                  type: 'STORAGE',
                  price: 0,
                  description: '',
                  manufacturer: '',
                  specifications: {}
                }
                
                console.log('Adding placeholder STORAGE component to configurator:', storageComponent)
                this.selectedComponents['STORAGE'] = storageComponent
              }
            }
          }
        } else {
          console.warn('Configuration is undefined')
        }
        
        return true
      } catch (error: any) {
        console.error('Error loading configuration:', error)
        this.error = error.response?.data?.message || 'Failed to load configuration'
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    // Helper method to map component types from API to store
    mapComponentTypeToStore(type: string) {
      console.log('Mapping component type from API:', type)
      
      if (!type) {
        console.warn('Component type is undefined or null')
        return null
      }
      
      const typeMapping: Record<string, string> = {
        'CPU': 'CPU',
        'GPU': 'GPU',
        'RAM': 'RAM',
        'MB': 'MB',
        'MOTHERBOARD': 'MB',
        'STORAGE': 'STORAGE',
        'PSU': 'PSU',
        'CASE': 'CASE',
        'COOLER': 'COOLER'
      }
      
      const result = typeMapping[type] || null
      console.log('Mapped to store type:', result)
      return result
    },
    
    async deleteConfiguration(configId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        await apiClient.delete(`/configurations/${configId}`)
        // Update the saved configurations list
        this.savedConfigurations = this.savedConfigurations.filter(config => config.id !== configId)
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to delete configuration'
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    // Добавляем метод для публикации/снятия с публикации конфигурации
    async toggleConfigurationPublication(configId: number) {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Toggling configuration publication status for ID:', configId)
        const response = await apiClient.post(`/configurations/${configId}/toggle-publication`, {})
        console.log('Publication status toggled:', response.data)
        return response.data
      } catch (error: any) {
        console.error('Error toggling configuration publication:', error)
        this.error = error.response?.data?.message || 'Failed to toggle configuration publication'
        throw new Error(this.error || 'Unknown error')
      } finally {
        this.isLoading = false
      }
    }
  }
}) 