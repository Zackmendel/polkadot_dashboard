import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}

export function formatAddress(address: string, length: number = 8): string {
  if (!address || address.length < length * 2) return address
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export function formatBalance(balance: string | number, decimals: number = 10, symbol: string = ""): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance
  const normalized = num / Math.pow(10, decimals)
  return `${formatNumber(normalized)} ${symbol}`.trim()
}

export function formatDate(timestamp: number | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000)
  return date.toLocaleString()
}
