import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('dayjs.config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export configured dayjs instance', async () => {
    // Import our configuration
    const configuredDayjs = await import('./dayjs.config')
    
    // Verify the export exists
    expect(configuredDayjs.default).toBeDefined()
    expect(typeof configuredDayjs.default).toBe('function')
  })

  it('should have timezone functionality available', async () => {
    // Import our configuration
    const configuredDayjs = await import('./dayjs.config')
    const dayjs = configuredDayjs.default
    
    // Verify timezone methods are available
    expect(dayjs.tz).toBeDefined()
    expect(typeof dayjs.tz).toBe('function')
  })

  it('should have utc functionality available', async () => {
    // Import our configuration
    const configuredDayjs = await import('./dayjs.config')
    const dayjs = configuredDayjs.default
    
    // Verify utc methods are available
    expect(dayjs.utc).toBeDefined()
    expect(typeof dayjs.utc).toBe('function')
  })

  it('should have locale functionality available', async () => {
    // Import our configuration
    const configuredDayjs = await import('./dayjs.config')
    const dayjs = configuredDayjs.default
    
    // Verify locale methods are available
    expect(dayjs.locale).toBeDefined()
    expect(typeof dayjs.locale).toBe('function')
  })

  it('should create dayjs instance with Argentina timezone support', async () => {
    // Import our configuration
    const configuredDayjs = await import('./dayjs.config')
    const dayjs = configuredDayjs.default
    
    // Create a test date
    const testDate = dayjs('2025-10-20T13:00:00Z')
    
    // Verify timezone conversion works
    expect(testDate.tz).toBeDefined()
    expect(typeof testDate.tz).toBe('function')
    
    // Test that we can call timezone function without error
    const argentinaTime = testDate.tz('America/Argentina/Buenos_Aires')
    expect(argentinaTime).toBeDefined()
  })
})