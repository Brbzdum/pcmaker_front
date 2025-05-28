import axios from 'axios'
import mockApi from './mockApi'

// Определяем, используем ли мы реальный API или моки
const USE_MOCK_API = true; // Изменить на false для использования реального API

// Для typescript - создаем тип, который имеет структуру, похожую на axios
const createMockClient = () => {
  return {
    get: (url: string) => {
      if (url === '/components') {
        return mockApi.getComponents();
      }
      if (url.startsWith('/components?type=')) {
        const type = url.split('=')[1];
        return mockApi.getComponentsByType(type);
      }
      if (url.startsWith('/components/')) {
        const id = parseInt(url.split('/')[2]);
        return mockApi.getComponentById(id);
      }
      if (url === '/cart') {
        return mockApi.getCart();
      }
      if (url === '/profile/me') {
        return mockApi.getUserProfile();
      }
      throw new Error(`Неизвестный URL: ${url}`);
    },
    post: (url: string, data: any) => {
      if (url === '/auth/login') {
        return mockApi.login(data.username, data.password);
      }
      if (url === '/auth/register') {
        return mockApi.register(data.username, data.email, data.password);
      }
      if (url === '/auth/refresh') {
        return mockApi.refresh(data.refreshToken);
      }
      if (url === '/cart') {
        return mockApi.addToCart(data.productId, data.quantity);
      }
      if (url === '/compatibility/check') {
        return mockApi.checkCompatibility(data.componentIds);
      }
      if (url === '/profile/configurations') {
        return mockApi.saveConfiguration(data.name, data.componentIds);
      }
      if (url === '/orders') {
        return mockApi.createOrder(data.address, data.phone);
      }
      throw new Error(`Неизвестный URL: ${url}`);
    },
    put: (url: string, data: any) => {
      if (url.startsWith('/cart/')) {
        const id = parseInt(url.split('/')[2]);
        return mockApi.updateCartItem(id, data.quantity);
      }
      throw new Error(`Неизвестный URL: ${url}`);
    },
    delete: (url: string) => {
      if (url === '/cart') {
        return mockApi.clearCart();
      }
      if (url.startsWith('/cart/')) {
        const id = parseInt(url.split('/')[2]);
        return mockApi.removeFromCart(id);
      }
      throw new Error(`Неизвестный URL: ${url}`);
    },
    interceptors: {
      request: { 
        use: () => {
          return { id: 0 }; // Возвращаем объект с id для совместимости с axios
        } 
      },
      response: { 
        use: () => {
          return { id: 0 }; // Возвращаем объект с id для совместимости с axios
        } 
      }
    }
  };
};

const apiClient = USE_MOCK_API ? 
  // Используем мок-клиент
  createMockClient() : 
  // Или реальный Axios клиент для работы с бэкендом
  axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json'
    }
  });

// Интерцепторы добавляем, только если используется реальный API
if (!USE_MOCK_API) {
  // Request interceptor for API calls
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor for API calls
  apiClient.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      const originalRequest = error.config
      
      // If the error is due to an expired token and we haven't already tried to refresh
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        
        try {
          // Attempt to refresh the token
          const refreshToken = localStorage.getItem('refresh_token')
          if (!refreshToken) {
            // No refresh token available, redirect to login
            window.location.href = '/login'
            return Promise.reject(error)
          }
          
          const response = await axios.post(
            'http://localhost:8080/auth/refresh',
            { refreshToken }
          )
          
          const { accessToken } = response.data
          
          // Save the new token
          localStorage.setItem('access_token', accessToken)
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          
          // Retry the original request
          return axios(originalRequest)
        } catch (refreshError) {
          // Refresh token failed, redirect to login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
      
      return Promise.reject(error)
    }
  )
}

export default apiClient 