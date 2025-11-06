'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChatSidebar } from './ChatSidebar'
import { GovernanceChat } from '@/components/governance/GovernanceChat'
import { Wallet, Building, Bot } from 'lucide-react'

export function SmartChat() {
  const [chatMode, setChatMode] = useState<'wallet' | 'governance'>('wallet')

  const detectContext = (message: string): 'wallet' | 'governance' => {
    const governanceKeywords = [
      'proposal', 'referendum', 'vote', 'voter', 'governance',
      'delegation', 'treasury', 'council', 'track', 'democracy',
      'polkadot governance', 'kusama governance', 'voting power'
    ]
    
    const walletKeywords = [
      'balance', 'transfer', 'transaction', 'staking',
      'locked', 'reserved', 'send', 'receive', 'extrinsic',
      'reward', 'bond', 'unbond', 'nominate', 'validator'
    ]
    
    const msgLower = message.toLowerCase()
    
    const govScore = governanceKeywords.filter(k => msgLower.includes(k)).length
    const walletScore = walletKeywords.filter(k => msgLower.includes(k)).length
    
    return govScore > walletScore ? 'governance' : 'wallet'
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)] sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl gradient-text flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AI Assistant
        </CardTitle>
        
        {/* Mode Selector */}
        <div className="flex gap-2 mt-2">
          <Button
            variant={chatMode === 'wallet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChatMode('wallet')}
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            💰 Wallet
          </Button>
          <Button
            variant={chatMode === 'governance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChatMode('governance')}
            className="flex items-center gap-2"
          >
            <Building className="h-4 w-4" />
            🏛️ Governance
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          {chatMode === 'wallet' 
            ? 'Ask about your wallet activity, balances, transfers, and staking'
            : 'Ask about governance proposals, voting patterns, and ecosystem metrics'
          }
        </p>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {chatMode === 'wallet' ? (
          <div className="h-full">
            <ChatSidebar />
          </div>
        ) : (
          <div className="h-full p-4">
            <GovernanceChat />
          </div>
        )}
      </CardContent>
    </Card>
  )
}