'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import axios from 'axios'

export function ProposalsList() {
  const [proposals, setProposals] = useState<any[]>([])
  const [filteredProposals, setFilteredProposals] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/governance?type=proposals')
        if (response.data.success) {
          const data = response.data.data
          setProposals(data)
          setFilteredProposals(data.slice(0, 20))
        }
      } catch (error) {
        console.error('Error loading proposals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = proposals.filter((p) =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.proposer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.track?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProposals(filtered.slice(0, 20))
    } else {
      setFilteredProposals(proposals.slice(0, 20))
    }
  }, [searchTerm, proposals])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading proposals...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">📋 Recent Proposals</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search proposals by title, proposer, or track..."
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredProposals.map((proposal, index) => (
            <div key={index} className="glass-card p-4 hover:border-primary transition-colors">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base">
                      #{proposal.referendumIndex} - {proposal.title || 'Untitled Proposal'}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track: <span className="text-primary">{proposal.track || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      proposal.status === 'Confirmed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : proposal.status === 'Rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {proposal.status || 'Unknown'}
                    </span>
                  </div>
                </div>

                {proposal.proposer && (
                  <div className="text-xs text-muted-foreground">
                    Proposer: <span className="mono">{proposal.proposer.slice(0, 12)}...</span>
                  </div>
                )}

                {proposal.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {proposal.content}
                  </p>
                )}

                <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                  {proposal.ayeVotes && (
                    <span>👍 Aye: {proposal.ayeVotes}</span>
                  )}
                  {proposal.nayVotes && (
                    <span>👎 Nay: {proposal.nayVotes}</span>
                  )}
                  {proposal.created_at && (
                    <span>📅 {new Date(proposal.created_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProposals.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No proposals found matching your search
          </p>
        )}
      </CardContent>
    </Card>
  )
}
