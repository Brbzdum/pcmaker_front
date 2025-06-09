import axios from 'axios'
import mockApi from './mockApi'

// Определяем, используем ли мы реальный API или моки
const USE_MOCK_API = false; // Изменено на false для использования реального API

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

// Создаем реальный API-клиент
const createRealClient = () => {
  const instance = axios.create({
    baseURL: '/api', // Используем относительный URL для прокси
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true // Добавляем для передачи куки между доменами, если необходимо
  });
  
  // Request interceptor for API calls
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Проверяем, что токен существует и правильно форматирован
        if (token.includes('.')) {
          config.headers['Authorization'] = `Bearer ${token}`;
        } else {
          // Если токен некорректный, удаляем его
          console.warn('Invalid token format found in localStorage, removing it');
          localStorage.removeItem('access_token');
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for API calls
  instance.interceptors.response.use(
    (response) => {
      // Если ответ содержит токен авторизации, сохраняем его
      if (response.data && response.data.token) {
        localStorage.setItem('access_token', response.data.token);
      }
      
      // Базовый URL для изображений
      const baseImageUrl = 'http://localhost:8080';
      
      // Преобразуем поля бэкенда в формат, ожидаемый фронтендом
      if (response.data) {
        // Если это массив объектов
        if (Array.isArray(response.data)) {
          response.data.forEach(item => {
            // Преобразование imagePath в imageUrl
            if (item.imagePath) {
              // Добавляем базовый URL, если путь начинается с /
              item.imageUrl = item.imagePath.startsWith('/') ? `${baseImageUrl}${item.imagePath}` : item.imagePath;
            }
            
            // Преобразование title в name, если name отсутствует
            if (item.title && !item.name) {
              item.name = item.title;
            }
            
            // Преобразование manufacturer объекта в строку
            if (item.manufacturer && typeof item.manufacturer === 'object') {
              item.manufacturer = item.manufacturer.name;
            }
            
            // Добавление типа, если он отсутствует
            if (item.componentType) {
              item.type = item.componentType;
            }
          });
        } 
        // Если это один объект
        else if (typeof response.data === 'object') {
          // Преобразование imagePath в imageUrl
          if (response.data.imagePath) {
            // Добавляем базовый URL, если путь начинается с /
            response.data.imageUrl = response.data.imagePath.startsWith('/') ? `${baseImageUrl}${response.data.imagePath}` : response.data.imagePath;
          }
          
          // Преобразование title в name, если name отсутствует
          if (response.data.title && !response.data.name) {
            response.data.name = response.data.title;
          }
          
          // Преобразование manufacturer объекта в строку
          if (response.data.manufacturer && typeof response.data.manufacturer === 'object') {
            response.data.manufacturer = response.data.manufacturer.name;
          }
          
          // Добавление типа, если он отсутствует
          if (response.data.componentType) {
            response.data.type = response.data.componentType;
          }
        }
      }
      
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // If the error is due to an expired token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Если на сервере произошла ошибка JWT, удаляем токен и перенаправляем
        localStorage.removeItem('access_token');
        
        // Проверяем, находимся ли мы на странице логина
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  );
  
  return instance;
};

const apiClient = USE_MOCK_API ? 
  // Используем мок-клиент
  createMockClient() : 
  // Или реальный Axios клиент для работы с бэкендом
  createRealClient();

export default apiClient; 