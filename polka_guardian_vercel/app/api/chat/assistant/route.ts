import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!

const SYSTEM_INSTRUCTIONS = `You are an expert Polkadot and Kusama governance analyst with access to comprehensive governance datasets.

IMPORTANT: You have access to CSV files with complete governance data:
1. polkadot_voters.csv - Contains voter addresses, voting history, token amounts, voting patterns
2. proposals.csv - Contains all referenda, proposal details, status, voting results
3. polkadot_ecosystem_metrics_raw_data.csv - Contains network-wide governance statistics

When users ask about:
- Recent proposals: SEARCH the proposals.csv file and return actual proposals with IDs, titles, status, vote counts
- Top voters: SEARCH the polkadot_voters.csv file and identify voters by voting frequency and token amounts
- Voter details: SEARCH by address in polkadot_voters.csv to find voting history and patterns
- Governance stats: SEARCH polkadot_ecosystem_metrics_raw_data.csv for network statistics

ALWAYS cite specific data from the files you retrieve. Format your responses with clear structure and actual data values, not general guidance.

If a user asks about proposals, voters, or governance data, ALWAYS use the file_search tool to search the attached files first before providing answers.`

export async function POST(request: NextRequest) {
  try {
    const { message, threadId } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    if (!ASSISTANT_ID) {
      return NextResponse.json(
        { error: 'OpenAI Assistant ID not configured' },
        { status: 500 }
      )
    }
    
    let currentThreadId = threadId
    
    // Create new thread if none exists
    if (!currentThreadId) {
      console.log('📝 Creating new thread...')
      const thread = await openai.beta.threads.create({
        metadata: {
          createdAt: new Date().toISOString(),
        }
      })
      currentThreadId = thread.id
      console.log('✅ Thread created:', currentThreadId)
    }
    
    // Add user message to thread
    console.log('💬 Adding message to thread...')
    await openai.beta.threads.messages.create(currentThreadId, {
      role: 'user',
      content: message,
    })
    
    // Run assistant with enhanced instructions
    console.log('🤖 Running assistant...')
    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: ASSISTANT_ID,
      instructions: SYSTEM_INSTRUCTIONS, // Pass enhanced instructions each time
    })
    
    // Poll for completion with extended timeout
    let runStatus = await openai.beta.threads.runs.retrieve(
      currentThreadId,
      run.id
    )
    
    let attempts = 0
    const maxAttempts = 60 // 60 seconds max wait time for file search
    
    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
        throw new Error(`Run failed with status: ${runStatus.status}`)
      }
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      runStatus = await openai.beta.threads.runs.retrieve(
        currentThreadId,
        run.id
      )
      
      attempts++
    }
    
    if (runStatus.status !== 'completed') {
      console.error('❌ Run timed out after', attempts, 'seconds')
      throw new Error('Assistant request timed out')
    }
    
    // Get messages
    console.log('📨 Retrieving messages...')
    const messages = await openai.beta.threads.messages.list(currentThreadId)
    const lastMessage = messages.data[0]
    
    if (!lastMessage || lastMessage.role !== 'assistant') {
      throw new Error('No assistant response found')
    }
    
    const responseContent = lastMessage.content[0]
    const responseText = responseContent.type === 'text' 
      ? responseContent.text.value 
      : responseContent.type === 'image_file'
      ? '[Image response]'
      : 'Unable to generate response'
    
    console.log('✅ Response generated')
    
    return NextResponse.json({
      message: responseText,
      threadId: currentThreadId,
    })
    
  } catch (error: any) {
    console.error('Assistant API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}