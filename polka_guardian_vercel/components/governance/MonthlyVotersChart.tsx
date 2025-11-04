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
          
          rawData
            .filter((row: any) => row.month)
            .forEach((row: any) => {
              chartData.push({
                month: row.month,
                Type: 'Delegated',
                Voters: row.delegated_voters || 0,
                'Voting Power': row.delegated_voting_power || 0,
              })
              chartData.push({
                month: row.month,
                Type: 'Direct',
                Voters: row.direct_voters || 0,
                'Voting Power': row.direct_voting_power || 0,
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

  const getColorForStatus = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('pass') || statusLower.includes('confirm')) return '#10B981'
    if (statusLower.includes('fail') || statusLower.includes('reject')) return '#EF4444'
    if (statusLower.includes('ongoing') || statusLower.includes('active')) return '#3B82F6'
    return '#8B5CF6'
  }

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
                    backgroundColor: '#171717', 
                    border: '1px solid rgba(230, 0, 122, 0.3)',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey={metric} fill="#FF2670" name={metric} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">🗳️ Referenda Outcomes</h3>
            {outcomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={outcomeData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    label={(entry) => `${entry.count}`}
                    labelLine={true}
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorForStatus(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#171717', 
                      border: '1px solid rgba(230, 0, 122, 0.3)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: any) => [`Count: ${value}`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => `${value} (${entry.payload.count})`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                No referenda outcome data available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
