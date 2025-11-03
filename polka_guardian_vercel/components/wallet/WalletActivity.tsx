'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/data-table'
import { formatBalance, formatAddress, formatDate } from '@/lib/utils'
import { Wallet, ArrowLeftRight, FileText, Award, Vote, ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
                <DataTable
                  data={transfers}
                  columns={[
                    {
                      key: 'block_num',
                      label: 'Block Number',
                      render: (value) => <span className="mono">{value}</span>,
                    },
                    {
                      key: 'block_timestamp',
                      label: 'Timestamp',
                      render: (value) => formatDate(value),
                    },
                    {
                      key: 'from',
                      label: 'From Address',
                      render: (value) => (
                        <span className="mono text-xs">{formatAddress(value)}</span>
                      ),
                    },
                    {
                      key: 'to',
                      label: 'To Address',
                      render: (value) => (
                        <span className="mono text-xs">{formatAddress(value)}</span>
                      ),
                    },
                    {
                      key: 'amount',
                      label: 'Amount',
                      render: (value) => (
                        <span className="font-semibold text-primary">
                          {formatBalance(value, tokenMetadata?.decimals, tokenMetadata?.symbol)}
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
                    {
                      key: 'hash',
                      label: 'Hash',
                      render: (value) => (
                        <span className="mono text-xs">{formatAddress(value, 6)}</span>
                      ),
                    },
                  ]}
                  defaultItemsPerPage={10}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No transfers found</p>
              )}
            </TabsContent>

            <TabsContent value="extrinsics" className="space-y-2">
              {extrinsics && extrinsics.length > 0 ? (
                <DataTable
                  data={extrinsics}
                  columns={[
                    {
                      key: 'block_num',
                      label: 'Block Number',
                      render: (value) => <span className="mono">{value}</span>,
                    },
                    {
                      key: 'block_timestamp',
                      label: 'Timestamp',
                      render: (value) => formatDate(value),
                    },
                    {
                      key: 'extrinsic_index',
                      label: 'Extrinsic ID',
                      render: (value) => <span className="mono">{value}</span>,
                    },
                    {
                      key: 'call_module',
                      label: 'Call Module',
                      render: (value) => <span className="font-medium">{value}</span>,
                    },
                    {
                      key: 'call_module_function',
                      label: 'Call Name',
                      render: (value) => <span className="font-medium">{value}</span>,
                    },
                    {
                      key: 'success',
                      label: 'Success Status',
                      render: (value) => (
                        <span className={value ? 'text-green-400' : 'text-red-400'}>
                          {value ? '✓ Success' : '✗ Failed'}
                        </span>
                      ),
                    },
                    {
                      key: 'fee',
                      label: 'Fee',
                      render: (value) => value ? formatBalance(value, tokenMetadata?.decimals, tokenMetadata?.symbol) : 'N/A',
                    },
                    {
                      key: 'hash',
                      label: 'Hash',
                      render: (value) => (
                        <span className="mono text-xs">{value ? formatAddress(value, 6) : 'N/A'}</span>
                      ),
                    },
                  ]}
                  defaultItemsPerPage={10}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No extrinsics found</p>
              )}
            </TabsContent>

            <TabsContent value="staking" className="space-y-2">
              {staking && staking.length > 0 ? (
                <DataTable
                  data={staking}
                  columns={[
                    {
                      key: 'block_num',
                      label: 'Era/Block',
                      render: (value) => <span className="mono">{value}</span>,
                    },
                    {
                      key: 'event_id',
                      label: 'Event Type',
                      render: (value) => <span className="font-medium">{value}</span>,
                    },
                    {
                      key: 'validator_stash',
                      label: 'Validator',
                      render: (value) => value ? (
                        <span className="mono text-xs">{formatAddress(value)}</span>
                      ) : 'N/A',
                    },
                    {
                      key: 'amount',
                      label: 'Amount Staked',
                      render: (value) => (
                        <span className="font-semibold text-primary">
                          {value ? formatBalance(value, tokenMetadata?.decimals, tokenMetadata?.symbol) : 'N/A'}
                        </span>
                      ),
                    },
                    {
                      key: 'reward',
                      label: 'Reward',
                      render: (value, row) => {
                        if (row.event_id === 'Rewarded' || row.event_id === 'Reward') {
                          return <span className="text-green-400">{formatBalance(row.amount || value || 0, tokenMetadata?.decimals, tokenMetadata?.symbol)}</span>
                        }
                        return 'N/A'
                      },
                    },
                    {
                      key: 'block_timestamp',
                      label: 'Timestamp',
                      render: (value) => formatDate(value),
                    },
                  ]}
                  defaultItemsPerPage={10}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No staking activity found</p>
              )}
            </TabsContent>

            <TabsContent value="votes" className="space-y-2">
              {votes && votes.length > 0 ? (
                <DataTable
                  data={votes}
                  columns={[
                    {
                      key: 'referendum_index',
                      label: 'Referendum ID',
                      render: (value) => <span className="mono font-semibold">#{value}</span>,
                    },
                    {
                      key: 'vote',
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
                      key: 'balance',
                      label: 'Balance',
                      render: (value) => value ? (
                        <span className="font-medium">
                          {formatBalance(value, tokenMetadata?.decimals, tokenMetadata?.symbol)}
                        </span>
                      ) : 'N/A',
                    },
                    {
                      key: 'conviction',
                      label: 'Conviction',
                      render: (value) => <span className="font-medium">{value || 'None'}</span>,
                    },
                    {
                      key: 'block_num',
                      label: 'Block',
                      render: (value) => <span className="mono">{value}</span>,
                    },
                    {
                      key: 'block_timestamp',
                      label: 'Timestamp',
                      render: (value) => formatDate(value),
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
