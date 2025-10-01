import { describe, it, expect, vi } from 'vitest'
import { filterTurns } from './filterTurns'

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = vi.fn()

  // Current time: 2024-01-15 10:00
  const NOW = '2024-01-15 10:00'

  mockDayjs.mockImplementation((date?: any) => {
    if (!date) {
      return {
        isBefore: vi.fn().mockReturnValue(false),
        valueOf: vi.fn().mockReturnValue(new Date(NOW).getTime())
      }
    }

    return {
      isBefore: vi.fn((_other) => {
        // Compare with current time
        return date < NOW
      }),
      valueOf: vi.fn(() => new Date(date).getTime())
    }
  })

  return { default: mockDayjs, __esModule: true }
})

describe('filterTurns', () => {
  const mockTurns = [
    {
      id: 1,
      status: 'SCHEDULED',
      scheduledAt: '2024-01-16 10:00', // future
      patientName: 'John Doe'
    },
    {
      id: 2,
      status: 'SCHEDULED',
      scheduledAt: '2024-01-14 10:00', // past
      patientName: 'Jane Smith'
    },
    {
      id: 3,
      status: 'CANCELED',
      scheduledAt: '2024-01-17 10:00', // future
      patientName: 'Bob Johnson'
    },
    {
      id: 4,
      status: 'COMPLETED',
      scheduledAt: '2024-01-15 09:00', // past
      patientName: 'Alice Brown'
    },
    {
      id: 5,
      status: 'SCHEDULED',
      scheduledAt: '2024-01-18 10:00', // future
      patientName: 'Charlie Wilson'
    }
  ]

  it('should return all turns when no status filter is provided', () => {
    const result = filterTurns(mockTurns, null)
    expect(result).toHaveLength(5)
    expect(result.map((t: any) => t.id)).toEqual([5, 1, 2, 3, 4]) // sorted by priority and date
  })

  it('should filter turns by status when statusFilter is provided', () => {
    const result = filterTurns(mockTurns, 'SCHEDULED')
    expect(result).toHaveLength(3)
    expect(result.every((turn: any) => turn.status === 'SCHEDULED')).toBe(true)
    expect(result.map((t: any) => t.id)).toEqual([5, 1, 2]) // future first, then past, then by date desc
  })

  it('should filter turns by CANCELED status', () => {
    const result = filterTurns(mockTurns, 'CANCELED')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })

  it('should filter turns by COMPLETED status', () => {
    const result = filterTurns(mockTurns, 'COMPLETED')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(4)
  })

  it('should return empty array when no turns match the status filter', () => {
    const result = filterTurns(mockTurns, 'NONEXISTENT')
    expect(result).toEqual([])
  })

  it('should sort turns by status priority and scheduled date', () => {
    const result = filterTurns(mockTurns, null)

    // Expected order by priority:
    // 1. SCHEDULED (future) - id 1, then id 5 (newer date)
    // 2. SCHEDULED (past) - id 2
    // 3. CANCELED - id 3
    // 4. COMPLETED - id 4
    expect(result.map((t: any) => t.id)).toEqual([5, 1, 2, 3, 4])
  })

  it('should handle empty turns array', () => {
    const result = filterTurns([], null)
    expect(result).toEqual([])
  })

  it('should handle empty turns array with status filter', () => {
    const result = filterTurns([], 'SCHEDULED')
    expect(result).toEqual([])
  })

  it('should sort SCHEDULED turns with future dates first, then past dates', () => {
    const scheduledTurns = mockTurns.filter(t => t.status === 'SCHEDULED')
    const result = filterTurns(scheduledTurns, null)

    expect(result.map((t: any) => t.id)).toEqual([5, 1, 2]) // future dates first (5, 1), then past (2)
  })

  it('should sort turns by scheduled date descending within same status priority', () => {
    const futureScheduledTurns = [
      {
        id: 1,
        status: 'SCHEDULED',
        scheduledAt: '2024-01-16 10:00',
        patientName: 'Turn 1'
      },
      {
        id: 2,
        status: 'SCHEDULED',
        scheduledAt: '2024-01-18 10:00', // newer
        patientName: 'Turn 2'
      },
      {
        id: 3,
        status: 'SCHEDULED',
        scheduledAt: '2024-01-17 10:00', // in between
        patientName: 'Turn 3'
      }
    ]

    const result = filterTurns(futureScheduledTurns, null)
    expect(result.map((t: any) => t.id)).toEqual([2, 3, 1]) // sorted by date desc: 18, 17, 16
  })

  it('should handle turns with same scheduled date and status', () => {
    const sameDateTurns = [
      {
        id: 1,
        status: 'SCHEDULED',
        scheduledAt: '2024-01-16 10:00',
        patientName: 'Turn 1'
      },
      {
        id: 2,
        status: 'SCHEDULED',
        scheduledAt: '2024-01-16 10:00', // same date
        patientName: 'Turn 2'
      }
    ]

    const result = filterTurns(sameDateTurns, null)
    // When dates are equal, the sort is stable, so original order should be preserved
    expect(result).toHaveLength(2)
    expect(result.every((t: any) => t.status === 'SCHEDULED')).toBe(true)
  })
})