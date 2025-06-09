<template>
  <div class="cart">
    <h1>Корзина</h1>
    
    <div v-if="authStore.getIsAuthenticated">
      <div v-if="cartStore.getIsLoading" class="loading">
        Загрузка корзины...
      </div>
      
      <div v-else-if="cartStore.getError" class="error">
        {{ cartStore.getError }}
      </div>
      
      <div v-else-if="cartStore.getItems.length === 0" class="empty-cart">
        <p>Ваша корзина пуста.</p>
        <RouterLink to="/catalog" class="btn-shop">Перейти в каталог</RouterLink>
        <RouterLink to="/configurator" class="btn-config">Собрать ПК</RouterLink>
      </div>
      
      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cartStore.getItems" 
            :key="item.productId"
            class="cart-item"
          >
            <div class="item-details">
              <h3>{{ item.productName }}</h3>
              <div class="item-price-single">{{ item.productPrice.toFixed(2) }} ₽ x {{ item.quantity }}</div>
            </div>
            
            <div class="item-quantity">
              <button 
                @click="decreaseQuantity(item)"
                class="btn-quantity"
                :disabled="item.quantity <= 1"
              >
                -
              </button>
              <span>{{ item.quantity }}</span>
              <button 
                @click="increaseQuantity(item)"
                class="btn-quantity"
                :disabled="isLoading || item.outOfStock"
                :class="{'btn-disabled': item.outOfStock}"
              >
                +
                <span v-if="item.outOfStock" class="stock-tooltip">
                  Товар закончился на складе
                </span>
              </button>
            </div>
            
            <div class="item-price">
              {{ item.totalPrice.toFixed(2) }} ₽
            </div>
            
            <button @click="removeItem(item)" class="btn-remove">
              &times;
            </button>
          </div>
        </div>
        
        <div class="cart-summary">
          <div class="summary-card">
            <h2>Сводка заказа</h2>
            
            <div class="summary-row">
              <span>Товары ({{ cartStore.getItemCount }}):</span>
              <span>{{ cartStore.getTotal.toFixed(2) }} ₽</span>
            </div>
            
            <div class="summary-row total">
              <span>Итого:</span>
              <span>{{ cartStore.getTotal.toFixed(2) }} ₽</span>
            </div>
            
            <RouterLink to="/checkout" class="btn-checkout">
              Оформить заказ
            </RouterLink>
            
            <button @click="clearCart" class="btn-clear">
              Очистить корзину
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="login-required">
      <p>Пожалуйста, войдите в аккаунт для просмотра корзины.</p>
      <RouterLink to="/login" class="btn-login">Войти</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()
const isLoading = ref(false)

onMounted(async () => {
  if (authStore.getIsAuthenticated) {
    await cartStore.fetchCart()
    
    // Проверяем товары на наличие
    checkItemsStock()
  }
})

// Проверка наличия товаров
const checkItemsStock = () => {
  const items = cartStore.getItems
  for (const item of items) {
    // Здесь мы предполагаем, что если товар уже в корзине в максимальном количестве,
    // то больше его добавить нельзя
    if (item.stockError) {
      item.outOfStock = true
    } else {
      item.outOfStock = false
    }
  }
}

const increaseQuantity = async (item: any) => {
  if (item.outOfStock) return
  
  isLoading.value = true
  const result = await cartStore.updateCartItem(item.productId, item.quantity + 1)
  
  if (!result) {
    // Если не удалось обновить количество, значит товара больше нет на складе
    item.outOfStock = true
  }
  
  isLoading.value = false
}

const decreaseQuantity = async (item: any) => {
  if (item.quantity > 1) {
    isLoading.value = true
    await cartStore.updateCartItem(item.productId, item.quantity - 1)
    
    // После уменьшения количества, товар снова может быть доступен для добавления
    if (item.outOfStock) {
      item.outOfStock = false
    }
    
    isLoading.value = false
  }
}

const removeItem = async (item: any) => {
  isLoading.value = true
  await cartStore.removeFromCart(item.productId)
  isLoading.value = false
}

const clearCart = async () => {
  if (confirm('Вы уверены, что хотите очистить корзину?')) {
    isLoading.value = true
    await cartStore.clearCart()
    isLoading.value = false
  }
}
</script>

<style scoped>
.cart {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.loading,
.error,
.empty-cart,
.login-required {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.error {
  color: #e74c3c;
}

.btn-shop,
.btn-config,
.btn-login {
  display: inline-block;
  margin: 1rem 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-shop:hover,
.btn-config:hover,
.btn-login:hover {
  background-color: #2980b9;
}

.cart-content {
  display: flex;
  gap: 2rem;
}

.cart-items {
  flex: 2;
}

.cart-summary {
  flex: 1;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.item-details {
  flex: 2;
}

.item-details h3 {
  margin: 0 0 0.5rem 0;
}

.item-price-single {
  color: #666;
  font-size: 0.9rem;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.btn-quantity {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.btn-quantity:hover:not(:disabled) {
  background-color: #f1f1f1;
}

.btn-quantity:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-disabled {
  border-color: #e74c3c;
}

.stock-tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(231, 76, 60, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.stock-tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(231, 76, 60, 0.9);
}

.item-price {
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 100px;
  text-align: right;
}

.btn-remove {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: 1rem;
}

.summary-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.summary-row.total {
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid #ddd;
  padding-top: 1rem;
  margin-top: 1rem;
}

.btn-checkout {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: #2ecc71;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  margin-bottom: 1rem;
  transition: background-color 0.3s;
}

.btn-checkout:hover {
  background-color: #27ae60;
}

.btn-clear {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: #f1f1f1;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-clear:hover {
  background-color: #e1e1e1;
}

@media (max-width: 768px) {
  .cart-content {
    flex-direction: column;
  }
  
  .summary-card {
    position: static;
  }
}
</style> 