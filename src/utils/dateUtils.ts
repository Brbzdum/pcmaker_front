/**
 * Utility functions for date formatting
 */

/**
 * Format a date string to a localized Russian format (DD.MM.YYYY)
 * @param dateString - The date string to format
 * @param fallbackMessage - Optional custom message to display when date is invalid (default: 'Дата не указана')
 * @returns Formatted date string or fallback message
 */
export function formatDate(dateString: string | number | null | undefined, fallbackMessage: string = 'Дата не указана'): string {
  // If date is null, undefined or empty string
  if (!dateString) {
    return fallbackMessage;
  }
  
  try {
    let date: Date;
    
    // Check if dateString is a number (timestamp)
    if (typeof dateString === 'number') {
      date = new Date(dateString);
    } 
    // Check if dateString is a string
    else if (typeof dateString === 'string') {
      // If string is empty
      if (dateString.trim() === '') {
        return fallbackMessage;
      }
      
      // Try to parse as timestamp (if it's all digits)
      if (/^\d+$/.test(dateString)) {
        const timestamp = parseInt(dateString, 10);
        date = new Date(timestamp);
        
        // If the timestamp is too small (before 2000) or too large (after 2100), 
        // it's probably not a valid timestamp in milliseconds
        const year = date.getFullYear();
        if (year < 2000 || year > 2100) {
          // Try as timestamp in seconds (common in some APIs)
          date = new Date(timestamp * 1000);
        }
      } else {
        // Try to convert the string directly to a Date object
        date = new Date(dateString);
        
        // Check ISO format with T (with or without Z)
        if (isNaN(date.getTime()) && dateString.includes('T')) {
          // Try to fix timezone issues
          const isoDate = dateString.replace(' ', 'T');
          date = new Date(isoDate);
        }
        
        // Check dd.MM.yyyy format
        if (isNaN(date.getTime()) && dateString.includes('.') && dateString.split('.').length === 3) {
          const parts = dateString.split('.');
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        
        // Check yyyy-MM-dd format
        if (isNaN(date.getTime()) && dateString.includes('-') && dateString.split('-').length === 3) {
          date = new Date(dateString);
        }
      }
    } else {
      return fallbackMessage;
    }
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
    }
    
    // If all parsing attempts failed, return the fallback message
    return fallbackMessage;
  } catch (error) {
    console.error('Ошибка при форматировании даты:', error);
    return fallbackMessage;
  }
}

/**
 * Format a date string with time to a localized Russian format (DD.MM.YYYY HH:MM)
 * @param dateString - The date string to format
 * @param fallbackMessage - Optional custom message to display when date is invalid (default: 'Дата не указана')
 * @returns Formatted date string with time or fallback message
 */
export function formatDateWithTime(dateString: string | number | null | undefined, fallbackMessage: string = 'Дата не указана'): string {
  // If date is null, undefined or empty string
  if (!dateString) {
    return fallbackMessage;
  }
  
  try {
    let date: Date;
    
    // Check if dateString is a number (timestamp)
    if (typeof dateString === 'number') {
      date = new Date(dateString);
    } 
    // Check if dateString is a string
    else if (typeof dateString === 'string') {
      // If string is empty
      if (dateString.trim() === '') {
        return fallbackMessage;
      }
      
      // Try to parse as timestamp (if it's all digits)
      if (/^\d+$/.test(dateString)) {
        const timestamp = parseInt(dateString, 10);
        date = new Date(timestamp);
        
        // If the timestamp is too small (before 2000) or too large (after 2100), 
        // it's probably not a valid timestamp in milliseconds
        const year = date.getFullYear();
        if (year < 2000 || year > 2100) {
          // Try as timestamp in seconds (common in some APIs)
          date = new Date(timestamp * 1000);
        }
      } else {
        // Try to convert the string directly to a Date object
        date = new Date(dateString);
        
        // Check ISO format with T (with or without Z)
        if (isNaN(date.getTime()) && dateString.includes('T')) {
          // Try to fix timezone issues
          const isoDate = dateString.replace(' ', 'T');
          date = new Date(isoDate);
        }
        
        // Check dd.MM.yyyy format
        if (isNaN(date.getTime()) && dateString.includes('.') && dateString.split('.').length === 3) {
          const parts = dateString.split('.');
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        
        // Check yyyy-MM-dd format
        if (isNaN(date.getTime()) && dateString.includes('-') && dateString.split('-').length === 3) {
          date = new Date(dateString);
        }
      }
    } else {
      return fallbackMessage;
    }
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
    
    // If all parsing attempts failed, return the fallback message
    return fallbackMessage;
  } catch (error) {
    console.error('Ошибка при форматировании даты со временем:', error);
    return fallbackMessage;
  }
} 