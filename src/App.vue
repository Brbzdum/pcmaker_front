<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import PcMakerLogo from '@/components/PcMakerLogo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useTheme } from '@/composables/useTheme'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.getIsAuthenticated)
const { currentTheme } = useTheme()
</script>

<template>
  <header class="site-header">
    <div class="header-content">
      <div class="header-left">
        <RouterLink to="/" class="logo-link">
          <PcMakerLogo />
        </RouterLink>
        
        <nav class="main-nav">
          <RouterLink to="/" class="nav-link">Главная</RouterLink>
          <RouterLink to="/catalog" class="nav-link">Каталог</RouterLink>
          <RouterLink to="/configurator" class="nav-link">Конфигуратор</RouterLink>
        </nav>
      </div>
      
      <div class="header-right">
        <ThemeToggle class="theme-toggle-wrapper" />
        
        <div class="auth-cart-container">
          <RouterLink v-if="!isAuthenticated" to="/login" class="nav-link">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span>Вход</span>
          </RouterLink>
          
          <RouterLink v-if="isAuthenticated" to="/profile" class="nav-link user-link">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span>Профиль</span>
          </RouterLink>
          
          <RouterLink to="/cart" class="nav-link cart-link">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-svg">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </span>
            <span>Корзина</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </header>

  <main>
    <RouterView />
  </main>

  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-logo">
        <div class="footer-logo-container">
          <PcMakerLogo />
        </div>
        <p>© 2023 PcMaker. Все права защищены.</p>
      </div>
      
      <div class="footer-links">
        <div class="footer-col">
          <h4>О компании</h4>
          <ul>
            <li><a href="#">О нас</a></li>
            <li><a href="#">Контакты</a></li>
            <li><a href="#">Доставка</a></li>
          </ul>
        </div>
        
        <div class="footer-col">
          <h4>Помощь</h4>
          <ul>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Условия использования</a></li>
            <li><a href="#">Политика конфиденциальности</a></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style>
/* Переменные тем */
:root, .theme-light {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --accent-color: #f1c40f;
  --dark-color: #2c3e50;
  --light-color: #ecf0f1;
  --danger-color: #e74c3c;
  --text-color: #333;
  --text-secondary-color: #666;
  --background-color: #f8f9fa;
  --surface-color: #ffffff;
  --border-color: #e1e1e1;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --logo-bg-color: #f9f9f9;
  --header-height: 70px;
}

.theme-dark {
  --primary-color: #2196f3;
  --secondary-color: #26a69a;
  --accent-color: #ffb300;
  --dark-color: #1e1e1e;
  --light-color: #f5f5f5;
  --danger-color: #f44336;
  --text-color: #f5f5f5;
  --text-secondary-color: #aaaaaa;
  --background-color: #121212;
  --surface-color: #1e1e1e;
  --border-color: #333333;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --logo-bg-color: #1e1e1e;
  --header-height: 70px;
}

/* Сброс стилей */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Шапка */
.site-header {
  background-color: #111111; /* Темный фон */
  box-shadow: 0 0 15px rgba(0, 100, 255, 0.2); /* Неоновая тень */
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  border-bottom: 1px solid rgba(0, 119, 255, 0.2); /* Неоновая граница */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
  padding: 0 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.5rem;
}

.logo-link {
  display: block;
  text-decoration: none;
  width: 120px; /* Уменьшаем размер логотипа */
  margin-right: 3rem;
  transition: all 0.3s ease;
}

.logo-link:hover {
  filter: brightness(1.2);
  transform: scale(1.05);
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: #f0f0f0; /* Светлее для лучшего контраста */
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin: 0 0.25rem;
  display: flex;
  align-items: center;
}

.nav-link:hover {
  background-color: rgba(0, 119, 255, 0.15); /* Неоновый эффект при наведении */
  color: #00aaff; /* Голубой оттенок при наведении */
  text-shadow: 0 0 5px rgba(0, 170, 255, 0.5); /* Неоновое свечение текста */
}

.nav-link.router-link-active {
  color: #00aaff; /* Неоновый голубой для активной ссылки */
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 170, 255, 0.7); /* Усиленное неоновое свечение для активной ссылки */
}

.theme-toggle-wrapper {
  margin-right: 1rem;
}

.auth-cart-container {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-svg {
  width: 18px;
  height: 18px;
}

/* Основное содержимое */
main {
  flex: 1;
  width: 100%;
  background-color: var(--background-color);
  transition: background-color 0.3s ease;
}

/* Подвал сайта */
.site-footer {
  background-color: #141414;
  color: #f5f5f5;
  padding: 3rem 2rem;
  transition: background-color 0.3s ease;
  width: 100%;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.footer-logo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex: 1;
  min-width: 300px;
}

.footer-logo-container {
  width: 100px;
  margin-bottom: 1rem;
}

.footer-links {
    display: flex;
  flex-wrap: wrap;
  gap: 3rem;
}

.footer-col h4 {
  margin-bottom: 1.2rem;
  font-size: 1.1rem;
  position: relative;
  color: var(--primary-color);
  letter-spacing: 0.5px;
}

.footer-col h4::after {
  content: '';
  display: block;
  width: 30px;
  height: 2px;
  background-color: var(--primary-color);
  margin-top: 0.5rem;
}

.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-col ul li {
  margin-bottom: 0.6rem;
}

.footer-col ul li a {
  color: #bbb;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
  display: inline-block;
  font-size: 0.95rem;
}

.footer-col ul li a:hover {
  color: var(--primary-color);
  transform: translateX(3px);
}

/* Адаптивность */
@media (max-width: 1200px) {
  .header-content, .footer-content {
    padding: 0 1rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 1rem 0;
  }

  .header-left, .header-right {
    width: 100%;
    flex-direction: column;
    align-items: center;
  }
  
  .logo-link {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .main-nav {
    width: 100%;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .auth-cart-container {
    width: 100%;
    justify-content: center;
  }
  
  .theme-toggle-wrapper {
    margin: 1rem 0;
  }
  
  .footer-content {
    flex-direction: column;
  }
  
  .footer-links {
    width: 100%;
  }
}

@media (min-width: 1600px) {
  .header-content, .footer-content {
    max-width: 1600px;
  }
  
  .logo-link {
    width: 160px;
    margin-right: 4rem;
  }
  
  .nav-link {
    font-size: 1.1rem;
    padding: 0.6rem 1.2rem;
  }
  
  .footer-logo {
    min-width: 400px;
  }
  
  .footer-logo-container {
    width: 140px;
  }
  
  .footer-links {
    gap: 6rem;
  }
  
  .footer-col h4 {
    font-size: 1.3rem;
  }
  
  .footer-col ul li a {
    font-size: 1.1rem;
  }
}
</style>
