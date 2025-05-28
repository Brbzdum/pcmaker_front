import { ref, watch, onMounted } from 'vue'

// Определяем доступные темы
type Theme = 'light' | 'dark'

// Создаем composable для работы с темой
export function useTheme() {
  // Состояние текущей темы
  const currentTheme = ref<Theme>('light')
  
  // Функция для установки темы
  const setTheme = (theme: Theme) => {
    // Обновляем значение
    currentTheme.value = theme
    
    // Обновляем класс на #app для активации CSS-правил вместо body
    const appElement = document.getElementById('app')
    if (appElement) {
      appElement.classList.remove('theme-light', 'theme-dark')
      appElement.classList.add(`theme-${theme}`)
    }
    
    // Сохраняем выбор пользователя в localStorage
    localStorage.setItem('theme', theme)
  }
  
  // Функция для переключения темы
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }
  
  // При монтировании компонента загружаем тему из localStorage или используем системные настройки
  onMounted(() => {
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') as Theme | null
    
    // Если тема уже сохранена, используем её
    if (savedTheme) {
      setTheme(savedTheme)
      return
    }
    
    // Иначе проверяем системные настройки
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
    
    // Следим за изменениями системных настроек
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  })
  
  // Возвращаем необходимые значения и функции
  return {
    currentTheme,
    setTheme,
    toggleTheme
  }
} 