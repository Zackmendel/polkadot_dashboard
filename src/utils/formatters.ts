const NUMBER_LOCALE = 'en-US';

export const safeParseNumber = (input: string | number | null | undefined): number => {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : 0;
  }

  if (typeof input === 'string') {
    const sanitized = input.replace(/,/g, '').trim();
    const parsed = Number.parseFloat(sanitized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const convertToUnitBalance = (rawBalance: string | number, decimals: number): number => {
  const amount = safeParseNumber(rawBalance);

  if (!Number.isFinite(decimals) || decimals <= 0) {
    return amount;
  }

  return amount / 10 ** decimals;
};

export interface FormatTokenAmountOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export const formatTokenAmount = (
  rawBalance: string | number,
  decimals: number,
  options: FormatTokenAmountOptions = {},
): string => {
  const { minimumFractionDigits = 2, maximumFractionDigits = 4 } = options;
  const units = convertToUnitBalance(rawBalance, decimals);

  return new Intl.NumberFormat(NUMBER_LOCALE, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(units);
};

export const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}): string =>
  new Intl.NumberFormat(NUMBER_LOCALE, options).format(Number.isFinite(value) ? value : 0);

export const formatPlanck = (rawBalance: string | number): string => {
  try {
    if (typeof rawBalance === 'bigint') {
      return rawBalance.toLocaleString(NUMBER_LOCALE);
    }

    const sanitized = typeof rawBalance === 'string' ? rawBalance.replace(/,/g, '').trim() : String(rawBalance ?? '0');
    const bigIntValue = BigInt(sanitized);
    return bigIntValue.toLocaleString(NUMBER_LOCALE);
  } catch (error) {
    const fallback = safeParseNumber(typeof rawBalance === 'string' ? rawBalance.replace(/,/g, '') : Number(rawBalance));
    return Math.round(fallback).toLocaleString(NUMBER_LOCALE);
  }
};

export interface FormatUsdOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
}

export const formatUsd = (value: number, options: FormatUsdOptions = {}): string => {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2, compact = false } = options;

  return new Intl.NumberFormat(NUMBER_LOCALE, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
  }).format(Number.isFinite(value) ? value : 0);
};

export const formatPercent = (value: number, fractionDigits = 1): string =>
  new Intl.NumberFormat(NUMBER_LOCALE, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number.isFinite(value) ? value : 0);

export const formatTimestamp = (timestamp: number, options?: Intl.DateTimeFormatOptions): string => {
  const milliseconds = timestamp > 1e12 ? timestamp : timestamp * 1000;
  return new Date(milliseconds).toLocaleString(undefined, options);
};

export const truncateMiddle = (value: string, visible = 6): string => {
  if (!value || value.length <= visible * 2) {
    return value;
  }

  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
};
