'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Loader2, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
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
      // Build comprehensive proposal context
      const totalVotes = (proposal.ayeVotes || 0) + (proposal.nayVotes || 0) + (proposal.abstainVotes || 0)
      
      // Enhanced prompt with full context
      const detailedPrompt = `You are a Polkadot governance expert. Analyze this proposal comprehensively:

PROPOSAL DATA:
Referendum ID: #${proposal.id}
Chain: ${proposal.chain || 'Polkadot'}
Track: ${proposal.track || 'Unknown'}
Status: ${proposal.status || 'Unknown'}

TITLE: ${proposal.title || 'No title provided'}

DESCRIPTION/DETAILS:
${proposal.description || 'No description available'}

VOTING RESULTS:
- Aye Votes: ${(proposal.ayeVotes || 0).toLocaleString()}
- Nay Votes: ${(proposal.nayVotes || 0).toLocaleString()}
- Abstain Votes: ${(proposal.abstainVotes || 0).toLocaleString()}
- Total Votes: ${totalVotes.toLocaleString()}

Please provide a comprehensive analysis with the following sections:

1. **Summary**: What is this proposal about? (2-3 sentences)
2. **Key Details**: Main objectives and implementation approach
3. **Voting Analysis**: What the vote results indicate about community sentiment
4. **Implications**: What this means for the Polkadot/Kusama ecosystem
5. **Recommendation**: Based on the data, assess whether the community decision aligns with ecosystem interests

Use the EXACT data provided above. Do not say data is missing if it's provided in the fields above. Format your response with clear sections and markdown formatting.`
      
      const response = await axios.post('/api/chat/assistant', {
        message: detailedPrompt,
        threadId: null, // Fresh thread for each summary
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
              <div className="bg-muted/50 rounded-lg p-4 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
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