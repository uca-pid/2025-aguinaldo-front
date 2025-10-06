import { describe, it, expect, vi } from 'vitest'
import { validateField, checkFormValidation } from './authFormValidation'

// Mock dayjs
vi.mock('dayjs', () => ({
  default: Object.assign(
    vi.fn((date: string) => ({
      isValid: () => date === 'valid-date',
      subtract: vi.fn(() => ({
        isAfter: vi.fn(() => false),
        isBefore: vi.fn(() => false)
      })),
      isAfter: vi.fn(() => false),
      isBefore: vi.fn(() => false)
    })),
    {
      extend: vi.fn()
    }
  )
}))

// Mock dayjs plugins
vi.mock('dayjs/plugin/customParseFormat', () => ({
  default: vi.fn()
}))

vi.mock('dayjs/plugin/isSameOrAfter', () => ({
  default: vi.fn()
}))

vi.mock('dayjs/plugin/isSameOrBefore', () => ({
  default: vi.fn()
}))

describe('authFormValidation', () => {
  const createMockContext = (overrides: any = {}) => ({
    mode: 'register' as const,
    isPatient: true,
    hasErrorsOrEmpty: false,
    isAuthenticated: false,
    loading: false,
    formValues: {
      password: 'TestPass123',
      ...overrides.formValues
    },
    send: vi.fn(),
    ...overrides
  })

  describe('validateField', () => {
    it('should return empty string for non-login fields in login mode', () => {
      const loginContext = createMockContext({ mode: 'login' })
      expect(validateField('name', 'John', loginContext)).toBe('')
    })

    it('should return "Campo requerido" for null, undefined, or empty values', () => {
      const context = createMockContext()
      expect(validateField('name', null, context)).toBe('Campo requerido')
      expect(validateField('name', undefined, context)).toBe('Campo requerido')
      expect(validateField('name', '', context)).toBe('Campo requerido')
    })

    it('should validate email format', () => {
      const context = createMockContext()
      expect(validateField('email', 'invalid-email', context)).toBe('Email inválido')
      expect(validateField('email', 'test@example.com', context)).toBe('')
    })

    it('should validate DNI format', () => {
      const context = createMockContext()
      expect(validateField('dni', '123456', context)).toBe('DNI inválido (7 u 8 dígitos)')
      expect(validateField('dni', '1234567', context)).toBe('')
      expect(validateField('dni', '12345678', context)).toBe('')
      expect(validateField('dni', '123456789', context)).toBe('DNI inválido (7 u 8 dígitos)')
    })

    it('should validate medical license format', () => {
      const context = createMockContext()
      expect(validateField('medicalLicense', '123', context)).toBe('Matrícula inválida')
      expect(validateField('medicalLicense', '1234', context)).toBe('')
      expect(validateField('medicalLicense', '1234567890', context)).toBe('')
      expect(validateField('medicalLicense', '12345678901', context)).toBe('Matrícula inválida')
    })

    it('should validate phone format', () => {
      const context = createMockContext()
      expect(validateField('phone', '1234567', context)).toBe('Solo números, de 8-15 dígitos, opcional +')
      expect(validateField('phone', '12345678', context)).toBe('')
      expect(validateField('phone', '+123456789012345', context)).toBe('')
      expect(validateField('phone', '1234567890123456', context)).toBe('Solo números, de 8-15 dígitos, opcional +')
      expect(validateField('phone', 'abc12345678', context)).toBe('Solo números, de 8-15 dígitos, opcional +')
    })

    it('should validate password format in register mode', () => {
      const context = createMockContext()
      expect(validateField('password', 'weak', context)).toBe('Mínimo 8 caracteres, mayúscula, minúscula y número')
      expect(validateField('password', 'StrongPass123', context)).toBe('')
    })

    it('should skip password validation in login mode', () => {
      const loginContext = createMockContext({ mode: 'login' })
      expect(validateField('password', 'weak', loginContext)).toBe('')
    })

    it('should validate password confirmation', () => {
      const context = createMockContext()
      expect(validateField('password_confirm', 'different', context)).toBe('Las contraseñas no coinciden')
      expect(validateField('password_confirm', 'TestPass123', context)).toBe('')
    })

    it('should validate birthdate', () => {
      const context = createMockContext()
      expect(validateField('birthdate', 'invalid-date', context)).toBe('Fecha inválida')
      expect(validateField('birthdate', 'valid-date', context)).toBe('')
    })

    it('should return empty string for unknown fields', () => {
      const context = createMockContext()
      expect(validateField('unknownField', 'value', context)).toBe('')
    })
  })

  describe('checkFormValidation', () => {
    it('should return true when there are form errors', () => {
      const context = createMockContext({
        formErrors: { email: 'Email inválido' },
        formValues: { email: 'test@example.com', password: 'password123' },
        mode: 'login'
      })
      expect(checkFormValidation(context)).toBe(true)
    })

    it('should return true when required fields are empty in login mode', () => {
      const context = createMockContext({
        formErrors: {},
        formValues: { email: '', password: 'password123' },
        mode: 'login'
      })
      expect(checkFormValidation(context)).toBe(true)
    })

    it('should return true when required fields are empty in register mode for patient', () => {
      const context = createMockContext({
        formErrors: {},
        formValues: {
          name: 'John',
          surname: '',
          dni: '12345678',
          gender: 'MALE',
          birthdate: '1990-01-01',
          phone: '123456789',
          email: 'test@example.com',
          password: 'TestPass123',
          password_confirm: 'TestPass123'
        },
        mode: 'register'
      })
      expect(checkFormValidation(context)).toBe(true)
    })

    it('should return true when required fields are empty in register mode for doctor', () => {
      const context = createMockContext({
        formErrors: {},
        formValues: {
          name: 'Dr. John',
          surname: 'Doe',
          dni: '12345678',
          gender: 'MALE',
          birthdate: '1990-01-01',
          phone: '123456789',
          email: 'test@example.com',
          password: 'TestPass123',
          password_confirm: 'TestPass123',
          specialty: '',
          medicalLicense: '12345'
        },
        isPatient: false,
        mode: 'register'
      })
      expect(checkFormValidation(context)).toBe(true)
    })

    it('should return false when all required fields are filled and no errors', () => {
      const context = createMockContext({
        formErrors: {},
        formValues: {
          name: 'John',
          surname: 'Doe',
          dni: '12345678',
          gender: 'MALE',
          birthdate: '1990-01-01',
          phone: '123456789',
          email: 'test@example.com',
          password: 'TestPass123',
          password_confirm: 'TestPass123'
        },
        mode: 'register'
      })
      expect(checkFormValidation(context)).toBe(false)
    })

    it('should return false for valid login form', () => {
      const context = createMockContext({
        formErrors: {},
        formValues: { email: 'test@example.com', password: 'password123' },
        mode: 'login'
      })
      expect(checkFormValidation(context)).toBe(false)
    })
  })
})