import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ✅ KEEP - This is used throughout your app
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ KEEP - Useful for large numbers
export function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}

// ✅ KEEP - Works fine
export function formatAddress(address: string, length: number = 8): string {
  if (!address || address.length < length * 2) return address
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

// 🔧 FIXED - Don't divide by decimals (Subscan already returns normalized values)
export function formatBalance(
  balance: string | number | undefined | null, 
  decimals: number = 10, 
  symbol: string = ""
): string {
  // Handle null/undefined
  if (balance === undefined || balance === null || balance === '') {
    return 'N/A'
  }

  // Convert to number
  const num = typeof balance === 'string' ? parseFloat(balance) : balance
  
  // Check if valid number
  if (isNaN(num)) {
    return 'N/A'
  }

  // ⚠️ IMPORTANT: Subscan API returns values ALREADY NORMALIZED
  // So we DON'T divide by 10^decimals here
  // The balance is already in human-readable format (e.g., 123.45 DOT)
  
  // Format with commas and 2 decimal places to match Streamlit
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return symbol ? `${formatted} ${symbol}` : formatted
}

// 🔧 FIXED - Handle both Unix timestamps and ISO strings
export function formatDate(timestamp: number | string | undefined | null): string {
  if (!timestamp) return 'N/A'
  
  try {
    let date: Date
    
    if (typeof timestamp === 'string') {
      // If it's an ISO string or regular string
      date = new Date(timestamp)
    } else {
      // If it's a Unix timestamp (seconds since epoch)
      date = new Date(timestamp * 1000)
    }
    
    if (isNaN(date.getTime())) {
      return 'N/A'
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    return 'N/A'
  }
}

// ✨ NEW - Format USD values
export function formatUSD(value: number): string {
  if (isNaN(value)) return 'N/A'
  
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ✨ NEW - Calculate percentage
export function calculatePercentage(value: number, total: number): string {
  if (total === 0 || isNaN(value) || isNaN(total)) return '0.00%'
  return ((value / total) * 100).toFixed(2) + '%'
}
