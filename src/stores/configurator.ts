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
  selectedComponents: {
    CPU: Component | null,
    GPU: Component | null,
    RAM: Component[],
    MB: Component | null,
    STORAGE: Component[],
    PSU: Component | null,
    CASE: Component | null,
    COOLER: Component | null
  }
  compatibility: {
    compatible: boolean
    issues: string[]
  } | null
  isLoading: boolean
  error: string | null
  savedConfigurations: any[]
  currentConfiguration: any | null
  isFullBuild: boolean
  peripherals: {
    keyboard: Component[],
    mouse: Component[],
    monitor: Component[],
    headset: Component[],
    speakers: Component[],
    mousepad: Component[],
    microphone: Component[]
  }
}

export const useConfiguratorStore = defineStore('configurator', {
  state: (): ConfiguratorState => ({
    selectedComponents: {
      CPU: null,
      GPU: null,
      RAM: [],
      MB: null,
      STORAGE: [],
      PSU: null,
      CASE: null,
      COOLER: null
    },
    compatibility: null,
    isLoading: false,
    error: null,
    savedConfigurations: [],
    currentConfiguration: null,
    isFullBuild: false,
    peripherals: {
      keyboard: [],
      mouse: [],
      monitor: [],
      headset: [],
      speakers: [],
      mousepad: [],
      microphone: []
    }
  }),
  
  getters: {
    getSelectedComponents: (state) => state.selectedComponents,
    getCompatibility: (state) => state.compatibility,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getIsFullBuild: (state) => state.isFullBuild,
    getPeripherals: (state) => state.peripherals,
    getTotalPrice: (state) => {
      let total = 0;
      
      // Суммируем цены обычных компонентов
      for (const type in state.selectedComponents) {
        const component = state.selectedComponents[type as keyof typeof state.selectedComponents];
        if (component === null) continue;
        
        if (Array.isArray(component)) {
          // Для массивов компонентов (RAM, STORAGE)
          total += component.reduce((sum, item) => sum + (item.price || 0), 0);
        } else {
          // Для одиночных компонентов
          total += component.price || 0;
        }
      }
      
      // Если включена полная сборка, добавляем периферию
      if (state.isFullBuild) {
        for (const type in state.peripherals) {
          const peripherals = state.peripherals[type as keyof typeof state.peripherals];
          total += peripherals.reduce((sum, item) => sum + (item.price || 0), 0);
        }
      }
      
      return total;
    },
    getSelectedComponentIds: (state) => {
      const ids: number[] = [];
      
      // Собираем ID обычных компонентов
      for (const type in state.selectedComponents) {
        const component = state.selectedComponents[type as keyof typeof state.selectedComponents];
        if (component === null) continue;
        
        if (Array.isArray(component)) {
          // Для массивов компонентов (RAM, STORAGE)
          component.forEach(item => ids.push(item.id));
        } else {
          // Для одиночных компонентов
          ids.push(component.id);
        }
      }
      
      // Если включена полная сборка, добавляем периферию
      if (state.isFullBuild) {
        for (const type in state.peripherals) {
          const peripherals = state.peripherals[type as keyof typeof state.peripherals];
          peripherals.forEach(item => ids.push(item.id));
        }
      }
      
      return ids;
    },
    getSavedConfigurations: (state) => state.savedConfigurations,
    getCurrentConfiguration: (state) => state.currentConfiguration
  },
  
  actions: {
    // Метод для добавления компонента
    addComponent(type: string, component: Component) {
      console.log(`Adding component of type: ${type}`);
      
      // Преобразуем тип в нижний регистр для унификации
      const lowerType = type.toLowerCase();
      
      try {
        if (type === 'RAM' || type === 'STORAGE') {
          // Для RAM и STORAGE добавляем в массив
          (this.selectedComponents[type as 'RAM' | 'STORAGE'] as Component[]).push(component);
          console.log(`Added ${type} component to array`);
        } else if (type in this.selectedComponents) {
          // Для остальных типов заменяем текущий компонент
          (this.selectedComponents as any)[type] = component;
          console.log(`Set ${type} component`);
        } else if (lowerType in this.peripherals) {
          // Для периферии добавляем в соответствующий массив
          (this.peripherals as any)[lowerType].push(component);
          console.log(`Added peripheral of type ${lowerType}`);
          
          // Если добавляется периферия, включаем режим полной сборки
          if (!this.isFullBuild) {
            this.isFullBuild = true;
            console.log('Enabled full build mode');
          }
        } else {
          console.error(`Unknown component type: ${type}`);
          throw new Error(`Unknown component type: ${type}`);
        }
        
        this.checkCompatibility();
      } catch (error) {
        console.error(`Error adding component of type ${type}:`, error);
        throw error;
      }
    },
    
    // Метод для удаления компонента
    removeComponent(type: string, componentId?: number) {
      // Преобразуем тип в нижний регистр для периферии
      const lowerType = type.toLowerCase();
      
      if (type === 'RAM' || type === 'STORAGE') {
        if (componentId) {
          // Удаляем конкретный компонент по ID
          const components = this.selectedComponents[type as 'RAM' | 'STORAGE'];
          const index = components.findIndex(c => c.id === componentId);
          if (index !== -1) {
            components.splice(index, 1);
          }
        } else {
          // Если ID не указан, очищаем весь массив
          this.selectedComponents[type as 'RAM' | 'STORAGE'] = [];
        }
      } else if (type in this.selectedComponents) {
        // Для остальных типов устанавливаем null
        (this.selectedComponents as any)[type] = null;
      } else if (lowerType in this.peripherals && componentId) {
        // Для периферии удаляем по ID
        const peripherals = (this.peripherals as any)[lowerType];
        const index = peripherals.findIndex((p: Component) => p.id === componentId);
        if (index !== -1) {
          peripherals.splice(index, 1);
        }
      }
      
      this.checkCompatibility();
    },
    
    // Метод для переключения режима полной сборки
    toggleFullBuild() {
      this.isFullBuild = !this.isFullBuild;
    },
    
    // Обновляем метод selectComponent для обратной совместимости
    selectComponent(type: string, component: Component | null) {
      // Преобразуем тип в нижний регистр для периферии
      const lowerType = type.toLowerCase();
      
      if (component === null) {
        this.removeComponent(type);
      } else {
        if (type === 'RAM' || type === 'STORAGE') {
          // Для RAM и STORAGE сначала очищаем массив, затем добавляем новый компонент
          // Это для обратной совместимости
          this.selectedComponents[type as 'RAM' | 'STORAGE'] = [component];
        } else if (type in this.selectedComponents) {
          // Для остальных типов заменяем текущий компонент
          (this.selectedComponents as any)[type] = component;
        } else if (lowerType in this.peripherals) {
          // Для периферии сначала очищаем, затем добавляем
          (this.peripherals as any)[lowerType] = [component];
        }
      }
      
      this.checkCompatibility();
    },
    
    clearConfiguration() {
      // Очищаем основные компоненты
      this.selectedComponents.CPU = null;
      this.selectedComponents.GPU = null;
      this.selectedComponents.RAM = [];
      this.selectedComponents.MB = null;
      this.selectedComponents.STORAGE = [];
      this.selectedComponents.PSU = null;
      this.selectedComponents.CASE = null;
      this.selectedComponents.COOLER = null;
      
      // Очищаем периферию
      for (const type in this.peripherals) {
        (this.peripherals as any)[type] = [];
      }
      
      this.compatibility = null;
      this.isFullBuild = false;
    },
    
    async checkCompatibility() {
      const componentIds = this.getSelectedComponentIds;
      
      if (componentIds.length < 2) {
        this.compatibility = {
          compatible: true,
          issues: []
        };
        return this.compatibility;
      }
      
      this.isLoading = true;
      this.error = null;
      
      try {
        // Получаем первый компонент как основу для проверки
        const firstComponentId = componentIds[0];
        // Остальные компоненты как существующие
        const otherComponentIds = componentIds.slice(1);
        
        // Используем API проверки конфигурации
        const response = await apiClient.post(
          `/compatibility/check-configuration?newComponentId=${firstComponentId}`, 
          otherComponentIds
        );
        
        // Если компоненты совместимы
        if (response.data === true) {
          this.compatibility = {
            compatible: true,
            issues: []
          };
        } else {
          // Если не совместимы, нужно получить причины несовместимости
          // Для этого проверяем каждую пару компонентов
          const issues: string[] = [];
          
          for (let i = 0; i < componentIds.length; i++) {
            for (let j = i + 1; j < componentIds.length; j++) {
              try {
                const checkResponse = await apiClient.post(
                  `/compatibility/check?sourceId=${componentIds[i]}&targetId=${componentIds[j]}`, 
                  {}
                );
                
                if (checkResponse.data === false) {
                  const sourceComponent = this.getComponentById(componentIds[i]);
                  const targetComponent = this.getComponentById(componentIds[j]);
                  
                  if (sourceComponent && targetComponent) {
                    issues.push(`Компоненты "${sourceComponent.name}" и "${targetComponent.name}" несовместимы.`);
                  }
                }
              } catch (error) {
                console.error('Ошибка при проверке совместимости:', error);
              }
            }
          }
          
          this.compatibility = {
            compatible: false,
            issues: issues.length > 0 ? issues : ['Обнаружены проблемы совместимости между компонентами.']
          };
        }
        
        return this.compatibility;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to check compatibility';
        this.compatibility = {
          compatible: false,
          issues: ['Ошибка при проверке совместимости: ' + this.error]
        };
        return this.compatibility;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Вспомогательный метод для получения компонента по ID
    getComponentById(id: number): Component | null {
      // Проверяем в основных компонентах
      for (const type in this.selectedComponents) {
        const component = this.selectedComponents[type as keyof typeof this.selectedComponents];
        if (!component) continue;
        
        if (Array.isArray(component)) {
          const found = component.find(c => c.id === id);
          if (found) return found;
        } else if (component.id === id) {
          return component;
        }
      }
      
      // Проверяем в периферии
      for (const type in this.peripherals) {
        const components = this.peripherals[type as keyof typeof this.peripherals];
        const found = components.find(c => c.id === id);
        if (found) return found;
      }
      
      return null;
    },
    
    async saveConfiguration(name: string, description: string = '', category: string = '') {
      const componentIds = this.getSelectedComponentIds;
      
      console.log('Saving configuration with name:', name);
      console.log('Description:', description);
      console.log('Category:', category);
      console.log('Component IDs:', componentIds);
      
      if (componentIds.length === 0) {
        this.error = 'Configuration is empty';
        console.error('Configuration is empty');
        return false;
      }
      
      this.isLoading = true;
      this.error = null;
      
      try {
        // Получаем пользователя из хранилища авторизации
        const authStore = useAuthStore();
        const user = authStore.getUser;
        
        console.log('User from authStore:', user);
        
        if (!user || !user.id) {
          this.error = 'User not authenticated';
          console.error('User not authenticated');
          return false;
        }
        
        const userId = user.id;
        
        // Создаем конфигурацию с компонентами сразу через endpoint /configurations/with-components
        const request = {
          userId: userId,
          name: name,
          description: description,
          category: category,
          componentIds: componentIds
        };
        
        console.log('Sending request to /configurations/with-components:', request);
        
        // Используем endpoint для создания конфигурации с компонентами
        const response = await apiClient.post('/configurations/with-components', request);
        
        console.log('Response from /configurations/with-components:', response.data);
        
        if (!response.data || !response.data.id) {
          this.error = 'Failed to create configuration';
          console.error('Failed to create configuration, response data:', response.data);
          return false;
        }
        
        // После успешного создания, получаем обновленную конфигурацию
        const configId = response.data.id;
        const updatedConfigResponse = await apiClient.get(`/configurations/${configId}`);
        
        console.log('Updated configuration:', updatedConfigResponse.data);
        
        return updatedConfigResponse.data;
      } catch (error: any) {
        console.error('Error saving configuration:', error);
        this.error = error.response?.data?.message || 'Failed to save configuration';
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    
    async addConfigurationToCart() {
      const cartStore = useCartStore();
      let success = true;
      
      // Добавляем основные компоненты
      for (const type in this.selectedComponents) {
        const component = this.selectedComponents[type as keyof typeof this.selectedComponents];
        if (!component) continue;
        
        if (Array.isArray(component)) {
          // Для массивов компонентов (RAM, STORAGE)
          for (const item of component) {
            const result = await cartStore.addToCart(item.id, 1);
            if (!result) {
              success = false;
            }
          }
        } else {
          // Для одиночных компонентов
          const result = await cartStore.addToCart(component.id, 1);
          if (!result) {
            success = false;
          }
        }
      }
      
      // Если включена полная сборка, добавляем периферию
      if (this.isFullBuild) {
        for (const type in this.peripherals) {
          const peripherals = this.peripherals[type as keyof typeof this.peripherals];
          for (const item of peripherals) {
            const result = await cartStore.addToCart(item.id, 1);
            if (!result) {
              success = false;
            }
          }
        }
      }
      
      return success;
    },
    
    async getUserConfigurations() {
      const authStore = useAuthStore();
      const user = authStore.getUser;
      
      if (!user || !user.id) {
        this.error = 'User not authenticated';
        return false;
      }
      
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await apiClient.get(`/configurations/user/${user.id}`);
        this.savedConfigurations = response.data;
        return this.savedConfigurations;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch user configurations';
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getConfigurationDetails(configId: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Getting configuration details for ID:', configId);
        const response = await apiClient.get(`/configurations/${configId}`);
        const config = response.data;
        console.log('Configuration details received:', config);
        
        // Проверяем наличие компонентов
        if (config && config.components) {
          // Убедимся, что у каждого компонента есть необходимые поля
          config.components = config.components.map((component: any) => {
            if (!component.name && component.productName) {
              component.name = component.productName;
            }
            return component;
          });
        }
        
        this.currentConfiguration = config;
        return this.currentConfiguration;
      } catch (error: any) {
        console.error('Error fetching configuration details:', error);
        this.error = error.response?.data?.message || 'Failed to fetch configuration details';
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Добавляем метод для загрузки информации о продукте по ID
    async fetchProductById(productId: number): Promise<Component | null> {
      try {
        console.log('Fetching product info for ID:', productId);
        const response = await apiClient.get(`/products/${productId}`);
        const product = response.data;
        
        if (!product) {
          console.warn('Product not found for ID:', productId);
          return null;
        }
        
        console.log('Product info received:', product);
        
        // Преобразуем в формат Component
        const component: Component = {
          id: product.id,
          name: product.title || product.name || `Product ${product.id}`,
          type: product.componentType || 'UNKNOWN',
          price: product.price || 0,
          description: product.description || '',
          manufacturer: product.manufacturer?.name || 'Неизвестный производитель',
          specifications: product.specifications || {}
        };
        
        return component;
      } catch (error) {
        console.error('Error fetching product info:', error);
        return null;
      }
    },
    
    // Helper method to map component types from API to store
    mapComponentTypeToStore(type: string): string | null {
      if (!type) {
        return null;
      }
      
      // Простое преобразование для материнской платы
      if (type === 'MOTHERBOARD') {
        return 'MB';
      }
      
      // Для периферии используем нижний регистр
      const peripheralTypes = ['keyboard', 'mouse', 'monitor', 'headset', 'speakers', 'mousepad', 'microphone'];
      
      // Приводим тип к нижнему регистру
      const lowerType = type.toLowerCase();
      
      // Проверяем прямое совпадение
      if (peripheralTypes.includes(lowerType)) {
        return lowerType;
      }
      
      // Проверяем множественное число (keyboards -> keyboard)
      if (lowerType.endsWith('s')) {
        const singularForm = lowerType.slice(0, -1);
        if (peripheralTypes.includes(singularForm)) {
          return singularForm;
        }
      }
      
      // Для остальных компонентов возвращаем как есть
      return type;
    },
    
    // Обновляем метод loadConfigurationToConfigurator
    async loadConfigurationToConfigurator(configId: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Loading configuration with ID:', configId);
        const response = await apiClient.get(`/configurations/${configId}`);
        const config = response.data;
        console.log('Loaded configuration:', config);
        
        // Clear current configuration
        this.clearConfiguration();
        
        // Проверяем наличие компонентов в конфигурации
        if (config) {
          console.log('Processing configuration:', config);
          
          // Обработка компонентов из массива components
          if (config.components && config.components.length > 0) {
            console.log('Configuration has components array:', config.components);
            
            // Обрабатываем каждый компонент
            for (const component of config.components) {
              if (!component) continue;
              
              // Определяем тип компонента
              let componentType = null;
              
              // Сначала проверяем обычные компоненты ПК
              if (component.type) {
                componentType = component.type;
              } 
              // Затем проверяем периферию
              else if (component.peripheralType) {
                componentType = component.peripheralType.toLowerCase();
              }
              
              if (!componentType) {
                console.warn('Component has no type information:', component);
                continue;
              }
              
              const storeType = this.mapComponentTypeToStore(componentType);
              
              if (!storeType) {
                console.warn('Could not map component type:', componentType);
                continue;
              }
              
              // Создаем объект компонента для хранилища
              const componentObj = {
                id: component.productId || component.id,
                name: component.productName || 'Unknown component',
                type: component.type,
                price: component.price || 0,
                description: '',
                manufacturer: component.manufacturerName || 'Неизвестный производитель',
                specifications: component.specs || {}
              };
              
              // Проверяем, является ли это тип массивом компонентов или одиночным компонентом
              if (storeType === 'RAM' || storeType === 'STORAGE') {
                // Для RAM и STORAGE добавляем в массив
                this.selectedComponents[storeType].push(componentObj);
              } else if (storeType in this.selectedComponents) {
                // Для остальных типов устанавливаем значение
                (this.selectedComponents as any)[storeType] = componentObj;
              } else if (storeType in this.peripherals) {
                // Для периферии добавляем в соответствующий массив
                (this.peripherals as any)[storeType].push(componentObj);
                
                // Включаем режим полной сборки если добавлена периферия
                if (!this.isFullBuild) {
                  this.isFullBuild = true;
                }
              } else {
                console.warn('Unknown store type:', storeType);
              }
            }
          } else {
            console.warn('Configuration has no components array or it is empty');
          }
          
          // Обработка отдельных полей для обратной совместимости
          // Обрабатываем RAM
          if (config.ramIds && config.ramIds.length > 0) {
            // Если RAM не был загружен из массива компонентов
            if (this.selectedComponents.RAM.length === 0) {
              for (const ramId of config.ramIds) {
                const ramInfo = await this.fetchProductById(ramId);
                if (ramInfo) {
                  this.selectedComponents.RAM.push(ramInfo);
                }
              }
            }
          }
          
          // Обрабатываем STORAGE
          if (config.storageIds && config.storageIds.length > 0) {
            // Если STORAGE не был загружен из массива компонентов
            if (this.selectedComponents.STORAGE.length === 0) {
              for (const storageId of config.storageIds) {
                const storageInfo = await this.fetchProductById(storageId);
                if (storageInfo) {
                  this.selectedComponents.STORAGE.push(storageInfo);
                }
              }
            }
          }
          
          // Обрабатываем периферию
          const peripheralFields = {
            monitorIds: 'monitor',
            keyboardIds: 'keyboard',
            mouseIds: 'mouse',
            headsetIds: 'headset',
            speakersIds: 'speakers',
            mousepadIds: 'mousepad',
            microphoneIds: 'microphone'
          };
          
          // Проверяем наличие периферии и загружаем если есть
          for (const [field, peripheralType] of Object.entries(peripheralFields)) {
            if (config[field] && config[field].length > 0) {
              // Если этот тип периферии не был загружен из массива компонентов
              if ((this.peripherals as any)[peripheralType].length === 0) {
                for (const peripheralId of config[field]) {
                  const peripheralInfo = await this.fetchProductById(peripheralId);
                  if (peripheralInfo) {
                    (this.peripherals as any)[peripheralType].push(peripheralInfo);
                    
                    // Включаем режим полной сборки если добавлена периферия
                    if (!this.isFullBuild) {
                      this.isFullBuild = true;
                    }
                  }
                }
              }
            }
          }
        }
        
        return true;
      } catch (error: any) {
        console.error('Error loading configuration:', error);
        this.error = error.response?.data?.message || 'Failed to load configuration';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteConfiguration(configId: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        await apiClient.delete(`/configurations/${configId}`);
        // Update the saved configurations list
        this.savedConfigurations = this.savedConfigurations.filter(config => config.id !== configId);
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to delete configuration';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Добавляем метод для публикации/снятия с публикации конфигурации
    async toggleConfigurationPublication(configId: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Toggling configuration publication status for ID:', configId);
        const response = await apiClient.post(`/configurations/${configId}/toggle-publication`, {});
        console.log('Publication status toggled:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Error toggling configuration publication:', error);
        this.error = error.response?.data?.message || 'Failed to toggle configuration publication';
        throw new Error(this.error || 'Unknown error');
      } finally {
        this.isLoading = false;
      }
    }
  }
});