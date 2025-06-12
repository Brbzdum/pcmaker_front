<RouterLink v-if="authStore.getIsAuthenticated" to="/configurator" class="nav-link">
  Конфигуратор
</RouterLink>

<RouterLink v-if="authStore.getIsAuthenticated" to="/my-configurations" class="nav-link">
  Мои конфигурации
</RouterLink> 