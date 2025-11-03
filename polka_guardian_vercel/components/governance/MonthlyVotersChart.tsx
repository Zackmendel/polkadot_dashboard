'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'

export function MonthlyVotersChart() {
  const [data, setData] = useState<any[]>([])
  const [outcomeData, setOutcomeData] = useState<any[]>([])
  const [metric, setMetric] = useState<'Voters' | 'Voting Power'>('Voters')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [votersRes, outcomeRes] = await Promise.all([
          axios.get('/api/governance?type=monthly_voters'),
          axios.get('/api/governance?type=referenda_outcomes'),
        ])

        if (votersRes.data.success) {
          const rawData = votersRes.data.data
          const chartData: any[] = []
          
          rawData.forEach((row: any) => {
            chartData.push({
              month: row.month,
              Type: 'Delegated',
              Voters: row.delegated_voters,
              'Voting Power': row.delegated_voting_power,
            })
            chartData.push({
              month: row.month,
              Type: 'Direct',
              Voters: row.direct_voters,
              'Voting Power': row.direct_voting_power,
            })
          })
          
          setData(chartData)
        }

        if (outcomeRes.data.success) {
          setOutcomeData(outcomeRes.data.data)
        }
      } catch (error) {
        console.error('Error loading monthly voters data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#667eea']

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading voting data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">📈 Monthly Voters & Voting Power by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Voters">Voters</SelectItem>
                  <SelectItem value="Voting Power">Voting Power</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid #667eea',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey={metric} fill="#667eea" name={metric} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">🗳️ Referenda Outcomes</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={(entry) => `${entry.status}: ${entry.count}`}
                  labelLine={false}
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid #667eea',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
