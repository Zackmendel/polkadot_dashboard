import { NextRequest, NextResponse } from 'next/server'
import { getFullAccountSnapshot } from '@/lib/subscan'

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

    const snapshot = await getFullAccountSnapshot(chainKey, address, apiKey)
    
    return NextResponse.json({ success: true, data: snapshot })
  } catch (error: any) {
    console.error('Subscan API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account data' },
      { status: 500 }
    )
  }
}
