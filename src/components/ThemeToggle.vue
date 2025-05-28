<template>
  <button class="theme-toggle" @click="toggleTheme" :title="themeTitle">
    <!-- Иконка солнца (светлая тема) -->
    <svg v-if="currentTheme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    
    <!-- Иконка луны (темная тема) -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

// Получаем функции и состояние из composable
const { currentTheme, toggleTheme } = useTheme()

// Вычисляем заголовок кнопки в зависимости от текущей темы
const themeTitle = computed(() => 
  currentTheme.value === 'light' 
    ? 'Переключиться на темную тему' 
    : 'Переключиться на светлую тему'
)
</script>

<style scoped>
.theme-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.theme-toggle:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.theme-icon {
  width: 22px;
  height: 22px;
  color: var(--text-color);
  transition: transform 0.3s ease;
}

.theme-toggle:hover .theme-icon {
  transform: rotate(30deg);
}

/* Стили для темной темы */
:global(.theme-dark) .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style> 