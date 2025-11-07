'use client'

import { Bot } from 'lucide-react'
import { useChatStore } from '@/lib/store'
import { ChatModeSelector } from './ChatModeSelector'
import { WalletChat } from './WalletChat'
import { GovernanceChat } from '@/components/governance/GovernanceChat'

export function SmartChat() {
  const currentChatMode = useChatStore((state) => state.currentChatMode)

  return (
    <div className="smart-chat-wrapper h-[calc(100vh-8rem)] sticky top-4 flex flex-col gap-3">
      <div className="glass-card border border-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold gradient-text">Polka Guardian AI</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {currentChatMode === 'wallet'
            ? 'Ask about wallet balances, transfers, staking activity, and on-chain performance.'
            : 'Explore proposals, voting patterns, treasury movements, and governance insights.'}
        </p>
      </div>

      <ChatModeSelector />

      <div className="flex-1 min-h-0">
        {currentChatMode === 'wallet' ? (
          <WalletChat />
        ) : (
          <GovernanceChat />
        )}
      </div>
    </div>
  )
}
