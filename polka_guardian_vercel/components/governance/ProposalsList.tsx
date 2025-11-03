'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
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
      setFilteredProposals(filtered)
    } else {
      setFilteredProposals(proposals)
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
        {filteredProposals.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No proposals found matching your search
          </p>
        ) : (
          <DataTable
            data={filteredProposals}
            columns={[
              {
                key: 'referendumIndex',
                label: 'Proposal ID',
                render: (value) => <span className="mono font-semibold">#{value}</span>,
              },
              {
                key: 'title',
                label: 'Title/Description',
                render: (value, row) => (
                  <div className="max-w-xs">
                    <p className="font-semibold text-sm line-clamp-2">{value || 'Untitled Proposal'}</p>
                    {row.content && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {row.content}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => {
                  const statusLower = String(value).toLowerCase()
                  const isConfirmed = statusLower.includes('confirmed') || statusLower.includes('passed')
                  const isRejected = statusLower.includes('rejected') || statusLower.includes('failed')
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      isConfirmed
                        ? 'bg-green-500/20 text-green-400' 
                        : isRejected
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {value || 'Unknown'}
                    </span>
                  )
                },
              },
              {
                key: 'ayeVotes',
                label: 'Aye Votes',
                render: (value) => <span className="text-green-400">{value || 0}</span>,
              },
              {
                key: 'nayVotes',
                label: 'Nay Votes',
                render: (value) => <span className="text-red-400">{value || 0}</span>,
              },
              {
                key: 'abstainVotes',
                label: 'Abstain',
                render: (value) => <span className="text-blue-400">{value || 0}</span>,
              },
              {
                key: 'track',
                label: 'Track',
                render: (value) => (
                  <span className="text-xs text-primary">{value || 'N/A'}</span>
                ),
              },
              {
                key: 'created_at',
                label: 'Created Date',
                render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
              },
            ]}
            defaultItemsPerPage={10}
          />
        )}
      </CardContent>
    </Card>
  )
}
