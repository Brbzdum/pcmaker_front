<template>
  <div class="ready-configurations">
    <h1>Готовые конфигурации</h1>
    <p>Страница находится в разработке. Скоро здесь появятся готовые конфигурации ПК.</p>
    
    <div class="actions">
      <RouterLink to="/configurator" class="btn-configurator">
        Перейти в конфигуратор
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Здесь будет логика для отображения готовых конфигураций
</script>

<style scoped>
.ready-configurations {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  margin-bottom: 2rem;
}

.actions {
  margin-top: 2rem;
}

.btn-configurator {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}
</style> 