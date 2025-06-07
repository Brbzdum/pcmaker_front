import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

interface User {
  id: number
  username: string
  email: string
  name?: string
  roles?: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    // Проверяем валидность токена
    const token = localStorage.getItem('access_token');
    const isValidToken = !!token && token.includes('.');
    
    if (!isValidToken && token) {
      // Если токен невалидный, удаляем его
      localStorage.removeItem('access_token');
    }
    
    return {
      user: null,
      isAuthenticated: isValidToken,
      isLoading: false,
      error: null
    }
  },
  
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
        
        console.log('Login response:', response.data);
        
        // Проверяем структуру ответа
        const responseData = response.data;
        
        // Для совместимости с различными форматами ответа
        const token = responseData.token || responseData.accessToken;
        const userData = responseData.user || responseData;
        
        if (!token) {
          throw new Error('Token not found in response');
        }
        
        localStorage.setItem('access_token', token);
        
        this.user = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          roles: userData.roles
        }
        this.isAuthenticated = true
        
        return true
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Status code:', error.response.status);
        }
        this.error = error.response?.data?.message || 'Login failed'
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    async register(username: string, email: string, password: string, name: string) {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Sending registration request with data:', { username, email, name });
        
        const response = await apiClient.post('/auth/signup', {
          username,
          email,
          password,
          name
        })
        
        console.log('Registration response:', response.data);
        
        // В случае успешной регистрации показываем сообщение о необходимости подтверждения почты
        // Не выполняем автоматический вход, т.к. аккаунт не активирован
        return {
          success: true,
          needEmailVerification: true,
          message: response.data.message || 'Registration successful! Please check your email to verify your account.'
        }
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Status code:', error.response.status);
          this.error = error.response?.data?.message || 
                     (error.response.data && typeof error.response.data === 'string' ? error.response.data : 'Registration failed');
        } else {
          this.error = error.message || 'Registration failed: Network error';
        }
        return {
          success: false,
          message: this.error
        }
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchUserProfile() {
      if (!this.isAuthenticated) return null
      
      this.isLoading = true
      
      try {
        const response = await apiClient.get('/users/profile')
        this.user = response.data
        return response.data
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Если пользователь не авторизован, выполняем выход
          this.logout();
        }
        this.error = error.response?.data?.message || 'Failed to fetch user profile'
        return null
      } finally {
        this.isLoading = false
      }
    },
    
    logout() {
      localStorage.removeItem('access_token')
      this.user = null
      this.isAuthenticated = false
    },
    
    checkTokenValidity() {
      // Проверяем валидность токена при каждом обращении к хранилищу
      const token = localStorage.getItem('access_token');
      if (!token || !token.includes('.')) {
        this.logout();
        return false;
      }
      return true;
    }
  }
}) 