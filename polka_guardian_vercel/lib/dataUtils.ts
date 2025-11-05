/**
 * Data sanitization utilities for safe JSON serialization and AI context preparation
 */

/**
 * Sanitize string for safe JSON inclusion
 */
export function sanitizeForJSON(value: any): string {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // Remove or escape problematic characters
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/"/g, '\\"')    // Escape quotes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\t/g, '\\t')   // Escape tabs
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
}

/**
 * Sanitize an entire object/array recursively
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return null;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        cleaned[key] = sanitizeForJSON(value);
      } else if (typeof value === 'object') {
        cleaned[key] = sanitizeObject(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  
  if (typeof obj === 'string') {
    return sanitizeForJSON(obj);
  }
  
  return obj;
}

/**
 * Summarize large datasets for AI context
 */
export function summarizeDataForAI(data: any[], maxItems: number = 10): string {
  if (!data || data.length === 0) return 'No data available';
  
  const sample = data.slice(0, maxItems);
  const summary = {
    totalCount: data.length,
    sampleSize: sample.length,
    fields: Object.keys(data[0] || {}),
    sample: sample.map(item => sanitizeObject(item)),
  };
  
  return JSON.stringify(summary);
}

/**
 * Clean wallet data for AI context
 */
export function cleanWalletDataForAI(walletData: any): any {
  if (!walletData) return null;
  
  return {
    address: sanitizeForJSON(walletData.address),
    balance: walletData.balance || 0,
    transferable: walletData.transferable || 0,
    locked: walletData.locked || 0,
    reserved: walletData.reserved || 0,
    // Only include summary counts, not full arrays
    transfers: {
      count: walletData.transfers?.length || 0,
      recentSample: walletData.transfers?.slice(0, 5).map((t: any) => ({
        hash: sanitizeForJSON(t.hash),
        amount: t.amount,
        from: sanitizeForJSON(t.from),
        to: sanitizeForJSON(t.to),
        timestamp: t.timestamp,
      })) || []
    },
    extrinsics: {
      count: walletData.extrinsics?.length || 0,
    },
    staking: walletData.staking ? {
      controller: sanitizeForJSON(walletData.staking.controller),
      rewardAccount: sanitizeForJSON(walletData.staking.rewardAccount),
    } : null,
  };
}

/**
 * Clean governance data for AI context
 */
export function cleanGovernanceDataForAI(governanceData: any): any {
  if (!governanceData) return null;
  
  return {
    proposals: {
      totalCount: governanceData.proposals?.length || 0,
      recentProposals: governanceData.proposals?.slice(0, 10).map((p: any) => ({
        id: p.id,
        title: sanitizeForJSON(p.title),
        status: p.status,
        ayeVotes: p.ayeVotes || 0,
        nayVotes: p.nayVotes || 0,
        track: sanitizeForJSON(p.track),
      })) || []
    },
    voters: {
      totalCount: governanceData.voters?.length || 0,
    }
  };
}

/**
 * Parse proposal date safely for sorting
 */
export function parseProposalDate(dateString: string): Date {
  if (!dateString || dateString === 'N/A') {
    return new Date(0); // Epoch for missing dates (will sort to end)
  }
  
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/**
 * Sort proposals by date (most recent first)
 */
export function sortProposalsByDate(proposals: any[]): any[] {
  return [...proposals].sort((a, b) => {
    const dateA = parseProposalDate(a.createdDate || a.startTime || a.start_time);
    const dateB = parseProposalDate(b.createdDate || b.startTime || b.start_time);
    return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
  });
}