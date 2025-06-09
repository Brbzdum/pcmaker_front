<template>
  <div class="verification-failed">
    <div class="card">
      <div class="status-icon error">
        <i class="fa fa-times-circle"></i>
      </div>
      <h1>Ошибка верификации</h1>
      <p>К сожалению, не удалось подтвердить ваш email. Возможно, ссылка неверна или уже использована.</p>
      <div class="actions">
        <router-link to="/login" class="btn primary">Войти</router-link>
        <button @click="resendVerification" class="btn secondary" :disabled="isLoading">
          {{ isLoading ? 'Отправка...' : 'Отправить повторно' }}
        </button>
      </div>
      <p v-if="message" :class="['message', messageType]">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '@/api/apiClient';

const isLoading = ref(false);
const message = ref('');
const messageType = ref('');
const email = ref('');

// Функция для повторной отправки письма верификации
const resendVerification = async () => {
  if (!email.value) {
    // Если email не заполнен, показываем форму ввода email
    const userEmail = prompt('Пожалуйста, введите ваш email для повторной отправки письма');
    if (!userEmail) return;
    email.value = userEmail;
  }
  
  isLoading.value = true;
  message.value = '';
  
  try {
    await apiClient.post('/auth/resend-verification', { email: email.value });
    message.value = 'Письмо с подтверждением отправлено на ваш email';
    messageType.value = 'success';
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Не удалось отправить письмо';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.verification-failed {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.status-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.status-icon.error {
  color: #f44336;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

p {
  margin-bottom: 20px;
  color: #666;
  line-height: 1.5;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
}

.message.success {
  background-color: #e8f5e9;
  color: #4CAF50;
}

.message.error {
  background-color: #ffebee;
  color: #f44336;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn.primary {
  background-color: #2196F3;
  color: white;
}

.btn.secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 