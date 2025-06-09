<template>
  <div class="home">
    <section class="hero">
      <!-- Неоновый дракон теперь непосредственно в шаблоне -->
      <svg class="neon-dragon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
        <!-- Желтые элементы -->
        <path d="M890 190c-30-20-60-25-80-25-50 0-90 30-130 70-20 20-40 10-60-20-10-20-20-40-40-50-20-10-40-10-60 0-10 10-20 20-25 35-5 15-5 30 0 45 5 15 15 25 30 30 10 5 20 5 30 0 10-5 20-15 25-25 5-10 5-25-5-35-5-5-10-10-20-10s-15 5-20 10c-5 5-5 15 0 20 5 5 10 5 15 0 5-5 5-10 0-15" fill="none" stroke="#ffee00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="neon-yellow"/>
        <path d="M600 140c-25-25-60-40-95-40-35 0-70 15-95 40-25 25-40 60-40 95 0 35 15 70 40 95 25 25 60 40 95 40 35 0 70-15 95-40 25-25 40-60 40-95 0-35-15-70-40-95z" fill="none" stroke="#ffee00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="neon-yellow"/>
        
        <!-- Голубые элементы -->
        <path d="M350 190c-15-20-45-25-70-25-40 0-75 20-100 50-15 20-35 30-55 35-40 10-85-5-120-40-25-25-40-60-40-95 0-35 15-70 40-95 25-25 60-40 95-40 35 0 70 15 95 40 25 25 40 60 40 95 0 15-5 35-15 50" fill="none" stroke="#00ffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="neon-blue"/>
        <path d="M180 180c-20 20-30 45-30 70 0 25 10 50 30 70 20 20 45 30 70 30 25 0 50-10 70-30 20-20 30-45 30-70 0-25-10-50-30-70-20-20-45-30-70-30-25 0-50 10-70 30z" fill="none" stroke="#00ffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="neon-blue"/>
        <path d="M460 280c-15-25-40-40-70-40-30 0-55 15-70 40-15 25-15 55 0 80 15 25 40 40 70 40 30 0 55-15 70-40 15-25 15-55 0-80z" fill="none" stroke="#00ffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="neon-blue"/>
        <path d="M380 220c0-15-5-30-15-40-10-10-25-15-40-15-15 0-30 5-40 15-10 10-15 25-15 40 0 15 5 30 15 40 10 10 25 15 40 15 15 0 30-5 40-15 10-10 15-25 15-40z" fill="none" stroke="#00ffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="neon-blue"/>
        
        <!-- Фиолетовые элементы -->
        <path d="M800 250c-20-15-45-20-70-15-25 5-45 20-55 45-5 15-5 30 0 45 5 15 15 25 30 30 10 5 25 5 35-5 10-5 15-15 15-25s-5-20-15-25c-5-5-15-5-20 0-5 5-10 10-5 15 0 5 5 10 10 10 5 0 10-5 10-10" fill="none" stroke="#cc00cc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="neon-purple"/>
        <path d="M670 270c-10-25-35-40-60-40-25 0-50 15-60 40-5 15-5 30 5 45 10 15 25 20 40 20 15 0 30-5 40-20 10-15 10-30 5-45" fill="none" stroke="#cc00cc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="neon-purple"/>
        <path d="M250 250c-30-20-65-30-100-30-35 0-70 10-100 30-30 20-50 50-60 85-10 35-5 70 15 100 20 30 50 50 85 60 35 10 70 5 100-15 30-20 50-50 60-85 10-35 5-70-15-100 20 0 40 0 50-15 15-20 15-50 0-70-15-15-35-20-55-15-20 5-35 20-40 40-5 20 0 40 15 55 15 15 35 20 55 15 20-5 35-20 40-40" fill="none" stroke="#cc00cc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="neon-purple"/>
        <path d="M760 150c-5-15-15-25-30-30-15-5-30-5-45 0-15 5-25 15-30 30-5 15-5 30 0 45 5 15 15 25 30 30 15 5 30 5 45 0 15-5 25-15 30-30 5-15 5-30 0-45z" fill="none" stroke="#cc00cc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="neon-purple"/>
        <path d="M450 100c-15-25-40-40-70-40-30 0-55 15-70 40-15 25-15 55 0 80 15 25 40 40 70 40 30 0 55-15 70-40 15-25 15-55 0-80z" fill="none" stroke="#cc00cc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="neon-purple"/>
      </svg>
      
      <div class="hero-content">
        <h1 class="hero-title">Соберите компьютер своей мечты или выберите готовое решение</h1>
        
        <div class="hero-actions">
          <RouterLink to="/configurator" class="btn btn-primary">Собрать ПК</RouterLink>
          <RouterLink to="/catalog" class="btn btn-secondary">Каталог товаров</RouterLink>
        </div>
      </div>
    </section>
    
    <section class="categories">
      <h2 class="section-title">Каталог товаров</h2>
      
      <div class="category-grid">
        <!-- Готовые сборки ПК -->
        <div class="category-card">
          <div class="category-image">
            <img src="https://via.placeholder.com/400x300?text=Готовые+ПК" alt="Готовые ПК" />
          </div>
          <div class="category-content">
            <h3>Готовые ПК</h3>
            <p>Оптимизированные сборки для любых задач: игр, работы и творчества</p>
            <RouterLink to="/catalog?type=prebuilt" class="btn-category">Смотреть</RouterLink>
          </div>
        </div>
        
        <!-- Ноутбуки -->
        <div class="category-card">
          <div class="category-image">
            <img src="https://via.placeholder.com/400x300?text=Ноутбуки" alt="Ноутбуки" />
          </div>
          <div class="category-content">
            <h3>Ноутбуки</h3>
            <p>Игровые и офисные ноутбуки для работы и развлечений</p>
            <RouterLink to="/catalog?type=laptops" class="btn-category">Смотреть</RouterLink>
          </div>
        </div>
        
        <!-- Мониторы -->
        <div class="category-card">
          <div class="category-image">
            <img src="https://via.placeholder.com/400x300?text=Мониторы" alt="Мониторы" />
          </div>
          <div class="category-content">
            <h3>Мониторы</h3>
            <p>Дисплеи с высоким разрешением, быстрым откликом и яркими цветами</p>
            <RouterLink to="/catalog?type=monitors" class="btn-category">Смотреть</RouterLink>
          </div>
        </div>
        
        <!-- Периферия -->
        <div class="category-card">
          <div class="category-image">
            <img src="https://via.placeholder.com/400x300?text=Периферия" alt="Периферия" />
          </div>
          <div class="category-content">
            <h3>Периферия</h3>
            <p>Клавиатуры, мыши, гарнитуры и другие аксессуары для комфортной работы</p>
            <RouterLink to="/catalog?type=peripherals" class="btn-category">Смотреть</RouterLink>
          </div>
        </div>
        
        <!-- Комплектующие -->
        <div class="category-card">
          <div class="category-image">
            <img src="https://via.placeholder.com/400x300?text=Комплектующие" alt="Комплектующие" />
          </div>
          <div class="category-content">
            <h3>Комплектующие</h3>
            <p>Процессоры, видеокарты, память и другие детали для сборки ПК</p>
            <RouterLink to="/catalog" class="btn-category">Смотреть</RouterLink>
          </div>
        </div>
        
        <!-- Сетевое оборудование -->
        <div class="category-card">
          <div class="category-image">
            <img src="https://via.placeholder.com/400x300?text=Сетевое+оборудование" alt="Сетевое оборудование" />
          </div>
          <div class="category-content">
            <h3>Сетевое оборудование</h3>
            <p>Роутеры, коммутаторы и другие устройства для создания домашней сети</p>
            <RouterLink to="/catalog?type=network" class="btn-category">Смотреть</RouterLink>
          </div>
        </div>
      </div>
    </section>
    
    <section class="configurator-promo">
      <div class="promo-content">
        <div class="promo-text">
          <h2>Соберите компьютер своей мечты</h2>
          <p>Наш конфигуратор поможет подобрать совместимые комплектующие для идеальной производительности</p>
          <ul class="promo-features">
            <li>Проверка совместимости компонентов</li>
            <li>Контроль бюджета</li>
            <li>Рекомендации по выбору</li>
            <li>Сохранение конфигураций</li>
          </ul>
          <RouterLink to="/configurator" class="btn btn-primary">Начать сборку</RouterLink>
        </div>
        <div class="promo-image">
          <img src="https://via.placeholder.com/500x300?text=Конфигуратор" alt="Конфигуратор ПК" />
          <div class="pcmaker-logo-overlay">
            <PcMakerLogo />
          </div>
        </div>
      </div>
    </section>
    
    <section class="popular-products">
      <h2 class="section-title">Популярные товары</h2>
      
      <div class="products-grid">
        <!-- Товар 1 -->
        <div class="product-card">
          <div class="product-image">
            <img src="https://via.placeholder.com/250x200?text=Товар" alt="Товар" />
          </div>
          <div class="product-content">
            <h3>Intel Core i7-12700K</h3>
            <div class="product-price">$379.99</div>
            <div class="product-actions">
              <RouterLink to="/catalog/1" class="btn-details">Подробнее</RouterLink>
              <button class="btn-cart">В корзину</button>
            </div>
          </div>
        </div>
        
        <!-- Товар 2 -->
        <div class="product-card">
          <div class="product-image">
            <img src="https://via.placeholder.com/250x200?text=Товар" alt="Товар" />
          </div>
          <div class="product-content">
            <h3>Nvidia GeForce RTX 3080</h3>
            <div class="product-price">$699.99</div>
            <div class="product-actions">
              <RouterLink to="/catalog/3" class="btn-details">Подробнее</RouterLink>
              <button class="btn-cart">В корзину</button>
            </div>
          </div>
        </div>
        
        <!-- Товар 3 -->
        <div class="product-card">
          <div class="product-image">
            <img src="https://via.placeholder.com/250x200?text=Товар" alt="Товар" />
          </div>
          <div class="product-content">
            <h3>Samsung 970 EVO Plus 1TB</h3>
            <div class="product-price">$129.99</div>
            <div class="product-actions">
              <RouterLink to="/catalog/9" class="btn-details">Подробнее</RouterLink>
              <button class="btn-cart">В корзину</button>
            </div>
          </div>
        </div>
        
        <!-- Товар 4 -->
        <div class="product-card">
          <div class="product-image">
            <img src="https://via.placeholder.com/250x200?text=Товар" alt="Товар" />
          </div>
          <div class="product-content">
            <h3>NZXT H510</h3>
            <div class="product-price">$69.99</div>
            <div class="product-actions">
              <RouterLink to="/catalog/13" class="btn-details">Подробнее</RouterLink>
              <button class="btn-cart">В корзину</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="advantages">
      <h2 class="section-title">Наши преимущества</h2>
      
      <div class="advantages-grid">
        <div class="advantage-card">
          <div class="advantage-icon">🛒</div>
          <h3>Широкий ассортимент</h3>
          <p>Тысячи товаров от ведущих производителей компьютерной техники</p>
        </div>
        
        <div class="advantage-card">
          <div class="advantage-icon">🚚</div>
          <h3>Быстрая доставка</h3>
          <p>Доставляем заказы в кратчайшие сроки по всей России</p>
        </div>
        
        <div class="advantage-card">
          <div class="advantage-icon">💰</div>
          <h3>Выгодные цены</h3>
          <p>Регулярные акции и скидки на популярные товары</p>
        </div>
        
        <div class="advantage-card">
          <div class="advantage-icon">👨‍💻</div>
          <h3>Экспертная поддержка</h3>
          <p>Наши специалисты помогут с выбором и проконсультируют по любым вопросам</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import PcMakerLogo from '@/components/PcMakerLogo.vue'
