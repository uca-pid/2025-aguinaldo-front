import { describe, it, expect, vi, beforeEach } from 'vitest'
import { filterAvailableTimeSlots, formatDateTime, formatTime, formatDate, dayjsArgentina, nowArgentina, shouldDisableDate } from './dateTimeUtils'
import dayjs from './dayjs.config'

// Mock dayjs with timezone support
vi.mock('./dayjs.config', () => {
  const mockDayjs = vi.fn()

  // Create a mock instance with timezone support
  const createMockInstance = (date?: any) => ({
    date: date,
    __isNow: !date,
    isSame: vi.fn((other, unit) => {
      if (unit === 'day') {
        if (date && typeof other === 'object' && other.__isNow) {
          // Check if this date is the same day as "now"
          return date.startsWith && date.startsWith('2024-01-15')
        }
        return false
      }
      return false
    }),
    isAfter: vi.fn((_other, unit) => {
      if (unit === 'day') {
        // Future dates are after today (2024-01-15)
        if (date && date.startsWith) {
          const datePart = date.split(' ')[0]
          return datePart > '2024-01-15'
        }
      }
      // For same day, check if time is after current time (10:00)
      if (date && date.startsWith && date.startsWith('2024-01-15')) {
        const time = date.split(' ')[1]
        return time > '10:00'
      }
      return false
    }),
    tz: vi.fn().mockImplementation(function(this: any) {
      // Return the same instance to allow method chaining
      return this
    }),
    format: vi.fn().mockImplementation((fmt) => {
      if (fmt === 'YYYY-MM-DD') return date && date.split ? date.split(' ')[0] : '2024-01-15'
      if (fmt === 'DD/MM/YYYY HH:mm') return '15/01/2024 10:00'
      if (fmt === 'DD/MM/YYYY') return '15/01/2024'
      if (fmt === 'HH:mm') return '10:00'
      return date || 'mocked-date'
    }),
    day: vi.fn().mockReturnValue(1)
  })

  mockDayjs.mockImplementation((date?: any) => {
    return createMockInstance(date)
  })

  return { default: mockDayjs, __esModule: true }
})

describe('dateTimeUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('filterAvailableTimeSlots', () => {
    it('should filter out past time slots for today', () => {
      const timeSlots = [
        '2024-01-15 09:00', // past
        '2024-01-15 11:00', // future
        '2024-01-15 12:00'  // future
      ]

      const result = filterAvailableTimeSlots(timeSlots)
      expect(result).toEqual(['2024-01-15 11:00', '2024-01-15 12:00'])
    })

    it('should include all future dates', () => {
      const timeSlots = [
        '2024-01-14 10:00', // past date
        '2024-01-16 09:00', // future date
        '2024-01-17 15:00'  // future date
      ]

      const result = filterAvailableTimeSlots(timeSlots)
      expect(result).toEqual(['2024-01-16 09:00', '2024-01-17 15:00'])
    })

    it('should return empty array when all slots are in the past', () => {
      const timeSlots = [
        '2024-01-15 08:00',
        '2024-01-15 09:00',
        '2024-01-14 10:00'
      ]

      const result = filterAvailableTimeSlots(timeSlots)
      expect(result).toEqual([])
    })

    it('should return all slots when they are all in the future', () => {
      const timeSlots = [
        '2024-01-16 10:00',
        '2024-01-17 11:00',
        '2024-01-18 12:00'
      ]

      const result = filterAvailableTimeSlots(timeSlots)
      expect(result).toEqual(timeSlots)
    })

    it('should handle empty array', () => {
      const result = filterAvailableTimeSlots([])
      expect(result).toEqual([])
    })
  })

  describe('formatDateTime', () => {
    it('should format datetime with default format', () => {
      const result = formatDateTime('2024-01-15 10:00')
      expect(result).toBe('15/01/2024 10:00')
    })

    it('should format datetime with custom format', () => {
      const result = formatDateTime('2024-01-15 10:00', 'YYYY-MM-DD HH:mm')
      expect(result).toBe('2024-01-15 10:00')
    })

    it('should handle different date formats', () => {
      const result = formatDateTime('2024-12-25 23:59')
      expect(result).toBe('15/01/2024 10:00') // mocked
    })
  })

  describe('formatTime', () => {
    it('should format time from datetime string', () => {
      const result = formatTime('2024-01-15 10:30')
      expect(result).toBe('10:00') // mocked
    })

    it('should handle different time formats', () => {
      const result = formatTime('2024-01-15 23:59')
      expect(result).toBe('10:00') // mocked
    })
  })

  describe('shouldDisableDate', () => {
    it('should return true for date not in available dates', () => {
      const availableDates = ['2024-01-15', '2024-01-16']
      const date = dayjs('2024-01-17')

      const result = shouldDisableDate(date, availableDates)
      expect(result).toBe(true)
    })

    it('should return false for date in available dates', () => {
      const availableDates = ['2024-01-15', '2024-01-16']
      const date = dayjs('2024-01-15')

      const result = shouldDisableDate(date, availableDates)
      expect(result).toBe(false)
    })

    it('should handle empty available dates array', () => {
      const availableDates: string[] = []
      const date = dayjs('2024-01-15')

      const result = shouldDisableDate(date, availableDates)
      expect(result).toBe(true)
    })

    it('should handle various date formats in available dates', () => {
      const availableDates = ['2024-01-15', '2024-02-01']
      const date = dayjs('2024-01-15')

      const result = shouldDisableDate(date, availableDates)
      expect(result).toBe(false)
    })
  })

  describe('formatDate', () => {
    it('should format date from datetime string', () => {
      const result = formatDate('2024-01-15 10:30')
      expect(result).toBe('15/01/2024')
    })

    it('should handle different date formats', () => {
      const result = formatDate('2024-12-25 23:59')
      expect(result).toBe('15/01/2024') // mocked
    })
  })

  describe('dayjsArgentina', () => {
    it('should create dayjs instance with Argentina timezone', () => {
      const result = dayjsArgentina('2024-01-15 10:00')
      expect(result.tz).toHaveBeenCalledWith('America/Argentina/Buenos_Aires')
    })

    it('should handle undefined date parameter', () => {
      const result = dayjsArgentina()
      expect(result.tz).toHaveBeenCalledWith('America/Argentina/Buenos_Aires')
    })
  })

  describe('nowArgentina', () => {
    it('should return current time in Argentina timezone', () => {
      const result = nowArgentina()
      expect(result.tz).toHaveBeenCalledWith('America/Argentina/Buenos_Aires')
    })
  })
})