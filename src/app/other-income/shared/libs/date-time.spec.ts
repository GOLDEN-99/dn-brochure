import { toIsoDateOnly } from './date-time';

describe('toIsoDateOnly', () => {
  it('passes a plain API date through unchanged', () => {
    expect(toIsoDateOnly('2026-01-20')).toBe('2026-01-20');
  });

  it('drops the time part of a datetime API value', () => {
    expect(toIsoDateOnly('2026-01-20T00:00:00')).toBe('2026-01-20');
  });

  it('keeps the calendar date at midnight rather than shifting it by timezone', () => {
    // Reading the date off the string (not via `new Date()`) is what stops a
    // midnight UTC datetime rendering as the 19th west of Greenwich.
    expect(toIsoDateOnly('2026-01-20T00:00:00Z')).toBe('2026-01-20');
  });

  it('returns an empty string for null, undefined, or empty input', () => {
    expect(toIsoDateOnly(null)).toBe('');
    expect(toIsoDateOnly(undefined)).toBe('');
    expect(toIsoDateOnly('')).toBe('');
  });

  it('returns an empty string for an unparseable value', () => {
    expect(toIsoDateOnly('not-a-date')).toBe('');
  });

  it('uses the supplied fallback when there is no date', () => {
    expect(toIsoDateOnly(null, '-')).toBe('-');
    expect(toIsoDateOnly('not-a-date', '-')).toBe('-');
  });
});
