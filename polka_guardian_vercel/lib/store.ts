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
