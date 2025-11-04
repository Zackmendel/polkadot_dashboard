'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, User, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface VoterData {
  voter: string
  voter_name?: string
  voter_type: string
  is_active: boolean
  last_vote_time: string
  total_votes: number
  total_tokens_cast: number
  aye_tokens: number
  nay_tokens: number
  abstain_tokens: number
  support_ratio_pct: number
  delegates?: string
}

export function VoterLookup() {
  const [voterAddress, setVoterAddress] = useState('')
  const [voterData, setVoterData] = useState<VoterData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRawData, setShowRawData] = useState(false)

  const searchVoter = async () => {
    if (!voterAddress.trim()) {
      setError('Please enter a wallet address')
      return
    }

    setLoading(true)
    setError('')
    setVoterData(null)

    try {
      const response = await axios.get('/api/governance?type=voters')
      if (response.data.success) {
        const voters = response.data.data
        const voter = voters.find((v: any) => 
          v.voter?.toLowerCase() === voterAddress.toLowerCase()
        )

        if (voter) {
          setVoterData(voter)
        } else {
          setError('❌ Voter not found in the governance database')
        }
      }
    } catch (err) {
      console.error('Error searching voter:', err)
      setError('Failed to search voter data')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    if (address.length <= 30) return address
    return `${address.slice(0, 20)}...${address.slice(-10)}`
  }

  const formatNumber = (num: number) => {
    return num?.toLocaleString() || '0'
  }

  const getVoteDistributionData = () => {
    if (!voterData) return []

    const totalTokens = voterData.aye_tokens + voterData.nay_tokens + voterData.abstain_tokens
    
    return [
      {
        name: 'Aye',
        value: voterData.aye_tokens,
        percentage: totalTokens > 0 ? ((voterData.aye_tokens / totalTokens) * 100).toFixed(1) : '0',
        color: '#10B981'
      },
      {
        name: 'Nay',
        value: voterData.nay_tokens,
        percentage: totalTokens > 0 ? ((voterData.nay_tokens / totalTokens) * 100).toFixed(1) : '0',
        color: '#EF4444'
      },
      {
        name: 'Abstain',
        value: voterData.abstain_tokens,
        percentage: totalTokens > 0 ? ((voterData.abstain_tokens / totalTokens) * 100).toFixed(1) : '0',
        color: '#6B7280'
      }
    ].filter(item => item.value > 0)
  }

  const getVotingPattern = () => {
    if (!voterData) return { icon: '⚖️', text: 'No voting data', color: '#667eea' }

    const totalVotes = voterData.total_votes
    const ayePct = voterData.support_ratio_pct
    const nayPct = 100 - ayePct

    if (ayePct > nayPct) {
      return { 
        icon: '✅', 
        text: `This voter tends to support proposals (${ayePct.toFixed(1)}% Aye votes)`,
        color: '#10B981'
      }
    } else if (nayPct > ayePct) {
      return {
        icon: '❌',
        text: `This voter tends to oppose proposals (${nayPct.toFixed(1)}% Nay votes)`,
        color: '#EF4444'
      }
    } else {
      return {
        icon: '⚖️',
        text: 'This voter has a balanced voting pattern',
        color: '#667eea'
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🔍 Voter Lookup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchVoter()}
                placeholder="Enter Wallet Address"
                className="pl-10"
              />
            </div>
            <Button 
              onClick={searchVoter} 
              disabled={loading}
              className="bg-gradient-to-r from-[#FF2670] to-[#E6007A] hover:brightness-110"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {voterData && (
        <>
          {/* Voter Profile Card */}
          <Card className="border-polkadot-pink-500/30 bg-gradient-to-br from-polkadot-pink-500/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF2670] to-[#E6007A] flex items-center justify-center text-3xl">
                  {voterData.voter_name ? voterData.voter_name.slice(0, 2) : <User className="h-10 w-10 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">
                    {voterData.voter_name || 'Anonymous Voter'}
                  </h3>
                  <p className="mono text-sm text-muted-foreground">
                    {formatAddress(voterData.voter)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={voterData.is_active ? 'success' : 'default'}>
                  {voterData.is_active ? '🟢 Active' : '⚫ Inactive'}
                </Badge>
                <Badge variant="info">
                  📝 {voterData.voter_type}
                </Badge>
                <Badge variant="default">
                  🕐 Last Vote: {voterData.last_vote_time ? new Date(voterData.last_vote_time).toLocaleDateString() : 'N/A'}
                </Badge>
              </div>

              <div className="p-3 bg-background/50 rounded-lg mono text-xs break-all">
                {voterData.voter}
              </div>
            </CardContent>
          </Card>

          {/* Voting Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Voting Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-[#64ffda] mb-2">
                    🗳️ {formatNumber(voterData.total_votes)}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase">Total Votes</div>
                </div>

                <div className="glass-card p-4 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-polkadot-pink-500 mb-2">
                    💎 {formatNumber(Math.round(voterData.total_tokens_cast))}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase">Total Tokens</div>
                </div>

                <div className="glass-card p-4 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    ✅ {voterData.support_ratio_pct.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground uppercase">Support Ratio</div>
                </div>

                <div className="glass-card p-4 text-center hover:scale-105 transition-transform">
                  {voterData.delegates ? (
                    <>
                      <div className="text-lg font-bold text-amber-400 mb-2 truncate" title={voterData.delegates}>
                        🔗 {voterData.delegates.length > 20 ? voterData.delegates.slice(0, 20) + '...' : voterData.delegates}
                      </div>
                      <div className="text-sm text-muted-foreground uppercase">Delegates To</div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-muted-foreground/50 mb-2">—</div>
                      <div className="text-sm text-muted-foreground uppercase">No Delegation</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vote Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Vote Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getVoteDistributionData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {getVoteDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-[#171717] border border-polkadot-pink-500/30 p-3 rounded-lg shadow-lg">
                                <p className="font-semibold" style={{ color: data.color }}>
                                  {data.name}
                                </p>
                                <p className="text-sm">
                                  {formatNumber(data.value)} tokens ({data.percentage}%)
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {getVoteDistributionData().map((item) => (
                    <div 
                      key={item.name}
                      className="p-4 rounded-lg border transition-colors"
                      style={{ 
                        backgroundColor: `${item.color}15`,
                        borderColor: `${item.color}40`
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg" style={{ color: item.color }}>
                          {item.name === 'Aye' && '✅'} 
                          {item.name === 'Nay' && '❌'} 
                          {item.name === 'Abstain' && '⚪'} 
                          {' '}{item.name}
                        </span>
                        <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                      </div>
                      <div className="text-xl font-bold">{formatNumber(item.value)} tokens</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participation Insights */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Participation Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="p-6 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: `${getVotingPattern().color}15`,
                  borderColor: getVotingPattern().color
                }}
              >
                <h4 className="text-xl font-bold mb-3" style={{ color: getVotingPattern().color }}>
                  {getVotingPattern().icon} Voting Pattern
                </h4>
                <p className="text-lg mb-4">{getVotingPattern().text}</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Average tokens per vote:</strong>{' '}
                    {formatNumber(Math.round(voterData.total_tokens_cast / voterData.total_votes))} tokens
                  </li>
                  <li>
                    <strong className="text-foreground">Activity status:</strong>{' '}
                    {voterData.is_active ? '🟢 Active participant' : '⚫ Inactive'}
                  </li>
                  <li>
                    <strong className="text-foreground">Voter type:</strong> {voterData.voter_type}
                  </li>
                  {voterData.delegates && (
                    <li>
                      <strong className="text-foreground">Delegation:</strong> {voterData.delegates}
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Raw Data Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>📋 Raw Voter Data</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRawData(!showRawData)}
                >
                  {showRawData ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            {showRawData && (
              <CardContent>
                <div className="bg-background/50 p-4 rounded-lg overflow-auto">
                  <pre className="text-xs">
                    {JSON.stringify(voterData, null, 2)}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
