import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface CategoryDto {
  id: number
  name: string
  description?: string
  parentId?: number
  isPcComponent?: boolean
  imageUrl?: string
}

interface CategoryState {
  categories: CategoryDto[]
  rootCategories: CategoryDto[]
  pcComponentCategories: CategoryDto[]
  categoryPath: Record<number, CategoryDto[]>
  subcategories: Record<number, CategoryDto[]>
  isLoading: boolean
  error: string | null
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
    rootCategories: [],
    pcComponentCategories: [],
    categoryPath: {},
    subcategories: {},
    isLoading: false,
    error: null
  }),

  getters: {
    getCategories: (state) => state.categories,
    getRootCategories: (state) => state.rootCategories,
    getPcComponentCategories: (state) => state.pcComponentCategories,
    getCategoryById: (state) => (id: number) => state.categories.find(c => c.id === id),
    getCategoryPath: (state) => (id: number) => state.categoryPath[id] || [],
    getSubcategories: (state) => (id: number) => state.subcategories[id] || [],
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchAllCategories() {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/categories')
        this.categories = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch categories'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchCategory(id: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/categories/${id}`)
        
        // Обновляем категорию в списке, если она там есть
        const index = this.categories.findIndex(c => c.id === id)
        if (index !== -1) {
          this.categories[index] = response.data
        } else {
          this.categories.push(response.data)
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch category'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchCategoryByName(name: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/categories/name/${encodeURIComponent(name)}`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch category by name'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async createCategory(categoryDto: CategoryDto) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.post('/categories', categoryDto)
        this.categories.push(response.data)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create category'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateCategory(id: number, categoryDto: CategoryDto) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.put(`/categories/${id}`, categoryDto)
        
        // Обновляем категорию в списке
        const index = this.categories.findIndex(c => c.id === id)
        if (index !== -1) {
          this.categories[index] = response.data
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update category'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async deleteCategory(id: number) {
      this.isLoading = true
      this.error = null

      try {
        await apiClient.delete(`/categories/${id}`)
        
        // Удаляем категорию из списка
        this.categories = this.categories.filter(c => c.id !== id)
        
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to delete category'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async fetchSubcategories(id: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/categories/${id}/subcategories`)
        this.subcategories[id] = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch subcategories'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchRootCategories() {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/categories/root')
        this.rootCategories = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch root categories'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchPcComponentCategories() {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/categories/pc-components')
        this.pcComponentCategories = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch PC component categories'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchCategoryPath(id: number) {
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get(`/categories/${id}/path`)
        this.categoryPath[id] = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch category path'
        return []
      } finally {
        this.isLoading = false
      }
    }
  }
}) 