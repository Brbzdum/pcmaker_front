<template>
  <div class="verification-success">
    <div class="card">
      <div class="status-icon success">
        <i class="fa fa-check-circle"></i>
      </div>
      <h1>Подтверждение успешно!</h1>
      <p>Ваш email подтвержден, и вы успешно вошли в систему.</p>
      <p v-if="isLoading">Выполняется вход...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="actions">
        <router-link to="/" class="btn primary">На главную</router-link>
        <router-link to="/profile" class="btn secondary">Перейти в профиль</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(true);
const error = ref('');

// Автоматический вход с токеном из URL
onMounted(async () => {
  const token = route.query.token as string;
  
  if (token) {
    try {
      // Сохраняем токен
      localStorage.setItem('access_token', token);
      
      // Устанавливаем флаг аутентификации
      authStore.$patch({
        isAuthenticated: true
      });
      
      // Загружаем данные пользователя
      await authStore.fetchUserProfile();
      
      isLoading.value = false;
      
      // Редирект на главную через 3 секунды
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      error.value = 'Ошибка при автоматическом входе: ' + (err.message || 'Неизвестная ошибка');
      isLoading.value = false;
    }
  } else {
    error.value = 'Токен аутентификации не найден';
    isLoading.value = false;
  }
});
</script>

<style scoped>
.verification-success {
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

.status-icon.success {
  color: #4CAF50;
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

.error {
  color: #f44336;
  font-weight: bold;
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
}

.btn.primary {
  background-color: #4CAF50;
  color: white;
}

.btn.secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 