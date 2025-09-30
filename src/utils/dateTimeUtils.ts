import dayjs, { Dayjs } from "dayjs";

/**
 * Utility functions for date and time operations
 */

/**
 * Filter available time slots to exclude past times
 */
export const filterAvailableTimeSlots = (timeSlots: string[]): string[] => {
  const now = dayjs();
  
  return timeSlots.filter((timeSlot: string) => {
    const slotDateTime = dayjs(timeSlot);
    
    if (slotDateTime.isSame(now, 'day')) {
      return slotDateTime.isAfter(now);
    }
    
    return slotDateTime.isAfter(now, 'day');
  });
};

/**
 * Format datetime for display
 */
export const formatDateTime = (dateTime: string, format: string = 'DD/MM/YYYY HH:mm'): string => {
  return dayjs(dateTime).format(format);
};

/**
 * Format time only for display
 */
export const formatTime = (dateTime: string): string => {
  return dayjs(dateTime).format('HH:mm');
};

/**
 * Check if a date should be disabled in calendar
 */
export const shouldDisableDate = (date: Dayjs, availableDates: string[]): boolean => {
  const dateString = date.format('YYYY-MM-DD');
  return !availableDates.includes(dateString);
};