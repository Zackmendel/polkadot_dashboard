# Polka Guardian - Next.js Web App

A beautiful, modern Next.js web application for Polkadot & Substrate ecosystem analytics. Features wallet tracking, governance monitoring, and AI-powered insights.

![Polka Guardian](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-Ready-black?style=for-the-badge&logo=vercel)

## 🌟 Features

### 🌍 Ecosystem Overview
- **Ecosystem Basic Metrics**: Daily transfers, active accounts, events, and extrinsics across multiple chains
- **Treasury Flow Visualization**: Interactive charts showing treasury inflows and outflows
- **Chain Selector**: Filter metrics by specific Polkadot parachain

### 💼 Wallet Activity Tracker
- **Account Overview**: Balance, reserved, and locked amounts
- **Transfer History**: Complete transaction history with timestamps
- **Extrinsics**: All on-chain actions performed by the wallet
- **Staking Activity**: Rewards, slashes, and staking history
- **Governance Votes**: Referendum participation and voting records

### 🗳️ Governance Monitor
- **Voter Lookup**: Search any wallet address to view detailed governance participation
  - Voter profile with identity and status
  - Voting statistics (total votes, tokens, support ratio)
  - Vote distribution visualization (Aye/Nay/Abstain)
  - Participation insights and voting patterns
- **Monthly Voters & Voting Power**: Track voter participation trends (Delegated vs Direct)
- **Referenda Outcomes**: Visual breakdown of proposal results
- **Recent Proposals**: Searchable list of recent governance proposals with status
- **Proposal Details**: Select and explore individual proposals
  - Full proposal metadata and status
  - External links (Dune Analytics, Polkassembly)
  - AI-powered proposal summaries

### 🤖 AI Chatbot Assistant
- **Context-Aware**: Switches between wallet and governance analysis modes
- **Right Sidebar Design**: Always accessible, non-intrusive placement
- **Powered by OpenAI GPT-4**: Intelligent insights and explanations
- **Scrollable History**: Full chat history with timestamps
- **Enter Key Support**: Quick message sending

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Glass Morphism
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **API Client**: Axios
- **State Management**: Zustand
- **AI**: OpenAI SDK (GPT-4)
- **Deployment**: Vercel-ready

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key
- Subscan API key (optional, but recommended)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   SUBSCAN_API_KEY=your_subscan_api_key_here
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Add `OPENAI_API_KEY` and `SUBSCAN_API_KEY`
   - Redeploy if necessary

### Environment Variables on Vercel

In your Vercel project dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add the following:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SUBSCAN_API_KEY`: Your Subscan API key

## 🏗️ Project Structure

```
polka_guardian_vercel/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── subscan/route.ts      # Subscan API proxy
│   │   ├── governance/route.ts   # Governance data endpoint
│   │   └── chat/route.ts         # OpenAI chat endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── tabs.tsx
│   ├── charts/                   # Chart components
│   │   ├── EcosystemMetrics.tsx
│   │   └── TreasuryFlow.tsx
│   ├── chat/                     # Chat components
│   │   └── ChatSidebar.tsx
│   ├── wallet/                   # Wallet components
│   │   ├── WalletInput.tsx
│   │   └── WalletActivity.tsx
│   └── governance/               # Governance components
│       ├── VoterLookup.tsx
│       ├── ProposalDetails.tsx
│       ├── MonthlyVotersChart.tsx
│       └── ProposalsList.tsx
├── lib/
│   ├── subscan.ts                # Subscan API client
│   ├── store.ts                  # Zustand state management
│   └── utils.ts                  # Utility functions
├── public/
│   └── data/                     # Governance CSV files
│       ├── polkadot_voters.csv
│       ├── proposals.csv
│       ├── monthly_voters_voting_power_by_type.csv
│       ├── polkadot_ecosystem_metrics_raw_data.csv
│       ├── polkadot_treasury_flow.csv
│       └── polkadot_number_of_referenda_by_outcome_opengov.csv
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json                   # Vercel deployment config
```

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Deep blue/purple gradients (#667eea, #764ba2)
- **Dark Theme**: Default with optional light mode
- **Glass Morphism**: Translucent cards with backdrop blur
- **Typography**: Inter font family with proper hierarchy
- **Animations**: Smooth transitions and hover effects

### Layout
- **Desktop**: 70/30 split (main content / chat sidebar)
- **Tablet**: Responsive grid with collapsible sections
- **Mobile**: Full-width stacked layout

### Key Components
- **Metric Cards**: Hover animations with gradient borders
- **Charts**: Interactive with tooltips and legends
- **Tables**: Sortable, filterable data displays
- **Chat**: Right sidebar with auto-scroll

## 🔧 API Routes

### `/api/subscan` (POST)
Fetches comprehensive wallet data from Subscan API.

**Request:**
```json
{
  "chainKey": "polkadot",
  "address": "15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountData": {...},
    "tokenMetadata": {...},
    "transfers": [...],
    "extrinsics": [...],
    "staking": [...],
    "votes": [...]
  }
}
```

### `/api/governance` (GET)
Serves governance data from CSV files.

**Query Parameters:**
- `type`: `voters` | `proposals` | `monthly_voters` | `ecosystem_metrics` | `treasury_flow` | `referenda_outcomes`

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### `/api/chat` (POST)
OpenAI chat endpoint for AI assistant.

**Request:**
```json
{
  "messages": [{"role": "user", "content": "..."}],
  "context": "...",
  "contextType": "wallet" | "governance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI response..."
}
```

## 🔐 Security

- API keys stored in environment variables
- No sensitive data in client-side code
- Server-side API proxying for Subscan calls
- Rate limiting on OpenAI calls

## 📊 Supported Chains

- Polkadot
- Kusama
- Acala
- Astar
- Moonbeam
- Phala
- Bifrost
- Centrifuge
- Parallel
- HydraDX
- Litentry
- Crust
- Darwinia
- Edgeware
- Karura
- Statemine
- Statemint
- Ternoa
- Unique
- Zeitgeist

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Subscan API**: Blockchain data provider
- **OpenAI**: AI-powered insights
- **Polkadot**: Blockchain ecosystem
- **Vercel**: Hosting and deployment
- **shadcn/ui**: Beautiful UI components

## 📚 Documentation

### Governance Features
- **[Governance Features Documentation](GOVERNANCE_FEATURES.md)** - Complete feature guide
- **[Voter Lookup Testing Guide](VOTER_LOOKUP_TESTING.md)** - Comprehensive testing checklist
- **[Quick Start: Governance](QUICK_START_GOVERNANCE.md)** - Get started quickly
- **[Implementation Summary](../GOVERNANCE_IMPLEMENTATION_SUMMARY.md)** - Technical details

### Other Documentation
- **[API Documentation](API_DOCUMENTATION.md)** - API endpoints and usage
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment steps
- **[Testing Guide](TESTING_GUIDE.md)** - Testing procedures
- **[Quick Start](QUICKSTART.md)** - General quick start guide

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for the Polkadot community**
