'use client'

import { useChatStore } from '@/lib/store'

export function ChatModeSelector() {
  const { currentChatMode, setChatMode } = useChatStore((state) => ({
    currentChatMode: state.currentChatMode,
    setChatMode: state.setChatMode,
  }))

  return (
    <div className="chat-mode-selector" role="tablist" aria-label="Select chat mode">
      <button
        type="button"
        onClick={() => setChatMode('wallet')}
        className={`mode-button ${currentChatMode === 'wallet' ? 'active' : ''}`}
        aria-pressed={currentChatMode === 'wallet'}
      >
        💰 Wallet
      </button>
      <button
        type="button"
        onClick={() => setChatMode('governance')}
        className={`mode-button ${currentChatMode === 'governance' ? 'active' : ''}`}
        aria-pressed={currentChatMode === 'governance'}
      >
        🏛️ Governance
      </button>
    </div>
  )
}
