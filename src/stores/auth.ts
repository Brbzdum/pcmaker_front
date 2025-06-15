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

// Функция для локализации ошибок от сервера
const localizeError = (error: string): string => {
  // Карта локализации распространенных ошибок
  const errorMap: Record<string, string> = {
    'Invalid credentials': 'Неверное имя пользователя или пароль',
    'Login failed': 'Ошибка входа',
    'User already exists': 'Пользователь с таким именем уже существует',
    'Email already exists': 'Пользователь с таким email уже существует',
    'Registration failed': 'Ошибка при регистрации',
    'Invalid verification code': 'Недействительный код подтверждения',
    'Email verification required': 'Требуется подтверждение email',
    'Invalid username or password': 'Неверное имя пользователя или пароль',
    'Invalid token': 'Недействительный токен аутентификации',
    'Password should be at least 6 characters': 'Пароль должен быть не менее 6 символов',
    'Token not found in response': 'Ошибка аутентификации: не получен токен доступа',
    'Network error': 'Ошибка сети',
    'Пользователь с таким email уже существует': 'Пользователь с таким email уже существует',
    'Пользователь с таким username уже существует': 'Пользователь с таким именем уже существует',
    'User not found': 'Пользователь не найден',
    'Bad credentials': 'Неверное имя пользователя или пароль'
  }

  // Проверяем наличие сообщения в словаре
  if (error in errorMap) {
    return errorMap[error]
  }

  // Для ошибок о длине пароля
  if (error.includes('password') && error.includes('characters')) {
    return 'Пароль должен быть не менее 6 символов'
  }

  // Для ошибок валидации email
  if (error.includes('email') && error.includes('format')) {
    return 'Некорректный формат email'
  }

  // Если не нашли соответствия, возвращаем оригинальное сообщение
  return error
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
          
          // Локализуем сообщение об ошибке
          const errorMessage = error.response?.data?.message || 'Ошибка входа';
          this.error = localizeError(errorMessage);
        } else {
          this.error = localizeError(error.message || 'Ошибка сети');
        }
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    async register(username: string, email: string, password: string, name: string, dataProcessingConsent: boolean) {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Sending registration request with data:', { username, email, name, dataProcessingConsent });
        
        const response = await apiClient.post('/auth/signup', {
          username,
          email,
          password,
          name,
          dataProcessingConsent
        })
        
        console.log('Registration response:', response.data);
        
        // Локализуем сообщение об успешной регистрации
        const successMessage = response.data?.message || 'Регистрация успешна! Пожалуйста, проверьте вашу почту для подтверждения аккаунта.';
        
        return {
          success: true,
          needEmailVerification: true,
          message: successMessage
        }
      } catch (error: any) {
        console.error('Registration error:', error);
        let errorMessage = 'Ошибка при регистрации';
        
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Status code:', error.response.status);
          
          // Получаем сообщение об ошибке из ответа сервера
          if (error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            }
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Проверяем наличие конкретных ошибок, связанных с регистрацией
        if (errorMessage.includes('email уже существует')) {
          errorMessage = 'Пользователь с таким email уже существует';
        } else if (errorMessage.includes('username уже существует')) {
          errorMessage = 'Пользователь с таким именем уже существует';
        }
        
        // Локализуем сообщение об ошибке
        this.error = localizeError(errorMessage);
        
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
        
        const errorMessage = error.response?.data?.message || 'Ошибка при получении профиля';
        this.error = localizeError(errorMessage);
        
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