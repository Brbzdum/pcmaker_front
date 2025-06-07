/**
 * DEPRECATED: Этот файл содержит моки API и больше не используется.
 * Вместо этого приложение теперь использует реальный API.
 * Файл сохранен только для справки.
 */

import { components, cartItems, userProfile, compatibilityResults, incompatibleResults } from './mockData';

// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API для работы без бэкенда
const mockApi = {
  // Компоненты
  async getComponents() {
    await delay(300);
    return { data: components };
  },
  
  async getComponentsByType(type: string) {
    await delay(300);
    return { 
      data: components.filter(component => component.type === type)
    };
  },
  
  async getComponentById(id: number) {
    await delay(300);
    const component = components.find(c => c.id === id);
    if (!component) {
      throw new Error('Компонент не найден');
    }
    return { data: component };
  },
  
  // Корзина
  async getCart() {
    await delay(300);
    return { data: cartItems };
  },
  
  async addToCart(productId: number, quantity: number = 1) {
    await delay(300);
    const product = components.find(c => c.id === productId);
    if (!product) {
      throw new Error('Товар не найден');
    }
    
    const existingItem = cartItems.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem = {
        id: Math.floor(Math.random() * 10000) + 100,
        productId,
        name: product.name,
        price: product.price,
        quantity,
        type: product.type
      };
      cartItems.push(newItem);
    }
    
    return { data: cartItems };
  },
  
  async updateCartItem(itemId: number, quantity: number) {
    await delay(300);
    const item = cartItems.find(item => item.id === itemId);
    if (!item) {
      throw new Error('Товар не найден в корзине');
    }
    
    item.quantity = quantity;
    return { data: item };
  },
  
  async removeFromCart(itemId: number) {
    await delay(300);
    const index = cartItems.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error('Товар не найден в корзине');
    }
    
    cartItems.splice(index, 1);
    return { data: true };
  },
  
  async clearCart() {
    await delay(300);
    cartItems.length = 0;
    return { data: true };
  },
  
  // Аутентификация
  async login(username: string, password: string) {
    await delay(500);
    // Простая имитация входа
    if (username === 'demo' && password === 'password') {
      return { 
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: 1,
            username: 'demo',
            email: 'demo@example.com'
          }
        }
      };
    }
    throw { 
      response: { 
        data: { message: 'Неверное имя пользователя или пароль' } 
      }
    };
  },
  
  async register(username: string, email: string, password: string) {
    await delay(500);
    // Простая имитация регистрации
    return { 
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 1,
          username,
          email
        }
      }
    };
  },
  
  async refresh(refreshToken: string) {
    await delay(300);
    if (refreshToken === 'mock-refresh-token') {
      return { 
        data: {
          accessToken: 'new-mock-access-token'
        }
      };
    }
    throw { 
      response: { 
        data: { message: 'Недействительный токен обновления' } 
      }
    };
  },
  
  // Профиль
  async getUserProfile() {
    await delay(300);
    return { data: userProfile };
  },
  
  // Проверка совместимости
  async checkCompatibility(componentIds: number[]) {
    await delay(800);
    
    // Имитация проверки совместимости
    // Возвращаем разные результаты в зависимости от комбинации компонентов
    const hasCPU = componentIds.some(id => {
      const component = components.find(c => c.id === id);
      return component && component.type === 'CPU';
    });
    
    const hasMotherboard = componentIds.some(id => {
      const component = components.find(c => c.id === id);
      return component && component.type === 'Motherboard';
    });
    
    // Если есть Intel CPU и AMD материнская плата (или наоборот), они несовместимы
    if (hasCPU && hasMotherboard) {
      const cpu = components.find(c => 
        componentIds.includes(c.id) && c.type === 'CPU'
      );
      
      const motherboard = components.find(c => 
        componentIds.includes(c.id) && c.type === 'Motherboard'
      );
      
      if (
        (cpu?.manufacturer === 'Intel' && motherboard?.specifications.socket?.includes('AM4')) ||
        (cpu?.manufacturer === 'AMD' && motherboard?.specifications.socket?.includes('LGA'))
      ) {
        return { data: incompatibleResults };
      }
    }
    
    // Если есть мощная видеокарта и слабый блок питания
    const hasHighEndGPU = componentIds.some(id => id === 3 || id === 4); // RTX 3080 или RX 6800 XT
    const hasLowPowerPSU = componentIds.some(id => id === 12); // NZXT C650
    
    if (hasHighEndGPU && hasLowPowerPSU) {
      return { data: incompatibleResults };
    }
    
    return { data: compatibilityResults };
  },
  
  // Сохранение конфигурации
  async saveConfiguration(name: string, componentIds: number[]) {
    await delay(300);
    const newConfig = {
      id: Math.floor(Math.random() * 10000) + 2000,
      name,
      date: new Date().toISOString().split('T')[0],
      components: componentIds
    };
    
    userProfile.savedConfigurations.push(newConfig);
    return { data: newConfig };
  },
  
  // Заказы
  async createOrder(address: string, phone: string) {
    await delay(500);
    
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const newOrder = {
      id: Math.floor(Math.random() * 10000) + 1000,
      date: new Date().toISOString().split('T')[0],
      status: 'Обрабатывается',
      total,
      items: cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      address,
      phone
    };
    
    userProfile.orders.push(newOrder);
    cartItems.length = 0; // Очищаем корзину
    
    return { data: newOrder };
  }
};

export default mockApi; 