</script>

<style scoped>
/* Стили для главной страницы */
.home {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--background-color, #f8f9fa);
}

/* Герой секция */
.hero {
  position: relative;
  width: 100%;
  min-height: 70vh; /* Увеличиваем чуть высоту для лучшего отображения дракона */
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-bottom: 4rem;
  background: linear-gradient(135deg, rgba(0, 0, 40, 0.9) 0%, rgba(0, 30, 100, 0.8) 100%); /* Темнее фон для лучшего контраста */
  padding: 2rem 0;
  overflow: hidden;
}

/* Неоновый дракон как SVG */
.neon-dragon {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  opacity: 0.8;
}

/* Неоновые эффекты для элементов дракона */
.neon-dragon .neon-yellow {
  filter: drop-shadow(0 0 5px rgba(255, 238, 0, 0.8)) drop-shadow(0 0 10px rgba(255, 238, 0, 0.6));
  animation: neon-pulse-yellow 4s infinite alternate;
}

.neon-dragon .neon-blue {
  filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 10px rgba(0, 255, 255, 0.6));
  animation: neon-pulse-blue 3.5s infinite alternate;
}

.neon-dragon .neon-purple {
  filter: drop-shadow(0 0 5px rgba(204, 0, 204, 0.8)) drop-shadow(0 0 10px rgba(204, 0, 204, 0.6));
  animation: neon-pulse-purple 4.5s infinite alternate;
}

