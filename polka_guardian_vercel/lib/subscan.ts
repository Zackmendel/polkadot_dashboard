import axios from 'axios'

export const CHAIN_OPTIONS: Record<string, string> = {
  'Polkadot': 'polkadot',
  'Kusama': 'kusama',
  'Acala': 'acala',
  'Astar': 'astar',
  'Moonbeam': 'moonbeam',
  'Phala': 'phala',
  'Bifrost': 'bifrost',
  'Centrifuge': 'centrifuge',
  'Parallel': 'parallel',
  'HydraDX': 'hydradx',
  'Litentry': 'litentry',
  'Crust': 'crust',
  'Darwinia': 'darwinia',
  'Edgeware': 'edgeware',
  'Karura': 'karura',
  'Statemine': 'statemine',
  'Statemint': 'statemint',
  'Ternoa': 'ternoa',
  'Unique': 'unique',
  'Zeitgeist': 'zeitgeist',
}

export interface TokenMetadata {
  symbol: string
  decimals: number
  price: number
}

export interface AccountData {
  address: string
  balance: string
  lock: string
  reserved: string
  [key: string]: any
}

export async function getTokenMetadata(chainKey: string, apiKey: string): Promise<TokenMetadata> {
  try {
    const response = await axios.get(`https://${chainKey}.api.subscan.io/api/scan/token`, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    const data = response.data
    if (data.code === 0) {
      const tokens = Object.values(data.data.detail) as any[]
      const nativeToken = tokens.find((t: any) => t.is_native) || tokens[0]
      
      return {
        symbol: nativeToken.symbol,
        decimals: parseInt(nativeToken.token_decimals),
        price: parseFloat(nativeToken.price || '0'),
      }
    }
  } catch (error) {
    console.error('Error fetching token metadata:', error)
  }
  
  return { symbol: 'N/A', decimals: 10, price: 0 }
}

export async function fetchAccountData(chainKey: string, address: string, apiKey: string) {
  const response = await axios.post(
    `https://${chainKey}.api.subscan.io/api/v2/scan/search`,
    { key: address },
    {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.data.code !== 0) {
    throw new Error(`Subscan API Error: ${response.data.message}`)
  }

  return response.data
}

export async function fetchAllTransfers(
  chainKey: string,
  address: string,
  apiKey: string,
  maxPages: number = 5
) {
  const allTransfers: any[] = []
  let page = 0
  const row = 100

  while (page < maxPages) {
    try {
      const response = await axios.post(
        `https://${chainKey}.api.subscan.io/api/v2/scan/transfers`,
        {
          address,
          direction: 'all',
          row,
          page,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.code !== 0) break

      const transfers = response.data.data?.transfers || []
      if (transfers.length === 0) break

      allTransfers.push(...transfers)
      
      if (transfers.length < row) break
      page++
      
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error('Error fetching transfers:', error)
      break
    }
  }

  return allTransfers
}

export async function fetchExtrinsics(
  chainKey: string,
  address: string,
  apiKey: string,
  page: number = 0,
  row: number = 50
) {
  try {
    const response = await axios.post(
      `https://${chainKey}.api.subscan.io/api/v2/scan/extrinsics`,
      {
        address,
        order: 'desc',
        page,
        row,
        success: true,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.code === 0) {
      return response.data.data?.extrinsics || []
    }
  } catch (error) {
    console.error('Error fetching extrinsics:', error)
  }

  return []
}

export async function fetchStakingHistory(chainKey: string, address: string, apiKey: string) {
  try {
    const response = await axios.post(
      `https://${chainKey}.api.subscan.io/api/scan/staking_history`,
      {
        address,
        page: 0,
        row: 100,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.code === 0 && response.data.data?.list) {
      return response.data.data.list
    }
  } catch (error) {
    console.error('Error fetching staking history:', error)
  }

  return []
}

export async function fetchReferendaVotes(chainKey: string, address: string, apiKey: string) {
  try {
    const response = await axios.post(
      `https://${chainKey}.api.subscan.io/api/scan/gov/votes`,
      {
        address,
        page: 0,
        row: 100,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.code === 0 && response.data.data?.list) {
      return response.data.data.list
    }
  } catch (error) {
    console.error('Error fetching referenda votes:', error)
  }

  return []
}

export async function getFullAccountSnapshot(chainKey: string, address: string, apiKey: string) {
  const [accountData, tokenMetadata, transfers, extrinsics, staking, votes] = await Promise.all([
    fetchAccountData(chainKey, address, apiKey),
    getTokenMetadata(chainKey, apiKey),
    fetchAllTransfers(chainKey, address, apiKey),
    fetchExtrinsics(chainKey, address, apiKey),
    fetchStakingHistory(chainKey, address, apiKey),
    fetchReferendaVotes(chainKey, address, apiKey),
  ])

  return {
    accountData,
    tokenMetadata,
    transfers,
    extrinsics,
    staking,
    votes,
    lastUpdated: new Date().toISOString(),
  }
}
