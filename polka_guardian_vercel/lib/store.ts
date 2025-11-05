import { create } from 'zustand'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface WalletData {
  accountData?: any
  transfers?: any[]
  extrinsics?: any[]
  staking?: any[]
  votes?: any[]
  tokenMetadata?: {
    symbol: string
    decimals: number
    price: number
  }
}

export interface WalletContext {
  address: string
  chain: string
  balance: number
  transferable: number
  locked: number
  reserved: number
  tokenPrice: number
  symbol: string
  recentTransfers: TransferSummary[]
  stakingStatus: StakingSummary | null
  totalTransfers: number
  totalExtrinsics: number
}

export interface TransferSummary {
  hash: string
  amount: number
  from: string
  to: string
  timestamp: string
  success: boolean
}

export interface StakingSummary {
  controller?: string
  rewardAccount?: string
  stash?: string
  isActive: boolean
  delegations: number
}

export interface GovernanceContext {
  votersCount: number
  proposalsCount: number
  activeProposals: number
  recentActivity: string
}

interface ChatStore {
  chatMessages: ChatMessage[]
  walletContext: WalletContext | null
  governanceContext: GovernanceContext | null
  addMessage: (message: ChatMessage) => void
  setWalletContext: (context: WalletContext) => void
  setGovernanceContext: (context: GovernanceContext) => void
  clearChat: () => void
}

interface AppState {
  walletAddress: string
  selectedChain: string
  currentView: 'ecosystem' | 'wallet' | 'governance'
  walletData: WalletData | null
  governanceData: {
    voters?: any[]
    proposals?: any[]
  }
  chatMessages: ChatMessage[]
  isLoading: boolean
  
  setWalletAddress: (address: string) => void
  setSelectedChain: (chain: string) => void
  setCurrentView: (view: 'ecosystem' | 'wallet' | 'governance') => void
  setWalletData: (data: WalletData) => void
  setGovernanceData: (data: any) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  setIsLoading: (loading: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  walletAddress: '',
  selectedChain: 'Polkadot',
  currentView: 'ecosystem',
  walletData: null,
  governanceData: {},
  chatMessages: [],
  isLoading: false,

  setWalletAddress: (address) => set({ walletAddress: address }),
  setSelectedChain: (chain) => set({ selectedChain: chain }),
  setCurrentView: (view) => set({ currentView: view }),
  setWalletData: (data) => set({ walletData: data }),
  setGovernanceData: (data) => set({ governanceData: data }),
  addChatMessage: (message) => set((state) => ({ 
    chatMessages: [...state.chatMessages, message] 
  })),
  clearChatMessages: () => set({ chatMessages: [] }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}))

export const useChatStore = create<ChatStore>((set) => ({
  chatMessages: [],
  walletContext: null,
  governanceContext: null,
  addMessage: (message) => 
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setWalletContext: (context) => set({ walletContext: context }),
  setGovernanceContext: (context) => set({ governanceContext: context }),
  clearChat: () => set({ chatMessages: [], walletContext: null, governanceContext: null }),
}))
