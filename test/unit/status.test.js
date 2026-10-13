/**
 * Unit tests for src/utils/status.js.
 * Covers all branches for good branch coverage.
 */
import { describe, it, expect } from 'vitest'
import { formatStatus } from '../../src/utils/status.js'

describe('formatStatus', () => {
  it.each([
    [0, 'warming-up'],
    [59.999, 'warming-up'],
    [60, 'healthy'],
    [3599.999, 'healthy'],
    [3600, 'steady'],
    [3601, 'steady']
  ])('labels uptime %s as %s at category boundaries', (uptime, expected) => {
    expect(formatStatus(uptime)).toBe(expected)
  })

  it.each([null, undefined, true, {}, []])('rejects invalid uptime %j', value => {
    expect(() => formatStatus(value)).toThrow('invalid uptime')
  })
  it('throws on negative', () => {
    expect(() => formatStatus(-1)).toThrow('invalid uptime')
  })
  it('throws on NaN or non-number', () => {
    expect(() => formatStatus(NaN)).toThrow('invalid uptime')
    expect(() => formatStatus('abc')).toThrow('invalid uptime')
  })
  it('warming-up under 60s', () => {
    expect(formatStatus(10)).toBe('warming-up')
  })
  it('healthy under 1h', () => {
    expect(formatStatus(3599)).toBe('healthy')
  })
  it('steady at or after 1h', () => {
    expect(formatStatus(3600)).toBe('steady')
  })
})
