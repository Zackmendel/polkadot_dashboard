'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useChatStore } from '@/lib/store'

export function WalletChat() {
  const {
    walletChat,
    walletContext,
    addWalletMessage,
    clearWalletChat,
  } = useChatStore((state) => ({
    walletChat: state.walletChat,
    walletContext: state.walletContext,
    addWalletMessage: state.addWalletMessage,
    clearWalletChat: state.clearWalletChat,
  }))

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [walletChat.messages])

  const handleSendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage = { role: 'user' as const, content: trimmed }
    const outgoingMessages = [...walletChat.messages, userMessage]

    addWalletMessage(userMessage)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: outgoingMessages.map(({ role, content }) => ({ role, content })),
          context: null,
          contextType: 'wallet',
          walletContext,
          useAssistant: false,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      addWalletMessage({
        role: 'assistant',
        content: data.message ?? 'I’m not sure how to answer that just yet.',
      })
    } catch (error) {
      console.error('Wallet chat error:', error)
      addWalletMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    clearWalletChat()
    setInput('')
  }

  return (
    <div className="wallet-chat-container">
      <div className="chat-header">
        <div>
          <h3>💰 Wallet AI Assistant</h3>
          <p className="text-sm">
            Ask about your balance, transfers, and staking
          </p>
        </div>
        <button
          type="button"
          onClick={handleClearChat}
          disabled={walletChat.messages.length === 0 && !walletChat.threadId}
          className="chat-clear-button"
        >
          Clear
        </button>
      </div>

      <div className="chat-messages-container">
        <div className="messages-scroll">
          {walletChat.messages.length === 0 && !isLoading ? (
            <div className="empty-state">
              <p>
                Start a conversation! Ask me how much is transferable, who you last sent funds to, or what your staking rewards look like.
              </p>
            </div>
          ) : (
            walletChat.messages.map((message, index) => {
              const timestamp = message.timestamp
                ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : null

              return (
                <div key={`${message.role}-${index}`} className={`message message-${message.role}`}>
                  <div className="message-content">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown className="markdown-message">
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <span>{message.content}</span>
                    )}
                    {timestamp && (
                      <span className="message-timestamp">{timestamp}</span>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {isLoading && (
            <div className="message message-assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
                Analyzing your wallet...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-container">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your wallet... (Shift+Enter for new line)"
          className="chat-input"
          disabled={isLoading}
          rows={1}
        />
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="send-button"
          aria-label="Send message"
        >
          {isLoading ? '⏳' : '→'}
        </button>
      </div>
    </div>
  )
}
