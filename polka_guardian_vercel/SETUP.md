# Polka Guardian Next.js App - Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- OpenAI API key

### Installation

1. **Navigate to the directory**
   ```bash
   cd polka_guardian_vercel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your OPENAI_API_KEY
   ```

4. **Setup Governance Assistant**
   ```bash
   npm run setup-assistant
   # This uploads CSV files and creates the OpenAI Assistant
   # The script will automatically update .env.local with OPENAI_ASSISTANT_ID
   ```

5. **Verify Assistant Setup (Optional)**
   ```bash
   npm run verify-assistant
   # Checks that the assistant has proper file access
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Deployment to Vercel

### Option 1: Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables in project settings:
   - `OPENAI_API_KEY`
   - `OPENAI_ASSISTANT_ID` (from setup script)
6. Deploy

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts to deploy.

### Environment Variables for Production

In your Vercel project settings, add:
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_ASSISTANT_ID` - Assistant ID from setup script
- `SUBSCAN_API_KEY` - (Optional) For better Subscan rate limits

## Features

### 🎨 Beautiful UI
- Modern design with Polkadot brand colors (Pink #E6007A, #FF2670)
- Dark theme with glass-morphism effects
- Responsive layout for desktop, tablet, and mobile

### 💼 Wallet Analytics
- Real-time balance tracking (total, transferable, locked, reserved)
- Transfer history with pagination
- Extrinsics monitoring
- Staking details
- Multi-chain support (Polkadot, Kusama)

### 🗳️ Governance Monitor
- Voter lookup by address
- Comprehensive voting statistics
- Vote distribution visualizations
- Recent proposals browser with filtering
- AI-powered proposal summaries

### 🤖 Hybrid AI Chat
- **Wallet Assistant**: Fast responses about your wallet data using GPT-4 Turbo
- **Governance Assistant**: Powerful file search through governance datasets
- **Smart Routing**: Automatic mode detection based on query context
- **Persistent Threads**: Maintains conversation history

## Data Sources

- **Wallet Data**: [Subscan API](https://www.subscan.io/) - Real-time on-chain data
- **Governance Data**: [Dune Analytics](https://dune.com/substrate) - Governance analytics

All data is properly attributed and sourced from public blockchain data.

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup-assistant` - Setup OpenAI Governance Assistant
- `npm run verify-assistant` - Verify assistant configuration

## Environment Variables

### Required
- `OPENAI_API_KEY` - Your OpenAI API key (get from https://platform.openai.com/api-keys)

### Set by setup-assistant script
- `OPENAI_ASSISTANT_ID` - ID of the governance assistant

### Optional
- `SUBSCAN_API_KEY` - Subscan API key for better rate limits
- `NODE_ENV` - Environment mode (development/production)

## Project Structure

```
polka_guardian_vercel/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── chat/                 # Chat API
│   │   │   ├── route.ts          # Wallet chat (GPT-4)
│   │   │   └── assistant/        # Governance assistant
│   │   ├── governance/           # Governance data APIs
│   │   └── subscan/              # Subscan API proxy
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── chat/                     # Chat components
│   ├── charts/                   # Chart components
│   ├── governance/               # Governance features
│   ├── ui/                       # Reusable UI components
│   └── wallet/                   # Wallet features
├── lib/                          # Utilities
│   ├── store.ts                  # Zustand store
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
│   └── data/                     # Governance CSV files
└── scripts/                      # Setup scripts
    ├── setupAssistant.ts         # Create assistant
    └── verifyAssistant.ts        # Verify setup
```

## Troubleshooting

### Module errors
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`

### Assistant not working
1. Run: `npm run setup-assistant`
2. Verify files uploaded: `npm run verify-assistant`
3. Check `.env.local` has `OPENAI_ASSISTANT_ID`
4. Restart dev server

### API errors
- Check API keys in `.env.local`
- Verify OpenAI API key has credits
- Check browser console for detailed errors

### Vercel deployment issues
- Ensure all environment variables are set in Vercel dashboard
- Check build logs for specific errors
- Verify Node.js version matches (18+)

## OpenAI Assistant Setup Details

The `setup-assistant` script:
1. Uploads governance CSV files from `public/data/` to OpenAI
2. Creates a vector store for efficient file search
3. Creates an assistant with file_search tool enabled
4. Attaches vector store to the assistant
5. Saves assistant ID to `.env.local`

Files uploaded:
- `polkadot_voters.csv` - Voter data and history
- `proposals.csv` - All governance proposals
- `polkadot_ecosystem_metrics_raw_data.csv` - Network statistics
- `monthly_voters_voting_power_by_type.csv` - Monthly voter activity
- `polkadot_treasury_flow.csv` - Treasury funding data
- `polkadot_number_of_referenda_by_outcome_opengov.csv` - Referenda outcomes

The assistant uses GPT-4 Turbo with file_search and vector stores to answer governance questions efficiently.

## Cost Considerations

### Wallet Chat
- Uses GPT-4 Turbo with context
- Cost: ~$0.0001-0.001 per query
- Fast and cost-effective

### Governance Assistant
- Uses GPT-4 Turbo with file search
- Cost: ~$0.01-0.05 per query
- More powerful but more expensive

### Optimization Tips
- Governance data is cached in CSV files (no repeated API calls)
- Wallet data fetched on-demand from Subscan
- Use smart routing to minimize expensive queries

## Features Breakdown

### Dashboard Views

1. **Ecosystem Overview**
   - Basic governance metrics
   - Treasury flow visualization
   - Network statistics

2. **Wallet Activity**
   - Account balance breakdown
   - Transfer history (paginated)
   - Extrinsics history
   - Staking information
   - Quick AI chat for wallet questions

3. **Governance Monitor**
   - Search voters by address
   - View voting patterns and statistics
   - Browse recent proposals
   - AI-powered proposal analysis
   - Monthly voting trends

### UI Components

All components use:
- Polkadot pink color scheme
- Smooth transitions and animations
- Responsive design
- Accessibility features
- Dark mode optimized

## Data Attribution

This application displays data from:
- **[Subscan](https://www.subscan.io/)** - Multi-chain block explorer API
- **[Dune Analytics](https://dune.com/substrate)** - Blockchain analytics platform
- **[OpenAI](https://openai.com/)** - AI-powered analysis

## Support

For issues or questions:
1. Check this setup guide
2. Review the main [README.md](../README.md)
3. Check [API Documentation](./API_DOCUMENTATION.md)
4. Open an issue on GitHub

## Notes

- Rate limiting: Respects Subscan's 5 req/sec limit
- File uploads: One-time setup via `setup-assistant`
- Vector stores: Persist in OpenAI account
- Thread management: Automatic cleanup after 24h of inactivity

## Next Steps

After setup:
1. Test wallet lookup with a Polkadot address
2. Try governance voter search
3. Ask the AI about proposals
4. Explore the different dashboard views
5. Deploy to Vercel for public access

Enjoy using Polka Guardian! 🚀
