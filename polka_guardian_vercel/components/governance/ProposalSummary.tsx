'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Loader2, FileText } from 'lucide-react'
import axios from 'axios'

interface Proposal {
  id: string
  chain?: string
  status?: string
  track?: string
  title?: string
  description?: string
  ayeVotes?: number
  nayVotes?: number
  abstainVotes?: number
}

interface ProposalSummaryProps {
  proposal: Proposal
}

export function ProposalSummary({ proposal }: ProposalSummaryProps) {
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const generateSummary = async () => {
    setIsLoading(true)
    
    try {
      const response = await axios.post('/api/chat/assistant', {
        message: `Please provide a concise summary of this governance proposal:

Referendum ID: ${proposal.id}
Chain: ${proposal.chain || 'Polkadot'}
Status: ${proposal.status || 'Unknown'}
Track: ${proposal.track || 'Unknown'}
Title: ${proposal.title || 'No title'}
Description: ${proposal.description?.substring(0, 500) || 'No description'}${proposal.description && proposal.description.length > 500 ? '...' : ''}

Voting Results:
- Aye: ${proposal.ayeVotes || 0}
- Nay: ${proposal.nayVotes || 0}
- Abstain: ${proposal.abstainVotes || 0}

Summarize what this proposal is about and the outcome in 2-3 sentences. Focus on the main purpose and key voting results.`,
        threadId: null, // New thread for each summary
      })

      setSummary(response.data.message)
      setIsExpanded(true)
      
    } catch (error: any) {
      console.error('Summary error:', error)
      setSummary('Unable to generate summary at this time. Please try again later.')
      setIsExpanded(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI-Generated Summary
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isLoading}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {!summary && !isLoading ? (
            <div className="text-center py-4">
              <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Get an AI-powered summary of this proposal
              </p>
              <Button onClick={generateSummary} size="sm">
                🤖 Generate Summary
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm">Analyzing proposal...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed">{summary}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateSummary}
                disabled={isLoading}
              >
                🔄 Regenerate
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}