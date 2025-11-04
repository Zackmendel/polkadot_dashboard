'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

export function EcosystemMetrics() {
  const [data, setData] = useState<any[]>([])
  const [selectedChain, setSelectedChain] = useState('Polkadot')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/governance?type=ecosystem_metrics')
        if (response.data.success) {
          const rawData = response.data.data
          
          // Group by date to aggregate multiple entries per day
          const dateMap = new Map<string, any>()
          
          rawData
            .filter((row: any) => row.block_time)
            .forEach((row: any) => {
              const date = new Date(row.block_time)
              const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
              const chain = row.chain || 'Unknown'
              const key = `${chain}_${dateKey}`
              
              const transfers = Number(row.transfers_cnt) || 0
              const active = Number(row.active_cnt) || 0
              const events = Number(row.events_cnt) || 0
              const extrinsics = Number(row.extrinsics_cnt) || 0
              
              // Skip completely empty rows
              if (transfers === 0 && active === 0 && events === 0 && extrinsics === 0) {
                return
              }
              
              if (dateMap.has(key)) {
                // Aggregate if same chain and date
                const existing = dateMap.get(key)
                existing.transfers_cnt += transfers
                existing.active_cnt += active
                existing.events_cnt += events
                existing.extrinsics_cnt += extrinsics
              } else {
                dateMap.set(key, {
                  chain,
                  date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  full_date: dateKey,
                  timestamp: date.getTime(),
                  transfers_cnt: transfers,
                  active_cnt: active,
                  events_cnt: events,
                  extrinsics_cnt: extrinsics,
                })
              }
            })
          
          const processed = Array.from(dateMap.values())
            .sort((a: any, b: any) => a.timestamp - b.timestamp)
          
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

  // Filter data by selected chain
  const filteredData = selectedChain === 'All Chains'
    ? data
    : data.filter(d => d.chain === selectedChain)

  const chains = ['All Chains', ...Array.from(new Set(data.map((d) => d.chain))).sort()]

  // Calculate interval for X-axis labels based on data length
  const getXAxisInterval = (dataLength: number) => {
    if (dataLength <= 10) return 0
    if (dataLength <= 30) return Math.floor(dataLength / 10)
    if (dataLength <= 60) return Math.floor(dataLength / 15)
    return Math.floor(dataLength / 20)
  }

  const xAxisInterval = getXAxisInterval(filteredData.length)

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-polkadot-pink-600/30 p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={index} 
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

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

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🌍 Ecosystem Basic Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">No data available for the selected chain</div>
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
        <p className="text-sm text-muted-foreground mt-2">
          Displaying {filteredData.length} data points for {selectedChain}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transfers">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transfers">🏦 Transfers</TabsTrigger>
            <TabsTrigger value="accounts">👥 Accounts</TabsTrigger>
            <TabsTrigger value="events">⚙️ Events</TabsTrigger>
            <TabsTrigger value="extrinsics">🧩 Extrinsics</TabsTrigger>
          </TabsList>

          <TabsContent value="transfers" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={xAxisInterval}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#888" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="transfers_cnt" fill="#FF2670" name="Transfers" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="accounts" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={xAxisInterval}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#888" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="active_cnt" fill="#E6007A" name="Active Accounts" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={xAxisInterval}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#888" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="events_cnt" fill="#10B981" name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="extrinsics" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={xAxisInterval}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#888" />
                <Tooltip content={<CustomTooltip />} />
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
