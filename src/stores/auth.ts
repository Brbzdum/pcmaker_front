import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface User {
  id: number
  username: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null
  }),
  
  getters: {
    getUser: (state) => state.user,
    getIsAuthenticated: (state) => state.isAuthenticated,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },
  
  actions: {
    async login(username: string, password: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await apiClient.post('/auth/login', {
          username,
          password
        })
        
        const { accessToken, refreshToken, user } = response.data
        
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        
        this.user = user
        this.isAuthenticated = true
        
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Login failed'
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    async register(username: string, email: string, password: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await apiClient.post('/auth/register', {
          username,
          email,
          password
        })
        
        const { accessToken, refreshToken, user } = response.data
        
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        
        this.user = user
        this.isAuthenticated = true
        
        return true
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Registration failed'
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchUserProfile() {
      if (!this.isAuthenticated) return null
      
      this.isLoading = true
      
      try {
        const response = await apiClient.get('/profile/me')
        this.user = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch user profile'
        return null
      } finally {
        this.isLoading = false
      }
    },
    
    logout() {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      this.user = null
      this.isAuthenticated = false
    }
  }
}) 