import { formatIncomeTypes } from './settlement-labels';

describe('formatIncomeTypes', () => {
  it('returns the custom income label when one is configured', () => {
    expect(
      formatIncomeTypes([{ incomeType: 'FreeItem', incomeLabelName: 'จ่ายเป็นสินค้า' }])
    ).toBe('จ่ายเป็นสินค้า');
  });

  it('joins multiple income types with a comma', () => {
    expect(
      formatIncomeTypes([
        { incomeType: 'FreeItem', incomeLabelName: 'จ่ายเป็นสินค้า' },
        { incomeType: 'Invoice', incomeLabelName: 'จ่ายเป็นเช็ค' },
      ])
    ).toBe('จ่ายเป็นสินค้า, จ่ายเป็นเช็ค');
  });

  it('falls back to the generic income type label when no custom label is set', () => {
    // A configured income type must never render as a blank entry.
    expect(formatIncomeTypes([{ incomeType: 'Invoice', incomeLabelName: null }])).toBe('ใบแจ้งหนี้');
  });

  it('mixes custom labels and fallbacks in one value', () => {
    expect(
      formatIncomeTypes([
        { incomeType: 'FreeItem', incomeLabelName: 'จ่ายเป็นสินค้า' },
        { incomeType: 'CreditNote', incomeLabelName: null },
      ])
    ).toBe('จ่ายเป็นสินค้า, CN');
  });

  it('returns an empty string for an empty list', () => {
    expect(formatIncomeTypes([])).toBe('');
  });

  it('returns an empty string for null or undefined', () => {
    expect(formatIncomeTypes(null)).toBe('');
    expect(formatIncomeTypes(undefined)).toBe('');
  });
});
