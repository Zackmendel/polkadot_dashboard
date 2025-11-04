'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/data-table'
import { formatBalance, formatAddress, formatDate } from '@/lib/utils'
import { Wallet, ArrowLeftRight, FileText, Award, Vote, TrendingUp } from 'lucide-react'

export function WalletActivity() {
  const { walletData, walletAddress, selectedChain } = useStore()

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

  // Extract values exactly like Streamlit does
  const balance = parseFloat(accountData?.balance || '0')
  const lock = parseFloat(accountData?.lock || '0')
  const reserved = parseFloat(accountData?.reserved || '0') / 1e10
  const priceUsd = tokenMetadata?.price || 0
  const symbol = tokenMetadata?.symbol || 'N/A'
  const decimals = tokenMetadata?.decimals || 10

  // Calculate derived values
  const balanceUsd = balance * priceUsd
  const lockUsd = lock * priceUsd
  
  // Calculate transferable with safety check to prevent negative values
  let transferable = balance - lock
  // If balance is zero OR transferable is negative, set to zero
  if (balance === 0 || transferable < 0) {
    transferable = 0
  }
  
  const transferableUsd = transferable * priceUsd
  const reservedUsd = reserved * priceUsd

  // Extract staking info from accountData
  const stakingInfo = accountData?.staking_info || {}
  const delegateData = accountData?.delegate?.conviction_delegate || []
  const stash = accountData?.stash || 'N/A'

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <CardTitle className="text-2xl">Account Overview</CardTitle>
              <p className="text-sm text-muted-foreground mono mt-1">{walletAddress}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Network</p>
              <p className="text-xl font-bold text-primary mt-2">{selectedChain}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Transactions</p>
              <p className="text-xl font-bold text-primary mt-2">
                {accountData?.nonce || 'N/A'}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Role</p>
              <p className="text-xl font-bold text-primary mt-2">
                {accountData?.role || 'N/A'}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Display Name</p>
              <p className="text-xl font-bold text-primary mt-2">
                {accountData?.display || '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Overview - Matching Streamlit exactly */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">💰 Balance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Balance */}
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Balance</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ${balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Transferable */}
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Transferable</p>
              <p className="text-2xl font-bold text-green-400 mt-2">
                {transferable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ${transferableUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Locked */}
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Locked</p>
              <p className="text-2xl font-bold text-yellow-400 mt-2">
                {lock.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ${lockUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Reserved */}
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Reserved</p>
              <p className="text-2xl font-bold text-blue-400 mt-2">
                {reserved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Token Price: ${priceUsd.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">📊 Additional Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Bonded</p>
              <p className="text-xl font-bold text-primary mt-2">
                {parseFloat(accountData?.bonded || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Democracy Lock</p>
              <p className="text-xl font-bold text-primary mt-2">
                {parseFloat(accountData?.democracy_lock || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Conviction Lock</p>
              <p className="text-xl font-bold text-primary mt-2">
                {parseFloat(accountData?.conviction_lock || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Details Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">📈 Detailed Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transfers">
            <TabsList className="grid w-full grid-cols-5">
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
                Staking
              </TabsTrigger>
              <TabsTrigger value="rewards">
                <TrendingUp className="h-4 w-4 mr-2" />
                Rewards ({staking?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="votes">
                <Vote className="h-4 w-4 mr-2" />
                Votes ({votes?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Transfers Tab */}
            <TabsContent value="transfers" className="space-y-2">
              {transfers && transfers.length > 0 ? (
                <DataTable
                  data={transfers}
                  columns={[
                    {
                      key: 'block_num',
                      label: 'Block',
                      render: (value) => <span className="mono">{value}</span>,
                    },
                    {
                      key: 'block_timestamp',
                      label: 'Time',
                      render: (value) => formatDate(value),
                    },
                    {
                      key: 'from',
                      label: 'From',
                      render: (value) => (
                        <span className="mono text-xs">{formatAddress(value)}</span>
                      ),
                    },
                    {
                      key: 'to',
                      label: 'To',
                      render: (value) => (
                        <span className="mono text-xs">{formatAddress(value)}</span>
                      ),
                    },
                    {
                      key: 'amount',
                      label: 'Amount',
                      render: (value) => (
                        <span className="font-semibold text-primary">
                          {formatBalance(value, decimals, symbol)}
                        </span>
                      ),
                    },
                    {
                      key: 'success',
                      label: 'Status',
                      render: (value) => (
                        <span className={value !== false ? 'text-green-400' : 'text-red-400'}>
                          {value !== false ? '✓ Success' : '✗ Failed'}
                        </span>
                      ),
                    },
                  ]}
                  defaultItemsPerPage={10}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No transfers found</p>
              )}
            </TabsContent>

            {/* Extrinsics Tab */}
            <TabsContent value="extrinsics" className="space-y-2">
              {extrinsics && extrinsics.length > 0 ? (
                <DataTable
                  data={extrinsics}
                  columns={[
                    {
                      key: 'block_num',
                      label: 'Block',
                      render: (value) => <span className="mono">{value}</span>,
                    },
                    {
                      key: 'block_timestamp',
                      label: 'Time',
                      render: (value) => formatDate(value),
                    },
                    {
                      key: 'call_module',
                      label: 'Module',
                      render: (value) => <span className="font-medium">{value}</span>,
                    },
                    {
                      key: 'call_module_function',
                      label: 'Function',
                      render: (value) => <span className="font-medium">{value}</span>,
                    },
                    {
                      key: 'success',
                      label: 'Status',
                      render: (value) => (
                        <span className={value ? 'text-green-400' : 'text-red-400'}>
                          {value ? '✓' : '✗'}
                        </span>
                      ),
                    },
                    {
                      key: 'fee',
                      label: 'Fee',
                      render: (value) => value ? formatBalance(value, decimals, symbol) : 'N/A',
                    },
                  ]}
                  defaultItemsPerPage={10}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No extrinsics found</p>
              )}
            </TabsContent>

            {/* Staking Info Tab */}
            <TabsContent value="staking" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Staking Information</h3>
                
                {Object.keys(stakingInfo).length > 0 ? (
                  <div className="space-y-2">
                    <div className="p-4 bg-card rounded-lg border">
                      <p className="text-sm text-muted-foreground">Controller</p>
                      <p className="text-sm mono mt-1">{stakingInfo.controller || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-card rounded-lg border">
                      <p className="text-sm text-muted-foreground">Reward Account</p>
                      <p className="text-sm mono mt-1">{stakingInfo.reward_account || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-card rounded-lg border">
                      <p className="text-sm text-muted-foreground">Stash</p>
                      <p className="text-sm mono mt-1">{stash}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No staking information found</p>
                )}

                <h3 className="text-lg font-semibold mt-6">Delegations</h3>
                
                {delegateData.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold">Delegate Display</th>
                          <th className="text-left p-3 text-sm font-semibold">Delegate Address</th>
                          <th className="text-left p-3 text-sm font-semibold">Conviction</th>
                          <th className="text-right p-3 text-sm font-semibold">Amount</th>
                          <th className="text-right p-3 text-sm font-semibold">Votes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {delegateData.map((d: any, idx: number) => {
                          const delegate = d.delegate_account || {}
                          const people = delegate.people || {}
                          return (
                            <tr key={idx} className="border-t">
                              <td className="p-3 text-sm">{people.display || 'N/A'}</td>
                              <td className="p-3 text-sm mono">{formatAddress(delegate.address || 'N/A')}</td>
                              <td className="p-3 text-sm">{d.conviction || 'N/A'}</td>
                              <td className="p-3 text-sm text-right">{(parseInt(d.amount || '0') / 1e10).toFixed(2)}</td>
                              <td className="p-3 text-sm text-right">{(parseInt(d.votes || '0') / 1e10).toFixed(2)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No delegation data</p>
                )}
              </div>
            </TabsContent>

            {/* Staking Rewards Tab */}
            <TabsContent value="rewards" className="space-y-2">
              {staking && staking.length > 0 ? (
                <DataTable
                  data={staking}
                  columns={[
                    {
                      key: 'block_num',
                      label: 'Block',
                      render: (value) => <span className="mono">{value}</span>,
                    },
                    {
                      key: 'block_timestamp',
                      label: 'Time',
                      render: (value) => formatDate(value),
                    },
                    {
                      key: 'event_id',
                      label: 'Event',
                      render: (value) => <span className="font-medium">{value}</span>,
                    },
                    {
                      key: 'amount',
                      label: 'Amount',
                      render: (value) => (
                        <span className="font-semibold text-green-400">
                          {formatBalance(value, decimals, symbol)}
                        </span>
                      ),
                    },
                  ]}
                  defaultItemsPerPage={10}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No staking rewards found</p>
              )}
            </TabsContent>

            {/* Votes Tab */}
            <TabsContent value="votes" className="space-y-2">
              {votes && votes.length > 0 ? (
                <DataTable
                  data={votes}
                  columns={[
                    {
                      key: 'referendum_index',
                      label: 'Ref ID',
                      render: (value) => <span className="mono font-semibold">#{value}</span>,
                    },
                    {
                      key: 'block_timestamp',
                      label: 'Time',
                      render: (value) => formatDate(value),
                    },
                    {
                      key: 'status',
                      label: 'Vote',
                      render: (value) => {
                        const voteType = String(value).toLowerCase()
                        const color = voteType.includes('aye') ? 'text-green-400' : 
                                     voteType.includes('nay') ? 'text-red-400' : 
                                     'text-blue-400'
                        return <span className={`font-semibold ${color}`}>{value}</span>
                      },
                    },
                    {
                      key: 'amount',
                      label: 'Amount',
                      render: (value) => (
                        <span className="font-medium">
                          {formatBalance(value, decimals, symbol)}
                        </span>
                      ),
                    },
                    {
                      key: 'conviction',
                      label: 'Conviction',
                      render: (value) => <span className="font-medium">{value || 'None'}</span>,
                    },
                  ]}
                  defaultItemsPerPage={10}
                />
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
