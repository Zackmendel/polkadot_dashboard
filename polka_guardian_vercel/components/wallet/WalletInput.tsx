'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search, Loader2 } from 'lucide-react'
import { CHAIN_OPTIONS } from '@/lib/subscan'
import axios from 'axios'

export function WalletInput() {
  const [address, setAddress] = useState('15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    selectedChain,
    setSelectedChain,
    setWalletAddress,
    setWalletData,
    setCurrentView,
    setIsLoading: setGlobalLoading,
  } = useStore()

  const handleFetch = async () => {
    if (!address.trim()) {
      setError('Please enter a wallet address')
      return
    }

    setError('')
    setIsLoading(true)
    setGlobalLoading(true)

    try {
      const chainKey = CHAIN_OPTIONS[selectedChain]
      const response = await axios.post('/api/subscan', {
        chainKey,
        address: address.trim(),
      })

      if (response.data.success) {
        setWalletAddress(address.trim())
        setWalletData({
          accountData: response.data.data.accountData?.data?.account,
          transfers: response.data.data.transfers,
          extrinsics: response.data.data.extrinsics,
          staking: response.data.data.staking,
          votes: response.data.data.votes,
          tokenMetadata: response.data.data.tokenMetadata,
        })
        setCurrentView('wallet')
      } else {
        setError('Failed to fetch wallet data')
      }
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.response?.data?.error || 'Failed to fetch wallet data')
    } finally {
      setIsLoading(false)
      setGlobalLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetch()
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-2">🔑 Wallet Explorer</h2>
          <p className="text-sm text-muted-foreground">
            Enter a Polkadot/Substrate address to explore on-chain activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter wallet address..."
              disabled={isLoading}
              className="h-12"
            />
          </div>
          
          <Select value={selectedChain} onValueChange={setSelectedChain} disabled={isLoading}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select chain" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CHAIN_OPTIONS).map((chain) => (
                <SelectItem key={chain} value={chain}>
                  {chain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleFetch} 
          disabled={isLoading}
          className="w-full h-12 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Fetching Data...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Fetch Account Data
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
            {error}
          </div>
        )}
      </div>
    </Card>
  )
}