@keyframes neon-pulse-yellow {
  0% {
    stroke: #ffee00;
    filter: drop-shadow(0 0 5px rgba(255, 238, 0, 0.7)) drop-shadow(0 0 10px rgba(255, 238, 0, 0.5));
  }
  100% {
    stroke: #ffffaa;
    filter: drop-shadow(0 0 8px rgba(255, 238, 0, 0.9)) drop-shadow(0 0 15px rgba(255, 238, 0, 0.7));
  }
}

@keyframes neon-pulse-blue {
  0% {
    stroke: #00ffff;
    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.7)) drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
  }
  100% {
    stroke: #aaffff;
    filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.9)) drop-shadow(0 0 15px rgba(0, 255, 255, 0.7));
  }
}

@keyframes neon-pulse-purple {
  0% {
    stroke: #cc00cc;
    filter: drop-shadow(0 0 5px rgba(204, 0, 204, 0.7)) drop-shadow(0 0 10px rgba(204, 0, 204, 0.5));
  }
  100% {
    stroke: #ff33ff;
    filter: drop-shadow(0 0 8px rgba(204, 0, 204, 0.9)) drop-shadow(0 0 15px rgba(204, 0, 204, 0.7));
  }
}

.hero-title {
  font-size: 2.2rem;
  margin-bottom: 2.5rem;
  text-shadow: 0 0 10px rgba(0, 200, 255, 0.7), 0 0 20px rgba(0, 100, 255, 0.5);
  max-width: 80%; /* Увеличиваем ширину текста */
  margin-left: auto;
  margin-right: auto;
  line-height: 1.3;
  position: relative;
  z-index: 3;
  color: #ffffff;
  font-weight: 600;
}

