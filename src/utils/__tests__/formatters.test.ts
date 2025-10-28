import { describe, expect, it } from 'vitest';
import {
  convertToUnitBalance,
  formatNumber,
  formatPlanck,
  formatTokenAmount,
  formatUsd,
  safeParseNumber,
  truncateMiddle,
} from '../formatters';

describe('formatters', () => {
  it('parses numeric strings with commas', () => {
    expect(safeParseNumber('1,234.56')).toBeCloseTo(1234.56);
  });

  it('converts planck values to unit balances', () => {
    expect(convertToUnitBalance('1230000000000', 10)).toBeCloseTo(123);
  });

  it('formats token amounts with precision', () => {
    expect(formatTokenAmount('9876543210000', 10)).toBe('987.6543');
  });

  it('formats large planck balances with separators', () => {
    expect(formatPlanck('1000000000000')).toBe('1,000,000,000,000');
  });

  it('formats USD values with currency style', () => {
    expect(formatUsd(1234.5)).toBe('$1,234.50');
  });

  it('truncates long hashes in the middle', () => {
    expect(truncateMiddle('0x1234567890abcdef', 4)).toBe('0x12…cdef');
  });

  it('formats generic numbers with custom precision', () => {
    expect(formatNumber(1234.5678, { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe('1,234.6');
  });
});
