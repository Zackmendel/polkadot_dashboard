'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

export function EcosystemMetrics() {
  const [data, setData] = useState<any[]>([])
  const [selectedChain, setSelectedChain] = useState('All Chains')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/governance?type=ecosystem_metrics')
        if (response.data.success) {
          const rawData = response.data.data
          const processed = rawData.map((row: any) => ({
            ...row,
            date: new Date(row.block_time).toLocaleDateString(),
          }))
          setData(processed)
        }
      } catch (error) {
        console.error('Error loading ecosystem metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = selectedChain === 'All Chains' 
    ? data 
    : data.filter((d) => d.chain === selectedChain)

  const chains = ['All Chains', ...Array.from(new Set(data.map((d) => d.chain))).sort()]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading ecosystem metrics...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">🌍 Ecosystem Basic Metrics</CardTitle>
          <Select value={selectedChain} onValueChange={setSelectedChain}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chains.map((chain) => (
                <SelectItem key={chain} value={chain}>
                  {chain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transfers">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transfers">🏦 Transfers</TabsTrigger>
            <TabsTrigger value="accounts">👥 Accounts</TabsTrigger>
            <TabsTrigger value="events">⚙️ Events</TabsTrigger>
            <TabsTrigger value="extrinsics">🧩 Extrinsics</TabsTrigger>
          </TabsList>

          <TabsContent value="transfers">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #667eea' }} />
                <Legend />
                <Bar dataKey="transfers_cnt" fill="#667eea" name="Transfers" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="accounts">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #667eea' }} />
                <Legend />
                <Bar dataKey="active_cnt" fill="#764ba2" name="Active Accounts" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="events">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #667eea' }} />
                <Legend />
                <Bar dataKey="events_cnt" fill="#10B981" name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="extrinsics">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #667eea' }} />
                <Legend />
                <Bar dataKey="extrinsics_cnt" fill="#F59E0B" name="Extrinsics" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