.hero-content {
  text-align: center;
  padding: 2rem;
  width: 100%;
  max-width: 900px;
  z-index: 2;
  position: relative; /* Для правильного отображения z-index */
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.btn {
  position: relative;
  z-index: 3;
  display: inline-block;
  padding: 0.9rem 2rem;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.btn-primary {
  background-color: #00aaff;
  color: white;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.7);
  border: 1px solid rgba(0, 200, 255, 0.3);
}

.btn-primary:hover {
  background-color: #0088cc;
  transform: translateY(-3px);
  box-shadow: 0 0 20px rgba(0, 170, 255, 0.9);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

/* Секции */
section {
  width: 100%;
  padding: 2rem 0;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--background-color);
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  position: relative;
  color: var(--text-color);
}

.section-title::after {
  content: '';
  display: block;
  width: 50px;
  height: 3px;
  background-color: #00aaff;
  margin: 1rem auto;
}

/* Категории */
.categories {
  width: 100%;
  padding: 2rem;
  background-color: var(--background-color);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1800px;
}

.category-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: var(--surface-color);
  height: 100%;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px var(--shadow-color);
}

.category-image img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
}

.category-content {
  padding: 2rem;
}

.category-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.6rem;
  color: var(--text-color);
}

.category-content p {
  color: var(--text-secondary-color);
  margin-bottom: 1.5rem;
  min-height: 60px;
  font-size: 1.05rem;
}

