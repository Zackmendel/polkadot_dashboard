import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { sanitizeForJSON, sanitizeObject, summarizeDataForAI, cleanWalletDataForAI, cleanGovernanceDataForAI } from '@/lib/dataUtils'

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
      // Store FULL data instead of just samples
      governanceData[fileName] = parsed.data
    }
    
    return governanceData
  } catch (error) {
    console.error('Error loading governance data:', error)
    return {}
  }
}

// Helper to filter and format data for AI context
function prepareDataContext(governanceData: any, query: string) {
  const context: any = {}
  
  // For proposals, get recent/active ones
  if (governanceData.proposals) {
    const proposals = governanceData.proposals
    
    // Filter for active/recent proposals
    const now = new Date()
    const activeProposals = proposals.filter((p: any) => {
      if (!p.end_time) return false
      const endDate = new Date(p.end_time)
      return endDate > now || p.status === 'Active' || p.status === 'Ongoing'
    })
    
    const recentProposals = proposals
      .filter((p: any) => p.start_time)
      .sort((a: any, b: any) => {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      })
      .slice(0, 50) // Last 50 proposals
    
    context.activeProposals = activeProposals.length > 0 ? activeProposals : recentProposals.slice(0, 10)
    context.totalProposals = proposals.length
  }
  
  // For voters data
  if (governanceData.polkadot_voters) {
    const voters = governanceData.polkadot_voters
    context.voterSummary = {
      totalVoters: voters.length,
      topVoters: voters
        .sort((a: any, b: any) => (b.voting_power || 0) - (a.voting_power || 0))
        .slice(0, 20),
      recentActivity: voters
        .filter((v: any) => v.last_vote_time)
        .sort((a: any, b: any) => {
          return new Date(b.last_vote_time).getTime() - new Date(a.last_vote_time).getTime()
        })
        .slice(0, 20)
    }
  }
  
  // For monthly voting power
  if (governanceData.monthly_voters_voting_power_by_type) {
    context.monthlyVoting = governanceData.monthly_voters_voting_power_by_type
      .sort((a: any, b: any) => {
        return new Date(b.month || b.date).getTime() - new Date(a.month || a.date).getTime()
      })
      .slice(0, 12) // Last 12 months
  }
  
  // Ecosystem metrics
  if (governanceData.polkadot_ecosystem_metrics_raw_data) {
    context.ecosystemMetrics = governanceData.polkadot_ecosystem_metrics_raw_data
      .sort((a: any, b: any) => {
        return new Date(b.date || b.timestamp).getTime() - new Date(a.date || a.timestamp).getTime()
      })
      .slice(0, 30) // Last 30 days
  }
  
  // Treasury flow
  if (governanceData.polkadot_treasury_flow) {
    context.treasuryFlow = governanceData.polkadot_treasury_flow
      .sort((a: any, b: any) => {
        return new Date(b.date || b.month).getTime() - new Date(a.date || a.month).getTime()
      })
      .slice(0, 12) // Last 12 periods
  }
  
  return context
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

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages required' },
        { status: 400 }
      )
    }

    // SANITIZE USER MESSAGES
    const cleanMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: sanitizeForJSON(msg.content),
    }))

    const governanceData = await loadGovernanceData()
    const walletContext = context ? cleanWalletDataForAI(JSON.parse(context)) : null
    
    // Get the last user message to understand what data to prioritize
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    const dataContext = prepareDataContext(governanceData, lastUserMessage)
    
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
         
         Governance Data Overview:
         - Total Proposals: ${dataContext.totalProposals || 'N/A'}
         - Active/Recent Proposals: ${dataContext.activeProposals?.length || 0}
         - Total Voters: ${dataContext.voterSummary?.totalVoters || 'N/A'}
         
         When asked about specific data, analyze the actual data provided below.`
      : `You are an expert Polkadot governance analyst. You help users understand governance metrics, 
         voting patterns, proposals, and treasury activities.
         
         IMPORTANT: You have access to REAL DATA below. When asked about current proposals, voters, or metrics,
         analyze the actual data provided, not hypothetical scenarios.
         
         Governance Data Summary:
         - Total Proposals: ${dataContext.totalProposals || 0}
         - Active/Recent Proposals Available: ${dataContext.activeProposals?.length || 0}
         - Total Voters: ${dataContext.voterSummary?.totalVoters || 0}
         - Monthly Voting Data: ${dataContext.monthlyVoting?.length || 0} months
         - Ecosystem Metrics: ${dataContext.ecosystemMetrics?.length || 0} days
         - Treasury Records: ${dataContext.treasuryFlow?.length || 0} periods
         
         ACTUAL DATA TO ANALYZE:
         
         ${dataContext.activeProposals?.length > 0 ? `
         CURRENT/RECENT PROPOSALS (${dataContext.activeProposals.length} proposals):
         ${JSON.stringify(sanitizeObject(dataContext.activeProposals), null, 2)}
         ` : ''}
         
         ${dataContext.voterSummary ? `
         TOP VOTERS BY VOTING POWER:
         ${JSON.stringify(sanitizeObject(dataContext.voterSummary.topVoters), null, 2)}
         
         RECENT VOTING ACTIVITY:
         ${JSON.stringify(sanitizeObject(dataContext.voterSummary.recentActivity), null, 2)}
         ` : ''}
         
         ${dataContext.monthlyVoting ? `
         MONTHLY VOTING TRENDS (Last 12 months):
         ${JSON.stringify(sanitizeObject(dataContext.monthlyVoting), null, 2)}
         ` : ''}
         
         ${dataContext.ecosystemMetrics ? `
         RECENT ECOSYSTEM METRICS:
         ${JSON.stringify(sanitizeObject(dataContext.ecosystemMetrics.slice(0, 7)), null, 2)}
         ` : ''}
         
         ${dataContext.treasuryFlow ? `
         TREASURY FLOW DATA:
         ${JSON.stringify(sanitizeObject(dataContext.treasuryFlow), null, 2)}
         ` : ''}
         
         Provide specific, data-driven insights based on this real data. When asked about "current" or "recent" 
         information, reference the actual data above with specific details like proposal IDs, dates, and metrics.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...cleanMessages,
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'No response generated'

    return NextResponse.json({ 
      success: true, 
      message: assistantMessage 
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
