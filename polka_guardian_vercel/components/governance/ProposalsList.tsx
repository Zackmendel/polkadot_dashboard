'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { Search } from 'lucide-react'
import axios from 'axios'
import { sortProposalsByDate, parseProposalDate } from '@/lib/dataUtils'

export function ProposalsList() {
  const [proposals, setProposals] = useState<any[]>([])
  const [filteredProposals, setFilteredProposals] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Sort proposals by date (most recent first)
  const sortedProposals = useMemo(() => {
    return sortProposalsByDate(proposals)
  }, [proposals])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/governance?type=proposals')
        if (response.data.success) {
          const rawData = response.data.data
          
          const parsedProposals = rawData.map((row: any) => ({
            id: row.referenda_id,
            title: row.title || `Referendum #${row.referenda_id}`,
            chain: row.chain || 'Unknown',
            origin: row.origin || 'N/A',
            proposer: row.proposed_by_name || row.proposed_by || 'Unknown',
            status: row.status || 'Unknown',
            startTime: row.start_time,
            endTime: row.end_time,
            referendaUrl: row.referenda_url,
          }))
          
          setProposals(parsedProposals)
          setFilteredProposals(parsedProposals.slice(0, 20))
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
      const filtered = sortedProposals.filter((p) =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.proposer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.chain?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProposals(filtered)
    } else {
      setFilteredProposals(sortedProposals.slice(0, 20))
    }
  }, [searchTerm, sortedProposals])

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
                key: 'id',
                label: 'ID',
                render: (value) => <span className="mono font-semibold">#{value}</span>,
              },
              {
                key: 'title',
                label: 'Title/Description',
                render: (value, row) => (
                  <div className="max-w-sm">
                    <p className="font-semibold text-sm line-clamp-2">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {row.chain} · {row.origin}
                    </p>
                  </div>
                ),
              },
              {
                key: 'proposer',
                label: 'Proposer',
                render: (value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => {
                  const statusLower = String(value).toLowerCase()
                  const isConfirmed = statusLower.includes('confirmed') || statusLower.includes('passed')
                  const isRejected = statusLower.includes('rejected') || statusLower.includes('failed')
                  const variant = isConfirmed ? 'success' : isRejected ? 'error' : 'info'
                  return (
                    <Badge variant={variant}>
                      {value}
                    </Badge>
                  )
                },
              },
              {
                key: 'startTime',
                label: 'Start Date',
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
