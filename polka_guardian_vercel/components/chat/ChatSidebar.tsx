'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, Loader2 } from 'lucide-react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

export function ChatSidebar() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    chatMessages, 
    addChatMessage, 
    walletData, 
    governanceData, 
    currentView 
  } = useStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    }

    addChatMessage(userMessage)
    setInput('')
    setIsLoading(true)

    try {
      const contextType = currentView === 'wallet' ? 'wallet' : 'governance'
      const context = currentView === 'wallet' ? walletData : governanceData

      const response = await axios.post('/api/chat', {
        messages: [...chatMessages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        context: context ? JSON.stringify(context).slice(0, 4000) : null,
        contextType,
      })

      const assistantMessage = {
        role: 'assistant' as const,
        content: response.data.message,
        timestamp: new Date(),
      }

      addChatMessage(assistantMessage)
    } catch (error) {
      console.error('Chat error:', error)
      addChatMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)] sticky top-4">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold gradient-text">AI Assistant</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {currentView === 'wallet' ? 'Wallet Analytics' : 'Governance Insights'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container">
        {chatMessages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">👋 Hi! I'm your AI assistant.</p>
            <p className="text-xs mt-2">Ask me anything about {currentView === 'wallet' ? 'your wallet' : 'governance'}!</p>
          </div>
        )}

        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user' ? 'user-message' : 'assistant-message'
            }`}
          >
            <div className="message-content text-sm">
              {message.role === 'assistant' ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
            <div className="message-timestamp text-xs mt-2 opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="assistant-message p-3 rounded-lg flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
