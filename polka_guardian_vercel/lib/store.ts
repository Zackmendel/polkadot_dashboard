import { create } from 'zustand'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
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

export interface ChatSession {
  messages: ChatMessage[]
  threadId: string | null
  createdAt: number
}

const createEmptyChat = (): ChatSession => ({
  messages: [],
  threadId: null,
  createdAt: Date.now(),
})

const withTimestamp = (message: ChatMessage): ChatMessage => ({
  ...message,
  timestamp: message.timestamp ?? new Date().toISOString(),
})

interface AppState {
  walletAddress: string
  selectedChain: string
  currentView: 'ecosystem' | 'wallet' | 'governance'
  walletData: WalletData | null
  governanceData: {
    voters?: any[]
    proposals?: any[]
  }
  isLoading: boolean

  setWalletAddress: (address: string) => void
  setSelectedChain: (chain: string) => void
  setCurrentView: (view: 'ecosystem' | 'wallet' | 'governance') => void
  setWalletData: (data: WalletData) => void
  setGovernanceData: (data: any) => void
  setIsLoading: (loading: boolean) => void
}

interface ChatStore {
  walletChat: ChatSession
  walletContext: WalletContext | null
  governanceChat: ChatSession
  governanceContext: GovernanceContext | null
  currentChatMode: 'wallet' | 'governance'

  addWalletMessage: (message: ChatMessage) => void
  setWalletThreadId: (threadId: string | null) => void
  clearWalletChat: () => void
  setWalletContext: (context: WalletContext | null) => void

  addGovernanceMessage: (message: ChatMessage) => void
  setGovernanceThreadId: (threadId: string | null) => void
  clearGovernanceChat: () => void
  setGovernanceContext: (context: GovernanceContext | null) => void

  setChatMode: (mode: 'wallet' | 'governance') => void
  getCurrentChat: () => ChatSession
}

export const useStore = create<AppState>((set) => ({
  walletAddress: '',
  selectedChain: 'Assethub-polkadot',
  currentView: 'ecosystem',
  walletData: null,
  governanceData: {},
  isLoading: false,

  setWalletAddress: (address) => set({ walletAddress: address }),
  setSelectedChain: (chain) => set({ selectedChain: chain }),
  setCurrentView: (view) => set({ currentView: view }),
  setWalletData: (data) => set({ walletData: data }),
  setGovernanceData: (data) => set({ governanceData: data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}))

export const useChatStore = create<ChatStore>((set, get) => ({
  walletChat: createEmptyChat(),
  walletContext: null,
  governanceChat: createEmptyChat(),
  governanceContext: null,
  currentChatMode: 'wallet',

  addWalletMessage: (message) =>
    set((state) => ({
      walletChat: {
        ...state.walletChat,
        messages: [...state.walletChat.messages, withTimestamp(message)],
      },
    })),

  setWalletThreadId: (threadId) =>
    set((state) => ({
      walletChat: {
        ...state.walletChat,
        threadId,
      },
    })),

  clearWalletChat: () =>
    set({
      walletChat: createEmptyChat(),
    }),

  setWalletContext: (context) => set({ walletContext: context }),

  addGovernanceMessage: (message) =>
    set((state) => ({
      governanceChat: {
        ...state.governanceChat,
        messages: [...state.governanceChat.messages, withTimestamp(message)],
      },
    })),

  setGovernanceThreadId: (threadId) =>
    set((state) => ({
      governanceChat: {
        ...state.governanceChat,
        threadId,
      },
    })),

  clearGovernanceChat: () =>
    set({
      governanceChat: createEmptyChat(),
    }),

  setGovernanceContext: (context) => set({ governanceContext: context }),

  setChatMode: (mode) => set({ currentChatMode: mode }),

  getCurrentChat: () => {
    const state = get()
    return state.currentChatMode === 'wallet'
      ? state.walletChat
      : state.governanceChat
  },
}))
