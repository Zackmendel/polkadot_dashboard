'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'
import { Sparkles, ExternalLink, Loader2 } from 'lucide-react'

interface Proposal {
  referenda_id: number
  chain: string
  origin: string
  proposed_by_name?: string
  proposed_by?: string
  status: string
  title?: string
  start_time?: string
  end_time?: string
  referenda_url?: string
}

interface ProposalDetailsProps {
  proposals: Proposal[]
}

export function ProposalDetails({ proposals }: ProposalDetailsProps) {
  const [selectedProposalId, setSelectedProposalId] = useState<string>('')
  const [aiSummary, setAiSummary] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const selectedProposal = proposals.find(
    (p) => String(p.referenda_id) === selectedProposalId
  )

  const getStatusVariant = (status: string) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('passed') || statusLower.includes('confirmed')) return 'success'
    if (statusLower.includes('rejected') || statusLower.includes('failed')) return 'error'
    return 'info'
  }

  const generateAISummary = async () => {
    if (!selectedProposal) return

    setLoading(true)
    setAiSummary('')

    try {
      const response = await axios.post('/api/chat', {
        messages: [
          {
            role: 'user',
            content: `Please provide a concise summary of this Polkadot/Kusama governance proposal:

Chain: ${selectedProposal.chain}
Referendum ID: ${selectedProposal.referenda_id}
Status: ${selectedProposal.status}
Origin/Track: ${selectedProposal.origin}
Proposer: ${selectedProposal.proposed_by_name || selectedProposal.proposed_by || 'Unknown'}
${selectedProposal.title ? `Title: ${selectedProposal.title}` : ''}
Start Time: ${selectedProposal.start_time || 'N/A'}
End Time: ${selectedProposal.end_time || 'N/A'}

Please provide:
1. A brief summary of what this proposal is about (if title/context available)
2. The voting outcome and what it means
3. Key insights for voters

Keep the response concise and informative.`
          }
        ],
        context: 'governance'
      })

      if (response.data.message) {
        setAiSummary(response.data.message)
      }
    } catch (error) {
      console.error('Error generating AI summary:', error)
      setAiSummary('Failed to generate AI summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const extractLinks = (referendaUrl: string) => {
    if (!referendaUrl) return []

    const links: { text: string; url: string }[] = []
    const hrefRegex = /href=['"]([^'"]+)['"]/g
    const textRegex = />([^<]+)</g

    let hrefMatch
    const hrefs = []
    while ((hrefMatch = hrefRegex.exec(referendaUrl)) !== null) {
      hrefs.push(hrefMatch[1])
    }

    let textMatch
    const texts = []
    while ((textMatch = textRegex.exec(referendaUrl)) !== null) {
      texts.push(textMatch[1])
    }

    for (let i = 0; i < Math.min(hrefs.length, texts.length); i++) {
      links.push({ text: texts[i], url: hrefs[i] })
    }

    return links
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">📋 Proposal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select a proposal to explore:</label>
          <select
            value={selectedProposalId}
            onChange={(e) => {
              setSelectedProposalId(e.target.value)
              setAiSummary('')
            }}
            className="w-full bg-background border border-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-polkadot-pink-500"
          >
            <option value="">Choose a proposal...</option>
            {proposals.slice(0, 50).map((proposal) => (
              <option key={proposal.referenda_id} value={String(proposal.referenda_id)}>
                {proposal.chain} · {proposal.origin} · ID {proposal.referenda_id} · {proposal.status}
              </option>
            ))}
          </select>
        </div>

        {selectedProposal && (
          <div className="space-y-4">
            <div className="p-6 glass-card space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xl font-bold">
                  {selectedProposal.chain} · {selectedProposal.origin} · ID {selectedProposal.referenda_id}
                </h3>
                <Badge variant={getStatusVariant(selectedProposal.status)}>
                  {selectedProposal.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Referendum ID:</span>{' '}
                  <span className="font-semibold mono">{selectedProposal.referenda_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Chain:</span>{' '}
                  <span className="font-semibold">{selectedProposal.chain}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Origin/Track:</span>{' '}
                  <span className="font-semibold">{selectedProposal.origin}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Proposer:</span>{' '}
                  <span className="font-semibold">
                    {selectedProposal.proposed_by_name || selectedProposal.proposed_by || 'Unknown'}
                  </span>
                </div>
                {selectedProposal.title && (
                  <div>
                    <span className="text-muted-foreground">Title:</span>{' '}
                    <span className="font-semibold">{selectedProposal.title}</span>
                  </div>
                )}
                {selectedProposal.start_time && (
                  <div>
                    <span className="text-muted-foreground">Start Time:</span>{' '}
                    <span>{new Date(selectedProposal.start_time).toLocaleString()}</span>
                  </div>
                )}
                {selectedProposal.end_time && (
                  <div>
                    <span className="text-muted-foreground">End Time:</span>{' '}
                    <span>{new Date(selectedProposal.end_time).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {selectedProposal.referenda_url && (
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Links:</p>
                  <div className="flex flex-wrap gap-2">
                    {extractLinks(selectedProposal.referenda_url).map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-polkadot-pink-500 hover:text-polkadot-pink-400 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {link.text}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={generateAISummary}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF2670] to-[#E6007A] hover:brightness-110"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Summarize with AI
                </>
              )}
            </Button>

            {aiSummary && (
              <div className="p-6 glass-card border-polkadot-pink-500/30">
                <h4 className="text-lg font-bold gradient-text mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI-Powered Analysis
                </h4>
                <div className="prose prose-invert prose-sm max-w-none">
                  {aiSummary.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-2 text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedProposalId && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Select a proposal from the dropdown to view details</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