.btn-category {
  display: inline-block;
  padding: 0.7rem 1.5rem;
  background-color: #00aaff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.btn-category:hover {
  background-color: #0088cc;
  transform: translateY(-2px);
}

/* Промо конфигуратора */
.configurator-promo {
  width: 100%;
  padding: 5rem 2rem;
  transition: background-color 0.3s ease;
  margin: 4rem 0;
  position: relative;
}

.promo-content {
  display: flex;
  align-items: center;
  gap: 5rem;
  max-width: 1800px;
  width: 100%;
}

.promo-text {
  flex: 1;
}

.promo-text h2 {
  margin-top: 0;
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.promo-text p {
  color: var(--text-secondary-color);
}

.promo-features {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}

.promo-features li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
  color: var(--text-color);
}

.promo-features li::before {
  content: '✓';
  color: #00aaff;
  position: absolute;
  left: 0;
  top: 0;
  font-weight: bold;
}

.promo-image {
  flex: 1;
  position: relative;
}

.pcmaker-logo-overlay {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 120px;
  height: 60px;
  opacity: 0.8;
  z-index: 2;
}

.promo-image img {
  width: 300%;
  border-radius: 8px;
  box-shadow: 0 5px 15px var(--shadow-color);
}

/* Популярные товары */
.popular-products {
  width: 100%;
  padding: 2rem;
  background-color: var(--background-color);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1800px;
}

.product-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: var(--surface-color);
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px var(--shadow-color);
}

.product-image img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.product-content {
  padding: 2rem;
}

.product-content h3 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
  height: 44px;
  color: var(--text-color);
}

.product-price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #00aaff;
  margin-bottom: 1.5rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-details,
.btn-cart {
  flex: 1;
  padding: 0.8rem;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;
}

.btn-details {
  background-color: var(--light-color, #f1f1f1);
  color: var(--text-color, #333);
  text-decoration: none;
  border: 1px solid transparent;
}

.btn-details:hover {
  background-color: #e1e1e1;
}

.btn-cart {
  background-color: #00aaff;
  color: white;
  border: none;
}

.btn-cart:hover {
  background-color: #0088cc;
}

/* Преимущества */
.advantages {
  width: 100%;
  padding: 2rem;
  background-color: var(--background-color);
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1800px;
}

.advantage-card {
  padding: 3rem 2rem;
  text-align: center;
  background-color: var(--surface-color, #fff);
  border-radius: 8px;
  box-shadow: 0 5px 15px var(--shadow-color, rgba(0,0,0,0.1));
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  height: 100%;
  border: 1px solid transparent;
}

.advantage-card:hover {
  transform: translateY(-5px);
}

.advantage-icon {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 5px rgba(0, 170, 255, 0.5));
}

.advantage-card h3 {
  margin-top: 0;
  margin-bottom: 1.2rem;
  color: var(--text-color, #333);
  font-size: 1.5rem;
}

.advantage-card p {
  color: var(--text-secondary-color, #666);
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .promo-content {
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .neon-dragon {
    width: 70%;
    height: 50%;
    right: -15%;
    top: 10%;
    opacity: 0.5;
  }
  
  .hero-title {
    max-width: 90%;
    font-size: 1.8rem;
  }
  
  .promo-content {
    flex-direction: column;
  }
  
  .promo-image {
    order: -1;
  }
  
  .category-grid,
  .products-grid,
  .advantages-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1600px) {
  .hero-content {
    max-width: 1400px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .promo-content {
    max-width: 1600px;
  }
  
  .promo-text h2 {
    font-size: 2.5rem;
  }
  
  .promo-text p {
    font-size: 1.2rem;
  }
  
  .promo-features li {
    font-size: 1.1rem;
  }
}
</style> 