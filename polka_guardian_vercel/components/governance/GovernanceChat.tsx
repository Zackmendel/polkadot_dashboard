'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Loader2, Bot } from 'lucide-react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function GovernanceChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/chat/assistant', {
        message: input,
        threadId,
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
      }

      // Update thread ID if new
      if (response.data.threadId && !threadId) {
        setThreadId(response.data.threadId)
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error: any) {
      console.error('Governance chat error:', error)
      
      const errorMessage: Message = {
        role: 'assistant',
        content: error.response?.data?.error || 
                  error.message || 
                  'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setThreadId(null)
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">🏛️ Governance AI Assistant</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            Clear
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask about voters, proposals, and governance statistics
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">👋 Hi! I&apos;m your governance expert.</p>
              <p className="text-xs mt-2">Ask me about proposals, voting patterns, or governance metrics!</p>
              <div className="mt-4 text-xs space-y-1">
                <p>💡 Try asking:</p>
                <p>• &quot;What are the recent proposals?&quot;</p>
                <p>• &quot;Who are the top voters?&quot;</p>
                <p>• &quot;Show me voting trends&quot;</p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary/10 ml-8 border-l-4 border-primary' 
                  : 'bg-muted/50 mr-8'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {message.role === 'user' ? (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-semibold">U</span>
                    </div>
                  ) : (
                    <Bot className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="message-content text-sm">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        components={{
                          a: ({ href, children }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  <div className="message-timestamp text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="bg-muted/50 mr-8 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Searching governance data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about governance data..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
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
      </CardContent>
    </Card>
  )
}