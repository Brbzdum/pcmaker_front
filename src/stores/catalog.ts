import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'
import { useCategoryStore } from '@/stores/category'

interface Component {
  id: number
  name: string
  type: string
  price: number
  description: string
  manufacturer: string
  specifications: Record<string, any>
  imageUrl?: string
  rating?: number
  categoryId?: number
  category?: {
    id: number
    name: string
    slug: string
    isPeripheral?: boolean
    isPcComponent?: boolean
  }
  isPeripheral?: boolean
}

interface Filter {
  type?: string[]
  manufacturer?: string[]
  priceMin?: number
  priceMax?: number
  categoryIds?: number[]
  searchQuery?: string
  componentType?: string
  compatibleIds?: number[]
}

interface CatalogState {
  components: Component[]
  filteredComponents: Component[]
  filter: Filter
  manufacturers: string[]
  componentTypes: string[]
  peripheralTypes: string[]
  isLoading: boolean
  error: string | null
}

export const useCatalogStore = defineStore('catalog', {
  state: (): CatalogState => ({
    components: [],
    filteredComponents: [],
    filter: {},
    manufacturers: [],
    componentTypes: [],
    peripheralTypes: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getComponents: (state) => state.components,
    getFilteredComponents: (state) => state.filteredComponents,
    getFilter: (state) => state.filter,
    getManufacturers: (state) => state.manufacturers,
    getComponentTypes: (state) => state.componentTypes,
    getPeripheralTypes: (state) => state.peripheralTypes,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchComponents() {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/products')
        this.components = response.data
        this.filteredComponents = response.data
        
        // Extract unique manufacturers
        this.manufacturers = [...new Set(this.components.map(c => c.manufacturer))]
        
        // Получаем списки типов компонентов и периферии
        const componentTypes = ['CPU', 'GPU', 'RAM', 'MB', 'STORAGE', 'PSU', 'CASE', 'COOLER']
        
        // Отмечаем периферию на основе категории
        this.components = this.components.map(component => {
          const isPeripheral = component.category && component.category.isPeripheral || false;
          
          // Если это периферия, но нет slug, логируем предупреждение
          if (isPeripheral && component.category && (!component.category.slug || component.category.slug === '')) {
            console.warn(`Peripheral item without slug: ${component.name}, category: ${component.category.name}`);
          }
          
          return {
          ...component,
            isPeripheral
          };
        })
        
        // Выделяем уникальные типы компонентов
        this.componentTypes = [...new Set(this.components
          .filter(c => componentTypes.includes(c.type))
          .map(c => c.type))]
          
        // Получаем типы периферии из API
        try {
          const peripheralTypesResponse = await apiClient.get('/peripherals/types')
          this.peripheralTypes = peripheralTypesResponse.data
          console.log('Peripheral types loaded from API:', this.peripheralTypes)
        } catch (error) {
          console.error('Failed to fetch peripheral types from API:', error)
          // Если не удалось загрузить типы периферии из API, получаем их из категорий
          this.loadPeripheralTypesFromCategories()
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch components'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchComponentsByType(type: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/products/component-type/${type}`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || `Failed to fetch ${type} components`
        return []
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchPeripheralsByType(type: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/peripherals/category/${type.toLowerCase()}`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || `Failed to fetch ${type} peripherals`
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchComponentById(id: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/products/${id}`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch component details'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchComponentsByCategory(categoryId: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/products/category/${categoryId}`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch components by category'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async searchComponents(query: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/products/search?query=${encodeURIComponent(query)}`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to search components'
        return []
      } finally {
        this.isLoading = false
      }
    },
    
    // Новый метод для фильтрации совместимых компонентов
    async filterCompatibleComponents(componentIds: number[]) {
      if (componentIds.length === 0) return;
      
      this.isLoading = true;
      
      try {
        // Получаем первый компонент как основу для проверки
        const sourceId = componentIds[0];
        const componentType = this.filter.componentType;
        
        if (!componentType) return;
        
        // Вызываем API для получения совместимых компонентов
        const response = await apiClient.get(
          `/compatibility/compatible/${sourceId}?targetType=${componentType}`
        );
        
        // Получаем ID совместимых компонентов
        const compatibleIds = response.data.map((item: any) => item.id);
        
        if (compatibleIds.length > 0) {
          this.filter = {
            ...this.filter,
            compatibleIds
          };
          this.applyFilter();
        } else {
          // Если нет совместимых компонентов, показываем сообщение
          this.error = 'Не найдено совместимых компонентов для выбранной конфигурации';
        }
      } catch (error: any) {
        console.error('Error fetching compatible components:', error);
        this.error = error.response?.data?.message || 'Ошибка при получении совместимых компонентов';
      } finally {
        this.isLoading = false;
      }
    },

    // Новый метод для фильтрации компонентов с более удобным интерфейсом
    filterComponents(filter: {
      manufacturers?: string[],
      categories?: number[],
      priceMin?: number | null,
      priceMax?: number | null,
      searchQuery?: string,
      componentType?: string | null
    }) {
      this.filter = {
        manufacturer: filter.manufacturers?.length ? filter.manufacturers : undefined,
        categoryIds: filter.categories?.length ? filter.categories : undefined,
        priceMin: filter.priceMin !== null ? filter.priceMin : undefined,
        priceMax: filter.priceMax !== null ? filter.priceMax : undefined,
        searchQuery: filter.searchQuery || undefined,
        componentType: filter.componentType || undefined
      };
      
      this.applyFilter();
    },

    setFilter(filter: Filter) {
      this.filter = { ...this.filter, ...filter }
      this.applyFilter()
    },

    clearFilter() {
      this.filter = {}
      this.filteredComponents = this.components
    },

    applyFilter() {
      let filtered = this.components
      console.log(`Starting filtering with ${filtered.length} components`);

      // Filter by specific component type
      if (this.filter.componentType) {
        filtered = filtered.filter(c => c.type === this.filter.componentType)
        console.log(`After filtering by component type ${this.filter.componentType}: ${filtered.length} components`);
      }

      // Filter by category IDs
      if (this.filter.categoryIds && this.filter.categoryIds.length > 0) {
        console.log(`Filtering by category IDs: ${this.filter.categoryIds}`);
        
        filtered = filtered.filter(c => {
          // Проверяем, есть ли у компонента categoryId
          if (c.categoryId && this.filter.categoryIds!.includes(c.categoryId)) {
            console.log(`Matched by categoryId: ${c.name}, categoryId: ${c.categoryId}`);
            return true;
          }
          
          // Проверяем, есть ли у компонента category.id
          if (c.category && c.category.id && this.filter.categoryIds!.includes(c.category.id)) {
            console.log(`Matched by category.id: ${c.name}, category.id: ${c.category.id}`);
            return true;
          }
          
          return false;
        });
        
        console.log(`After filtering by category IDs: ${filtered.length} components`);
      }

      // Filter by compatible component IDs (from compatibility check)
      if (this.filter.compatibleIds && this.filter.compatibleIds.length > 0) {
        filtered = filtered.filter(c => this.filter.compatibleIds!.includes(c.id))
        console.log(`After filtering by compatibility: ${filtered.length} components`);
      }

      // Filter by manufacturer
      if (this.filter.manufacturer && this.filter.manufacturer.length > 0) {
        filtered = filtered.filter(c => this.filter.manufacturer!.includes(c.manufacturer))
        console.log(`After filtering by manufacturer: ${filtered.length} components`);
      }

      // Filter by price range
      if (this.filter.priceMin !== undefined) {
        filtered = filtered.filter(c => c.price >= this.filter.priceMin!)
        console.log(`After filtering by min price: ${filtered.length} components`);
      }

      if (this.filter.priceMax !== undefined) {
        filtered = filtered.filter(c => c.price <= this.filter.priceMax!)
        console.log(`After filtering by max price: ${filtered.length} components`);
      }

      // Filter by search query
      if (this.filter.searchQuery) {
        const query = this.filter.searchQuery.toLowerCase()
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.description.toLowerCase().includes(query) ||
          c.manufacturer.toLowerCase().includes(query) ||
          c.type.toLowerCase().includes(query)
        )
        console.log(`After filtering by search query: ${filtered.length} components`);
      }

      this.filteredComponents = filtered
      console.log(`Final filtered components: ${filtered.length}`);
    },

    // Метод для загрузки типов периферии из категорий
    loadPeripheralTypesFromCategories() {
      try {
        console.log('Loading peripheral types from categories...');
        const peripheralTypes = new Set<string>();
        
        // 1. Сначала пробуем получить из компонентов
        const peripheralCategories = this.components
          .filter(c => c.category && c.category.isPeripheral)
          .map(c => c.category);
        
        console.log('Found peripheral categories from components:', peripheralCategories);
        
        // Добавляем slug'и из компонентов (в нижнем регистре)
        peripheralCategories
          .filter((c): c is NonNullable<typeof c> => c !== undefined && c !== null && c.slug !== undefined && c.slug.trim() !== '')
          .forEach(c => peripheralTypes.add(c.slug.toLowerCase()));
        
        // 2. Затем пробуем получить из categoryStore
        try {
          // Используем импортированный categoryStore вместо require
          const categoryStore = useCategoryStore();
          
          // Получаем все категории с флагом isPeripheral
          const allCategories = categoryStore.getAllCategories;
          const categories = allCategories.filter(c => c.isPeripheral);
          
          console.log('Found peripheral categories from categoryStore:', categories);
          
          // Добавляем slug'и из categoryStore (в нижнем регистре)
          categories
            .filter(c => c.slug && c.slug.trim() !== '')
            .forEach(c => {
              if (c.slug) {
                peripheralTypes.add(c.slug.toLowerCase());
              }
            });
        } catch (error) {
          console.error('Error loading categories from categoryStore:', error);
        }
        
        // 3. Если все еще нет типов, запрашиваем с сервера напрямую
        if (peripheralTypes.size === 0) {
          console.log('No peripheral types found, fetching from API directly...');
          
          // Используем fetch вместо apiClient для избежания циклических зависимостей
          fetch('/api/peripherals/types')
            .then(response => response.json())
            .then(data => {
              if (Array.isArray(data) && data.length > 0) {
                // Используем нижний регистр
                data.forEach(type => peripheralTypes.add(type.toLowerCase()));
                this.peripheralTypes = Array.from(peripheralTypes);
                console.log('Peripheral types loaded from API directly:', this.peripheralTypes);
              }
            })
            .catch(error => {
              console.error('Error fetching peripheral types from API directly:', error);
            });
        }
        
        // 4. Если все еще нет типов, используем стандартный набор
        if (peripheralTypes.size === 0) {
          console.log('No peripheral types found, using default set');
          const defaultTypes = ['keyboard', 'mouse', 'monitor', 'headset', 'speakers', 'mousepad', 'microphone'];
          defaultTypes.forEach(type => peripheralTypes.add(type));
        }
        
        // Преобразуем Set в массив и сохраняем
        this.peripheralTypes = Array.from(peripheralTypes);
        console.log('Final peripheral types:', this.peripheralTypes);
      } catch (error) {
        console.error('Error loading peripheral types from categories:', error);
        // В случае ошибки используем стандартный набор
        this.peripheralTypes = ['keyboard', 'mouse', 'monitor', 'headset', 'speakers', 'mousepad', 'microphone'];
        console.log('Using default peripheral types after error:', this.peripheralTypes);
      }
    }
  }
}) 