<template>
  <div class="order-card">
    <div class="order-header">
      <div class="order-info">
        <div class="order-number">Заказ #{{ order.id }}</div>
        <div class="order-date">{{ formattedDate }}</div>
      </div>
      <div class="order-status" :class="statusClass">
        {{ translatedStatus }}
      </div>
    </div>
    
    <div class="order-items">
      <div 
        v-for="(item, index) in order.items" 
        :key="index"
        class="order-item"
      >
        <div class="item-name">{{ item.productName }}</div>
        <div class="item-details">
          <span>{{ item.quantity }} × {{ formatPrice(item.productPrice) }} ₽</span>
        </div>
      </div>
    </div>
    
    <div class="order-footer">
      <div class="order-total">
        <span>Итого:</span>
        <span>{{ formatPrice(order.total) }} ₽</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
});

// Форматирование даты
const formattedDate = computed(() => {
  const dateString = props.order.createdAt;
  
  // Если дата пустая, возвращаем заглушку
  if (!dateString) {
    return 'Дата не указана';
  }
  
  try {
    // Пробуем напрямую преобразовать строку в объект Date
    let date = new Date(dateString);
    
    // Проверяем валидность даты
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Если не получилось, пробуем разные форматы
    
    // Проверяем формат ISO с Z в конце (UTC)
    if (dateString.includes('T') && dateString.includes('Z')) {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Проверяем формат ISO без Z (локальное время)
    if (dateString.includes('T')) {
      return new Date(dateString + 'Z').toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Проверяем формат dd.MM.yyyy
    if (dateString.includes('.') && dateString.split('.').length === 3) {
      const parts = dateString.split('.');
      const newDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(newDate.getTime())) {
        return newDate.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }
    
    // Если ничего не помогло, возвращаем дату как есть
    return dateString;
  } catch (error) {
    console.error('Ошибка при форматировании даты:', error);
    return 'Ошибка даты';
  }
});

// Перевод статуса заказа
const translatedStatus = computed(() => {
  const statusMap = {
    'PENDING': 'Обрабатывается',
    'PROCESSING': 'В обработке',
    'SHIPPED': 'Отправлен',
    'DELIVERED': 'Доставлен',
    'CANCELLED': 'Отменен',
    'COMPLETED': 'Выполнен'
  };
  
  return statusMap[props.order.status] || props.order.status;
});

// Получение класса для статуса заказа
const statusClass = computed(() => {
  const status = props.order.status;
  
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
      return 'status-completed';
    case 'PROCESSING':
    case 'PENDING':
    case 'SHIPPED':
      return 'status-processing';
    case 'CANCELLED':
      return 'status-cancelled';
    default:
      return '';
  }
});

// Форматирование цены
const formatPrice = (price) => {
  if (typeof price === 'number') {
    return price.toFixed(2);
  } else if (price && typeof price.toFixed === 'function') {
    return price.toFixed(2);
  }
  return '0.00';
};
</script>

<style scoped>
.order-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.order-number {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-processing {
  background-color: #cce5ff;
  color: #004085;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-items {
  padding: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.item-name {
  font-weight: 500;
}

.item-details {
  color: #666;
}

.order-footer {
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
}

.order-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}
</style> 