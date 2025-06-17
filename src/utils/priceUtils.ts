/**
 * Форматирует число как денежную сумму
 * @param value Число для форматирования
 * @returns Отформатированная строка с ценой
 */
export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return '0'
  }
  
  // Преобразуем value в число
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  // Проверяем, является ли numValue числом
  if (isNaN(numValue)) {
    return '0'
  }
  
  // Форматируем число с разделителями тысяч
  return numValue.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
} 