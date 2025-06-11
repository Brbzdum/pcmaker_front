import axios from 'axios'
import mockApi from './mockApi'

// Расширяем тип AxiosInstance для добавления нашего метода
interface ExtendedAxiosInstance extends ReturnType<typeof axios.create> {
  getManufacturerName: (manufacturerId: number) => Promise<string>;
  getCompatibleComponents: (sourceId: number, targetType: string) => Promise<any[]>;
}

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
  }) as ExtendedAxiosInstance;
  
  // Добавляем функцию для получения имени производителя по ID
  instance.getManufacturerName = async (manufacturerId: number): Promise<string> => {
    try {
      const response = await instance.get(`/manufacturers/${manufacturerId}/name`);
      return response.data.name || 'Неизвестный производитель';
    } catch (error) {
      console.error('Error fetching manufacturer name:', error);
      return 'Неизвестный производитель';
    }
  };
  
  // Добавляем функцию для получения совместимых компонентов
  const getCompatibleComponents = async (sourceId: number, targetType: string): Promise<any[]> => {
    try {
      // Проверяем наличие токена авторизации
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await instance.get(
        `/compatibility/compatible/${sourceId}?targetType=${targetType}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching compatible components:', error);
      return [];
    }
  };
  
  // Добавляем метод в экземпляр
  instance.getCompatibleComponents = getCompatibleComponents;
  
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
        // Функция для обработки дат в объекте
        const processDateFields = (item: any) => {
          // Обработка полей даты
          if (item.createdAt) {
            try {
              console.log('Processing createdAt date:', item.createdAt); // Отладка
              
              // Проверяем, что дата валидная
              const date = new Date(item.createdAt);
              if (isNaN(date.getTime())) {
                console.warn('Invalid createdAt date detected:', item.createdAt);
                // Если дата некорректная, пробуем исправить формат
                if (typeof item.createdAt === 'string') {
                  // Пробуем разные форматы
                  if (item.createdAt.includes('.')) {
                    // Если дата в формате dd.MM.yyyy
                    const parts = item.createdAt.split('.');
                    if (parts.length === 3) {
                      const newDateStr = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00.000Z`;
                      console.log('Attempting to fix date format:', newDateStr);
                      const newDate = new Date(newDateStr);
                      if (!isNaN(newDate.getTime())) {
                        item.createdAt = newDateStr;
                        console.log('Fixed date:', item.createdAt);
                      } else {
                        item.createdAt = null;
                      }
                    } else {
                      item.createdAt = null;
                    }
                  } else {
                    item.createdAt = null;
                  }
                } else {
                  item.createdAt = null;
                }
              } else {
                // Дата валидная, но для уверенности преобразуем в ISO формат
                item.createdAt = date.toISOString();
                console.log('Normalized date to ISO:', item.createdAt);
              }
            } catch (e) {
              console.error('Error processing createdAt date:', e);
              item.createdAt = null;
            }
          }
          
          if (item.updatedAt) {
            try {
              console.log('Processing updatedAt date:', item.updatedAt); // Отладка
              
              // Проверяем, что дата валидная
              const date = new Date(item.updatedAt);
              if (isNaN(date.getTime())) {
                console.warn('Invalid updatedAt date detected:', item.updatedAt);
                // Аналогичная логика исправления как для createdAt
                if (typeof item.updatedAt === 'string') {
                  if (item.updatedAt.includes('.')) {
                    const parts = item.updatedAt.split('.');
                    if (parts.length === 3) {
                      const newDateStr = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00.000Z`;
                      console.log('Attempting to fix date format:', newDateStr);
                      const newDate = new Date(newDateStr);
                      if (!isNaN(newDate.getTime())) {
                        item.updatedAt = newDateStr;
                        console.log('Fixed date:', item.updatedAt);
                      } else {
                        item.updatedAt = null;
                      }
                    } else {
                      item.updatedAt = null;
                    }
                  } else {
                    item.updatedAt = null;
                  }
                } else {
                  item.updatedAt = null;
                }
              } else {
                // Дата валидная, но для уверенности преобразуем в ISO формат
                item.updatedAt = date.toISOString();
                console.log('Normalized date to ISO:', item.updatedAt);
              }
            } catch (e) {
              console.error('Error processing updatedAt date:', e);
              item.updatedAt = null;
            }
          }
          
          // Преобразование imagePath в imageUrl
          if (item.imagePath) {
            // Добавляем базовый URL, если путь начинается с /
            item.imageUrl = item.imagePath.startsWith('/') ? `${baseImageUrl}${item.imagePath}` : item.imagePath;
          }
          
          // Преобразование title в name, если name отсутствует
          if (item.title && !item.name) {
            item.name = item.title;
          }
          
          // Добавление типа, если он отсутствует и есть componentType
          if (item.componentType && !item.type) {
            item.type = item.componentType;
          }
          
          // Добавление categoryId, если его нет, но есть category_id или поле category с id
          if (!item.categoryId) {
            if (item.category_id) {
              item.categoryId = item.category_id;
            } else if (item.category && item.category.id) {
              item.categoryId = item.category.id;
            }
            console.log(`Set categoryId to ${item.categoryId} for ${item.name}`);
          }
          
          // Добавление manufacturerName если есть manufacturerId но нет manufacturer
          if (item.manufacturerId && !item.manufacturer) {
            // Асинхронно получаем имя производителя по ID
            // Но пока просто установим временное значение, которое будет заменено позже
            item.manufacturer = "Загрузка...";
            
            // Запускаем асинхронный запрос для получения имени производителя
            (async () => {
              try {
                if (typeof instance.getManufacturerName === 'function') {
                  const name = await instance.getManufacturerName(item.manufacturerId);
                  item.manufacturer = name;
                }
              } catch (error) {
                console.error('Error fetching manufacturer name:', error);
              }
            })();
          }
          
          // Добавление categoryName если есть categoryId но нет category
          if (item.categoryId && !item.category) {
            // В идеале здесь нужно получить имя категории по ID
            // Но пока просто установим заглушку
            item.category = "Категория #" + item.categoryId;
          }
          
          // Добавление рейтинга если его нет
          if (!item.rating) {
            item.rating = 0;
          }
          
          return item;
        };
      
        // Если это массив объектов
        if (Array.isArray(response.data)) {
          response.data.forEach(item => {
            processDateFields(item);
          });
        } 
        // Если это один объект
        else if (typeof response.data === 'object') {
          processDateFields(response.data);
        }
      }
      
      console.log('API Response:', response.data); // Добавляем логирование для отладки
      return response;
    },
    async (error) => {
      console.error('API Error:', error.response?.data || error.message); // Добавляем логирование ошибок
      
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