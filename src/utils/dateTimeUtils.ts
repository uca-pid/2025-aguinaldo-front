import dayjs from "./dayjs.config";
import { Dayjs } from "dayjs";




export const filterAvailableTimeSlots = (timeSlots: string[]): string[] => {
  const now = dayjs().tz('America/Argentina/Buenos_Aires');
  
  return timeSlots.filter((timeSlot: string) => {
    const slotDateTime = dayjs(timeSlot).tz('America/Argentina/Buenos_Aires');
    
    if (slotDateTime.isSame(now, 'day')) {
      return slotDateTime.isAfter(now);
    }
    
    return slotDateTime.isAfter(now, 'day');
  });
};


export const formatDateTime = (dateTime: string, format: string = 'DD/MM/YYYY HH:mm'): string => {
  return dayjs(dateTime).tz('America/Argentina/Buenos_Aires').format(format);
};


export const formatTime = (dateTime: string): string => {
  return dayjs(dateTime).tz('America/Argentina/Buenos_Aires').format('HH:mm');
};

export const formatDate = (dateTime: string): string => {
  return dayjs(dateTime).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY');
};

export const dayjsArgentina = (dateTime?: string | Date | dayjs.Dayjs) => {
  return dayjs(dateTime).tz('America/Argentina/Buenos_Aires');
};

export const nowArgentina = () => {
  return dayjs().tz('America/Argentina/Buenos_Aires');
};

export const shouldDisableDate = (date: Dayjs, availableDates: string[]): boolean => {
  const dateString = date.format('YYYY-MM-DD');
  return !availableDates.includes(dateString);
};