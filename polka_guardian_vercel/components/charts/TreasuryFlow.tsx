'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

export function TreasuryFlow() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/governance?type=treasury_flow')
        if (response.data.success) {
          const rawData = response.data.data
          const processed = rawData.map((row: any) => ({
            ...row,
            date: new Date(row.block_time).toLocaleDateString(),
          }))
          setData(processed)
        }
      } catch (error) {
        console.error('Error loading treasury flow:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading treasury flow...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">💰 Polkadot Treasury Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a2e', 
                border: '1px solid #667eea',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Bar dataKey="bounties" stackId="a" fill="#10B981" name="Bounties" />
            <Bar dataKey="burnt" stackId="a" fill="#EF4444" name="Burnt" />
            <Bar dataKey="inflation" stackId="a" fill="#667eea" name="Inflation" />
            <Bar dataKey="proposal" stackId="a" fill="#764ba2" name="Proposal" />
            <Bar dataKey="txn_fees" stackId="a" fill="#F59E0B" name="Transaction Fees" />
            <Bar dataKey="txn_tips" stackId="a" fill="#8B5CF6" name="Transaction Tips" />
            <Line 
              type="monotone" 
              dataKey="net_flow" 
              stroke="#64ffda" 
              strokeWidth={3}
              name="Net Flow"
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
