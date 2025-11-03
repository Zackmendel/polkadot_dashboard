import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import Papa from 'papaparse'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dataType = searchParams.get('type')

    const dataDir = path.join(process.cwd(), 'public', 'data')
    
    let filePath: string
    
    switch (dataType) {
      case 'voters':
        filePath = path.join(dataDir, 'polkadot_voters.csv')
        break
      case 'proposals':
        filePath = path.join(dataDir, 'proposals.csv')
        break
      case 'monthly_voters':
        filePath = path.join(dataDir, 'monthly_voters_voting_power_by_type.csv')
        break
      case 'ecosystem_metrics':
        filePath = path.join(dataDir, 'polkadot_ecosystem_metrics_raw_data.csv')
        break
      case 'treasury_flow':
        filePath = path.join(dataDir, 'polkadot_treasury_flow.csv')
        break
      case 'referenda_outcomes':
        filePath = path.join(dataDir, 'polkadot_number_of_referenda_by_outcome_opengov.csv')
        break
      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 })
    }

    const fileContent = await fs.readFile(filePath, 'utf-8')
    
    const parsed = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    })

    return NextResponse.json({ success: true, data: parsed.data })
  } catch (error: any) {
    console.error('Governance data error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load governance data' },
      { status: 500 }
    )
  }
}
