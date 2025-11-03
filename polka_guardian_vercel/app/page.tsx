'use client'

import { useStore } from '@/lib/store'
import { WalletInput } from '@/components/wallet/WalletInput'
import { WalletActivity } from '@/components/wallet/WalletActivity'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { EcosystemMetrics } from '@/components/charts/EcosystemMetrics'
import { TreasuryFlow } from '@/components/charts/TreasuryFlow'
import { MonthlyVotersChart } from '@/components/governance/MonthlyVotersChart'
import { ProposalsList } from '@/components/governance/ProposalsList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Wallet, Vote } from 'lucide-react'

export default function Home() {
  const { currentView, setCurrentView } = useStore()

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-[2000px] mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            🌐 Polka Guardian
          </h1>
          <p className="text-muted-foreground text-lg">
            Professional Multi-Chain Account & Governance Analytics
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-6">
            <WalletInput />

            <Tabs 
              value={currentView} 
              onValueChange={(v) => setCurrentView(v as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="ecosystem" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Ecosystem Overview</span>
                </TabsTrigger>
                <TabsTrigger value="wallet" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span>Wallet Activity</span>
                </TabsTrigger>
                <TabsTrigger value="governance" className="flex items-center gap-2">
                  <Vote className="h-4 w-4" />
                  <span>Governance Monitor</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ecosystem" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <EcosystemMetrics />
                  <TreasuryFlow />
                  
                  <div className="glass-card p-6 text-center">
                    <p className="text-muted-foreground">
                      💡 Enter a wallet address above and click "Fetch Account Data" to explore wallet-specific analytics.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-6 mt-6">
                <WalletActivity />
              </TabsContent>

              <TabsContent value="governance" className="space-y-6 mt-6">
                <MonthlyVotersChart />
                <ProposalsList />
              </TabsContent>
            </Tabs>
          </div>

          <div className="xl:sticky xl:top-4 h-fit">
            <ChatSidebar />
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground pb-4">
          <p>© 2024 Polka Guardian | Powered by Next.js & Vercel</p>
        </footer>
      </div>
    </main>
  )
}
