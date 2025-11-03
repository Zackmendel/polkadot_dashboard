import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, context, contextType } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const systemPrompt = contextType === 'wallet'
      ? `You are an expert blockchain analytics assistant specialized in Polkadot and Substrate ecosystems. 
         You help users understand their wallet activity, transactions, staking, and governance participation.
         Analyze the provided wallet data and answer questions clearly and concisely.
         ${context ? `\n\nWallet Data Context:\n${JSON.stringify(context, null, 2)}` : ''}`
      : `You are an expert Polkadot governance analyst. You help users understand governance metrics, 
         voting patterns, proposals, and treasury activities. Provide insights based on the data.
         ${context ? `\n\nGovernance Data Context:\n${JSON.stringify(context, null, 2)}` : ''}`

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
