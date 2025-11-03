import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

interface TokenMetadata {
  symbol: string
  decimals: number
  price: number
}

async function getTokenMetadata(chainKey: string, apiKey: string): Promise<TokenMetadata> {
  try {
    const url = `https://${chainKey}.api.subscan.io/api/scan/token`
    const response = await axios.get(url, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (response.data?.code === 0 && response.data?.data?.detail) {
      // Look for native token first
      const tokens = Object.values(response.data.data.detail) as any[]
      const nativeToken = tokens.find((t: any) => t.is_native)
      const token = nativeToken || tokens[0]

      return {
        symbol: token.symbol,
        decimals: parseInt(token.token_decimals),
        price: parseFloat(token.price || '0'),
      }
    }
  } catch (error) {
    console.error('Error fetching token metadata:', error)
  }

  return { symbol: 'N/A', decimals: 10, price: 0 }
}

async function fetchAccountData(chainKey: string, address: string, apiKey: string) {
  const url = `https://${chainKey}.api.subscan.io/api/v2/scan/search`
  const response = await axios.post(
    url,
    { key: address },
    {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.data?.code !== 0) {
    throw new Error(`Subscan API Error: ${response.data?.message}`)
  }

  return response.data
}

async function fetchTransfers(chainKey: string, address: string, apiKey: string, maxPages = 5) {
  const url = `https://${chainKey}.api.subscan.io/api/v2/scan/transfers`
  const allTransfers: any[] = []
  let page = 0
  const row = 100

  while (page < maxPages) {
    try {
      const response = await axios.post(
        url,
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

      if (response.data?.code !== 0) break

      const transfers = response.data?.data?.transfers || []
      if (transfers.length === 0) break

      allTransfers.push(...transfers)

      if (transfers.length < row) break
      page++
    } catch (error) {
      console.error(`Error fetching transfers page ${page}:`, error)
      break
    }
  }

  return allTransfers
}

async function fetchExtrinsics(chainKey: string, address: string, apiKey: string) {
  const url = `https://${chainKey}.api.subscan.io/api/v2/scan/extrinsics`
  
  try {
    const response = await axios.post(
      url,
      {
        address,
        order: 'desc',
        page: 0,
        row: 100,
        success: true,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data?.code === 0) {
      return response.data?.data?.extrinsics || []
    }
  } catch (error) {
    console.error('Error fetching extrinsics:', error)
  }

  return []
}

async function fetchStakingHistory(chainKey: string, address: string, apiKey: string) {
  const url = `https://${chainKey}.api.subscan.io/api/scan/staking_history`
  
  try {
    const response = await axios.post(
      url,
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

    if (response.data?.code === 0 && response.data?.data?.list) {
      return response.data.data.list
    }
  } catch (error) {
    console.error('Error fetching staking history:', error)
  }

  return []
}

async function fetchReferendaVotes(chainKey: string, address: string, apiKey: string) {
  const url = `https://${chainKey}.api.subscan.io/api/scan/referenda/votes`
  
  try {
    const response = await axios.post(
      url,
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

    if (response.data?.code === 0 && response.data?.data?.list) {
      return response.data.data.list
    }
  } catch (error) {
    console.error('Error fetching referenda votes:', error)
  }

  return []
}

export async function POST(request: NextRequest) {
  try {
    const { chainKey, address } = await request.json()
    
    const apiKey = process.env.SUBSCAN_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Subscan API key not configured' },
        { status: 500 }
      )
    }

    if (!chainKey || !address) {
      return NextResponse.json(
        { error: 'Missing chainKey or address' },
        { status: 400 }
      )
    }

    console.log(`Fetching data for ${address} on ${chainKey}...`)

    // Fetch all data in parallel
    const [accountData, tokenMetadata, transfers, extrinsics, staking, votes] = await Promise.all([
      fetchAccountData(chainKey, address, apiKey),
      getTokenMetadata(chainKey, apiKey),
      fetchTransfers(chainKey, address, apiKey),
      fetchExtrinsics(chainKey, address, apiKey),
      fetchStakingHistory(chainKey, address, apiKey),
      fetchReferendaVotes(chainKey, address, apiKey),
    ])

    // Extract the account object from the response
    const accountInfo = accountData?.data?.account || {}

    console.log('Account data structure:', JSON.stringify(accountInfo, null, 2).substring(0, 500))

    const snapshot = {
      accountData: accountInfo,
      tokenMetadata,
      transfers,
      extrinsics,
      staking,
      votes,
      last_updated: new Date().toISOString(),
    }
    
    return NextResponse.json({ success: true, data: snapshot })
  } catch (error: any) {
    console.error('Subscan API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account data' },
      { status: 500 }
    )
  }
}
