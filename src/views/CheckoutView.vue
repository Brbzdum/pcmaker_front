<template>
  <div class="checkout">
    <h1>Оформление заказа</h1>
    
    <div v-if="authStore.getIsAuthenticated">
      <div v-if="cartStore.getCartItems.length === 0" class="empty-cart">
        <p>Ваша корзина пуста. Добавьте товары перед оформлением заказа.</p>
        <RouterLink to="/catalog" class="btn-shop">К каталогу</RouterLink>
        <RouterLink to="/configurator" class="btn-config">К конфигуратору</RouterLink>
      </div>
      
      <div v-else class="checkout-content">
        <div class="checkout-form">
          <h2>Данные для доставки</h2>
          
          <form @submit.prevent="submitOrder">
            <div class="form-group">
              <label for="full-name">ФИО</label>
              <input 
                type="text" 
                id="full-name" 
                v-model="orderForm.fullName" 
                required
                :disabled="isSubmitting"
              >
            </div>
            
            <div class="form-group">
              <label for="phone">Номер телефона</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="orderForm.phone" 
                required
                :disabled="isSubmitting"
                placeholder="+7 (___) ___-__-__"
              >
            </div>
            
            <div class="form-group">
              <label for="address">Адрес доставки</label>
              <textarea 
                id="address" 
                v-model="orderForm.address" 
                required
                :disabled="isSubmitting"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="comment">Комментарий к заказу (необязательно)</label>
              <textarea 
                id="comment" 
                v-model="orderForm.comment" 
                :disabled="isSubmitting"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Способ оплаты</label>
              <div class="payment-methods">
                <div class="payment-method">
                  <input 
                    type="radio" 
                    id="payment-card" 
                    value="card" 
                    v-model="orderForm.paymentMethod"
                    :disabled="isSubmitting"
                  >
                  <label for="payment-card">Банковская карта</label>
                </div>
                
                <div class="payment-method">
                  <input 
                    type="radio" 
                    id="payment-cash" 
                    value="cash" 
                    v-model="orderForm.paymentMethod"
                    :disabled="isSubmitting"
                  >
                  <label for="payment-cash">Наличные при получении</label>
                </div>
              </div>
            </div>
            
            <div v-if="orderError" class="error-message">
              {{ orderError }}
            </div>
            
            <button 
              type="submit" 
              class="btn-submit"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Оформление...' : 'Оформить заказ' }}
            </button>
          </form>
        </div>
        
        <div class="order-summary">
          <div class="summary-card">
            <h2>Ваш заказ</h2>
            
            <div class="cart-items">
              <div 
                v-for="item in cartStore.getCartItems" 
                :key="item.id"
                class="cart-item"
              >
                <div class="item-name">{{ item.name }}</div>
                <div class="item-details">
                  <span>{{ item.quantity }} × ${{ item.price.toFixed(2) }}</span>
                  <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <div class="summary-row subtotal">
              <span>Товары:</span>
              <span>${{ cartStore.getCartTotal.toFixed(2) }}</span>
            </div>
            
            <div class="summary-row delivery">
              <span>Доставка:</span>
              <span>Бесплатно</span>
            </div>
            
            <div class="summary-row total">
              <span>Итого:</span>
              <span>${{ cartStore.getCartTotal.toFixed(2) }}</span>
            </div>
            
            <RouterLink to="/cart" class="btn-back">
              Назад к корзине
            </RouterLink>
          </div>
        </div>
      </div>
      
      <!-- Модальное окно успешного оформления заказа -->
      <div v-if="showSuccessModal" class="modal-overlay">
        <div class="modal">
          <h3>Заказ успешно оформлен!</h3>
          <p>Номер вашего заказа: <strong>{{ orderNumber }}</strong></p>
          <p>Вы можете отслеживать статус заказа в вашем профиле.</p>
          <div class="modal-actions">
            <RouterLink to="/profile" class="btn-profile">
              Перейти в профиль
            </RouterLink>
            <RouterLink to="/catalog" class="btn-catalog">
              Продолжить покупки
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="login-required">
      <p>Пожалуйста, войдите в аккаунт для оформления заказа.</p>
      <RouterLink to="/login" class="btn-login">Войти</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import mockApi from '@/api/mockApi'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const orderForm = ref({
  fullName: '',
  phone: '',
  address: '',
  comment: '',
  paymentMethod: 'card'
})

const isSubmitting = ref(false)
const orderError = ref('')
const showSuccessModal = ref(false)
const orderNumber = ref('')

onMounted(async () => {
  if (authStore.getIsAuthenticated) {
    await cartStore.fetchCart()
  }
})

const submitOrder = async () => {
  if (cartStore.getCartItems.length === 0) {
    orderError.value = 'Корзина пуста. Добавьте товары перед оформлением заказа.'
    return
  }
  
  isSubmitting.value = true
  orderError.value = ''
  
  try {
    // В реальном приложении здесь будет запрос к бэкенду
    const response = await mockApi.createOrder(
      orderForm.value.address, 
      orderForm.value.phone
    )
    
    // Генерируем номер заказа для показа в модальном окне
    orderNumber.value = `ORD-${response.data.id}`
    
    // Сбрасываем форму
    orderForm.value = {
      fullName: '',
      phone: '',
      address: '',
      comment: '',
      paymentMethod: 'card'
    }
    
    // Показываем модальное окно успеха
    showSuccessModal.value = true
  } catch (error: any) {
    orderError.value = error.response?.data?.message || 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте снова.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.checkout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.checkout-content {
  display: flex;
  gap: 2rem;
}

.checkout-form {
  flex: 3;
}

.order-summary {
  flex: 2;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.payment-methods {
  margin-top: 0.5rem;
}

.payment-method {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.payment-method input {
  margin-right: 0.5rem;
  width: auto;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.cart-items {
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.cart-item {
  margin-bottom: 1rem;
}

.item-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.item-details {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-row.subtotal,
.summary-row.delivery {
  font-size: 0.95rem;
}

.summary-row.total {
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid #ddd;
  padding-top: 1rem;
  margin-top: 1rem;
}

.btn-back {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: #f1f1f1;
  color: #333;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 1.5rem;
  transition: background-color 0.3s;
}

.btn-back:hover {
  background-color: #e1e1e1;
}

.empty-cart,
.login-required {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
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

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.modal h3 {
  margin-top: 0;
  color: #2ecc71;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-profile,
.btn-catalog {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-profile {
  background-color: #3498db;
  color: white;
}

.btn-profile:hover {
  background-color: #2980b9;
}

.btn-catalog {
  background-color: #f1f1f1;
  color: #333;
  border: 1px solid #ddd;
}

.btn-catalog:hover {
  background-color: #e1e1e1;
}

@media (max-width: 768px) {
  .checkout-content {
    flex-direction: column;
  }
  
  .summary-card {
    position: static;
    margin-top: 2rem;
  }
  
  .modal {
    width: 90%;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style> 