import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import path from 'path'
import Papa from 'papaparse'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function loadGovernanceData() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data')
    const files = await fs.readdir(dataDir)
    const csvFiles = files.filter(f => f.endsWith('.csv'))
    
    const governanceData: any = {}
    
    for (const file of csvFiles) {
      const filePath = path.join(dataDir, file)
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const parsed = Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      })
      
      const fileName = file.replace('.csv', '')
      governanceData[fileName] = {
        rowCount: parsed.data.length,
        sample: parsed.data.slice(0, 5),
        columns: parsed.meta.fields,
      }
    }
    
    return governanceData
  } catch (error) {
    console.error('Error loading governance data:', error)
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context, contextType } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const governanceData = await loadGovernanceData()
    
    const walletContext = context ? JSON.parse(context) : null
    
    const systemPrompt = contextType === 'wallet'
      ? `You are an expert blockchain analytics assistant specialized in Polkadot and Substrate ecosystems. 
         You help users understand their wallet activity, transactions, staking, and governance participation.
         Analyze the provided wallet data and answer questions clearly and concisely.
         
         Available Wallet Data:
         ${walletContext ? `
         - Account Balance: ${walletContext.accountData?.balance || 'N/A'}
         - Reserved: ${walletContext.accountData?.reserved || 'N/A'}
         - Locked: ${walletContext.accountData?.lock || 'N/A'}
         - Number of Transfers: ${walletContext.transfers?.length || 0}
         - Number of Extrinsics: ${walletContext.extrinsics?.length || 0}
         - Number of Staking Events: ${walletContext.staking?.length || 0}
         - Number of Votes: ${walletContext.votes?.length || 0}
         - Token Symbol: ${walletContext.tokenMetadata?.symbol || 'N/A'}
         - Token Decimals: ${walletContext.tokenMetadata?.decimals || 'N/A'}
         ` : 'No wallet data loaded yet.'}
         
         Available Governance Data Files:
         ${Object.keys(governanceData).map(key => `- ${key}: ${governanceData[key].rowCount} rows`).join('\n')}
         
         You have access to comprehensive governance data including voters, proposals, ecosystem metrics, and treasury flow.
         Use this information to provide contextual and insightful responses.`
      : `You are an expert Polkadot governance analyst. You help users understand governance metrics, 
         voting patterns, proposals, and treasury activities. Provide insights based on the data.
         
         Available Governance Data Files:
         ${Object.keys(governanceData).map(key => {
           const data = governanceData[key]
           return `- ${key}: ${data.rowCount} rows, Columns: ${data.columns?.join(', ')}`
         }).join('\n')}
         
         Sample Data Overview:
         ${Object.keys(governanceData).slice(0, 3).map(key => `
         ${key} (first 2 rows):
         ${JSON.stringify(governanceData[key].sample?.slice(0, 2), null, 2)}
         `).join('\n')}
         
         You have full access to:
         - Voter data (addresses, voting power, patterns)
         - Proposal information (status, votes, tracks)
         - Ecosystem metrics (transfers, accounts, events)
         - Treasury flow (income, spending, net flow)
         - Monthly voting statistics
         - Referenda outcomes
         
         Provide detailed, data-driven insights based on this comprehensive dataset.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'No response generated'

    return NextResponse.json({ 
      success: true, 
      message: assistantMessage 
    })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
