import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

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
}

interface Filter {
  type?: string[]
  manufacturer?: string[]
  priceMin?: number
  priceMax?: number
  categoryIds?: number[]
  searchQuery?: string
}

interface CatalogState {
  components: Component[]
  filteredComponents: Component[]
  filter: Filter
  manufacturers: string[]
  componentTypes: string[]
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
    isLoading: false,
    error: null
  }),

  getters: {
    getComponents: (state) => state.components,
    getFilteredComponents: (state) => state.filteredComponents,
    getFilter: (state) => state.filter,
    getManufacturers: (state) => state.manufacturers,
    getComponentTypes: (state) => state.componentTypes,
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
        
        // Extract unique manufacturers and component types
        this.manufacturers = [...new Set(this.components.map(c => c.manufacturer))]
        this.componentTypes = [...new Set(this.components.map(c => c.type))]
        
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

      // Filter by type
      if (this.filter.type && this.filter.type.length > 0) {
        filtered = filtered.filter(c => this.filter.type!.includes(c.type))
      }

      // Filter by manufacturer
      if (this.filter.manufacturer && this.filter.manufacturer.length > 0) {
        filtered = filtered.filter(c => this.filter.manufacturer!.includes(c.manufacturer))
      }

      // Filter by price range
      if (this.filter.priceMin !== undefined) {
        filtered = filtered.filter(c => c.price >= this.filter.priceMin!)
      }

      if (this.filter.priceMax !== undefined) {
        filtered = filtered.filter(c => c.price <= this.filter.priceMax!)
      }

      // Filter by category
      if (this.filter.categoryIds && this.filter.categoryIds.length > 0) {
        filtered = filtered.filter(c => c.categoryId && this.filter.categoryIds!.includes(c.categoryId))
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
      }

      this.filteredComponents = filtered
    }
  }
}) 