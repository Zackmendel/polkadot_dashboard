'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatBalance, formatAddress, formatDate } from '@/lib/utils'
import { Wallet, ArrowLeftRight, FileText, Award, Vote } from 'lucide-react'

export function WalletActivity() {
  const { walletData, walletAddress } = useStore()

  if (!walletData || !walletAddress) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Enter a wallet address above to view account activity
          </p>
        </CardContent>
      </Card>
    )
  }

  const { accountData, transfers, extrinsics, staking, votes, tokenMetadata } = walletData

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-2xl">Account Overview</CardTitle>
              <p className="text-sm text-muted-foreground mono mt-1">{walletAddress}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Free Balance</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {accountData?.balance 
                  ? formatBalance(accountData.balance, tokenMetadata?.decimals, tokenMetadata?.symbol)
                  : 'N/A'}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Reserved</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {accountData?.reserved 
                  ? formatBalance(accountData.reserved, tokenMetadata?.decimals, tokenMetadata?.symbol)
                  : 'N/A'}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Locked</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {accountData?.lock 
                  ? formatBalance(accountData.lock, tokenMetadata?.decimals, tokenMetadata?.symbol)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transfers">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transfers">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Transfers ({transfers?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="extrinsics">
                <FileText className="h-4 w-4 mr-2" />
                Extrinsics ({extrinsics?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="staking">
                <Award className="h-4 w-4 mr-2" />
                Staking ({staking?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="votes">
                <Vote className="h-4 w-4 mr-2" />
                Votes ({votes?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transfers" className="space-y-2">
              {transfers && transfers.length > 0 ? (
                <div className="space-y-2">
                  {transfers.slice(0, 10).map((transfer: any, index: number) => (
                    <div key={index} className="glass-card p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {transfer.from === walletAddress ? '📤 Sent' : '📥 Received'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transfer.from === walletAddress 
                              ? `To: ${formatAddress(transfer.to)}` 
                              : `From: ${formatAddress(transfer.from)}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Block: {transfer.block_num}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {formatBalance(transfer.amount, tokenMetadata?.decimals, tokenMetadata?.symbol)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transfer.datetime ? formatDate(transfer.block_timestamp) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transfers found</p>
              )}
            </TabsContent>

            <TabsContent value="extrinsics" className="space-y-2">
              {extrinsics && extrinsics.length > 0 ? (
                <div className="space-y-2">
                  {extrinsics.slice(0, 10).map((ext: any, index: number) => (
                    <div key={index} className="glass-card p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{ext.call_module}::{ext.call_module_function}</p>
                          <p className="text-xs text-muted-foreground">
                            Block: {ext.block_num} | Extrinsic: {ext.extrinsic_index}
                          </p>
                          <p className="text-xs">
                            <span className={ext.success ? 'text-green-400' : 'text-red-400'}>
                              {ext.success ? '✓ Success' : '✗ Failed'}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {ext.datetime || formatDate(ext.block_timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No extrinsics found</p>
              )}
            </TabsContent>

            <TabsContent value="staking" className="space-y-2">
              {staking && staking.length > 0 ? (
                <div className="space-y-2">
                  {staking.slice(0, 10).map((stake: any, index: number) => (
                    <div key={index} className="glass-card p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{stake.event_id}</p>
                          <p className="text-xs text-muted-foreground">Block: {stake.block_num}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            {stake.amount ? formatBalance(stake.amount, tokenMetadata?.decimals, tokenMetadata?.symbol) : 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stake.datetime ? formatDate(stake.block_timestamp) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No staking activity found</p>
              )}
            </TabsContent>

            <TabsContent value="votes" className="space-y-2">
              {votes && votes.length > 0 ? (
                <div className="space-y-2">
                  {votes.slice(0, 10).map((vote: any, index: number) => (
                    <div key={index} className="glass-card p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Referendum #{vote.referendum_index}</p>
                          <p className="text-xs text-muted-foreground">
                            Vote: <span className="text-primary">{vote.vote}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">Block: {vote.block_num}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {vote.datetime ? formatDate(vote.block_timestamp) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No votes found</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
