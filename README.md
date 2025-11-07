# Polka Guardian - Governance & Wallet Analytics for Polkadot

> A beautiful, intuitive web application for monitoring Polkadot/Kusama wallet activity and exploring governance data with AI-powered insights.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Polkadot](https://img.shields.io/badge/Polkadot-E6007A?logo=polkadot)](https://polkadot.network/)

## 🎯 Project Overview

**Polka Guardian** brings Web2-style analytics and user experience to Polkadot governance. Built for the Polkadot Hackathon under the **"User-centric Apps"** theme, it prioritizes user interests through:

- **Intuitive Wallet Tracking**: Real-time balance, transfer, and staking monitoring
- **Governance Transparency**: Search voters, explore proposals, understand voting patterns  
- **AI-Powered Insights**: Chat with AI about your wallet activity and governance questions
- **Beautiful Design**: Modern UI with Polkadot brand colors and smooth interactions

## 🌟 Features

### 💼 Wallet Analytics
- **Account Overview**: Balance, transferable, locked, and reserved funds
- **Transfer History**: Track all incoming and outgoing transfers
- **Extrinsics**: Monitor on-chain activity and transactions
- **Staking Details**: Controller, reward account, delegation information
- **Multi-Chain**: Support for Polkadot and Kusama networks

### 🗳️ Governance Monitor
- **Voter Lookup**: Search any wallet address to see voting history
- **Voting Statistics**: Total votes, tokens, support ratio, delegation info
- **Vote Distribution**: Visual breakdown of Aye/Nay/Abstain patterns
- **Proposal Explorer**: Browse and search all referenda
- **AI Analysis**: Automatic summaries of proposal details and implications

### 🤖 AI Assistant (Hybrid System)
- **Wallet Queries**: Fast responses about your balance, transfers, staking
- **Governance Queries**: Powerful retrieval through governance datasets
- **Persistent Threads**: Conversation context maintained across messages
- **Smart Routing**: Automatically suggests relevant assistant mode

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: shadcn/ui
- **State**: Zustand
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: CSV files (governance data)
- **External APIs**: 
  - Subscan API (wallet data)
  - OpenAI API (AI assistant & summarization)

### DevOps
- **Deployment**: Vercel
- **Package Manager**: npm
- **Version Control**: Git

## 📊 Data Sources & Attribution

### Wallet Data
- **Source**: [Subscan API](https://www.subscan.io/)
- **Credit**: Data is fetched via Subscan's public API
- **Data Includes**: Balances, transfers, extrinsics, staking information for Polkadot and Kusama chains
- **License**: Public blockchain data accessed through Subscan's service

### Governance Data  
- **Source**: [Dune Analytics](https://dune.com/substrate) & Substrate Governance Data
- **Credit**: Governance metrics, voter data, and proposal information sourced from Polkadot's on-chain governance data
- **Data Format**: CSV exports containing voters, proposals, and ecosystem metrics
- **Attribution**: Data compiled from public blockchain governance records

### AI & Analytics
- **Source**: [OpenAI](https://openai.com/)
- **Usage**: GPT-4 Turbo for chat and GPT-4 Turbo with file search for governance analysis
- **Purpose**: AI-powered insights, proposal summaries, and Q&A

**Important**: All data displayed in Polka Guardian is public blockchain data accessed through legitimate APIs and data platforms. We properly attribute all data sources and comply with their terms of service.

## 🚀 Getting Started

### Choose Your Version

#### Option 1: Modern Web App (Recommended)

**Best for**: Production deployment, modern UI, full feature set

```bash
cd polka_guardian_vercel
npm install
npm run setup-assistant
npm run dev
```
→ Visit http://localhost:3000

**Features**: Beautiful UI, Vercel deployment, Hybrid AI system, Real-time data

➡️ **[View detailed setup guide](./polka_guardian_vercel/SETUP.md)**

#### Option 2: Python Streamlit App

**Best for**: Quick local development, data science workflows

```bash
cd streamlit_polkaguardian
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run dashboard.py
```
→ Visit http://localhost:8501

**Features**: Quick setup, Data visualization focus, Python ecosystem

➡️ **[View detailed setup guide](./streamlit_polkaguardian/SETUP.md)**

## 📋 Prerequisites

### For Next.js App
- Node.js 18+ 
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- (Optional) Subscan API key

### For Streamlit App
- Python 3.10+
- pip
- OpenAI API key
- Subscan API key

## 🔑 Environment Variables

### Next.js App (.env.local)
```env
OPENAI_API_KEY=sk_...
OPENAI_ASSISTANT_ID=asst_...  # Set by setup-assistant script
SUBSCAN_API_KEY=your_key      # Optional
```

### Streamlit App (.env)
```env
OPENAI_API_KEY=sk_...
SUBSCAN_API_KEY=your_key
```

See `.env.example` in each app folder for complete templates.

## 🎨 Design Highlights

- **Polkadot Brand Colors**: Primary Pink (#E6007A) and Polkadot Pink (#FF2670)
- **Dark Theme**: Professional dark mode with pink accents
- **Glass Morphism**: Modern card designs with subtle depth
- **Responsive**: Works beautifully on desktop, tablet, and mobile
- **Smooth Animations**: Polished interactions and transitions

## 🤖 AI Assistant System

Polka Guardian uses a **hybrid AI approach** for optimal performance:

### Wallet Assistant
- Pre-cleaned wallet data passed directly to GPT-4 Turbo
- Fast, cost-effective responses (~$0.0001 per query)
- Instant answers about your wallet

### Governance Assistant  
- OpenAI Assistants API with file search
- Searches through voter and proposal CSV datasets
- Maintains conversation threads
- Provides contextual insights (~$0.01-0.05 per query)

This hybrid approach ensures **speed** for wallet queries and **power** for governance analysis.

## 📈 API Rate Limiting

The app respects Subscan's rate limit of **5 API calls per second** with intelligent queuing and 2-second delays between batches.

## 🔍 How to Use

### Wallet Analytics
1. Enter a Polkadot/Kusama wallet address
2. Select the chain (Polkadot or Kusama)
3. View instant analytics: balance, transfers, staking, voting history
4. Ask the AI chatbot about your wallet

### Governance Lookup
1. Navigate to Governance Monitor
2. Enter a wallet address to search voters
3. View voting history, patterns, and statistics
4. Explore recent proposals
5. Select a proposal to see AI-generated analysis

### AI Chat
- **Wallet Questions**: "What's my balance?", "Show recent transfers"
- **Governance Questions**: "Who are the top voters?", "Summarize proposal 123"
- **Smart Mode Selection**: App automatically detects which assistant to use

## 📊 Viewing Data

All data is displayed in modern, interactive formats:
- **Tables**: Pagination, sorting, filtering (configurable items per page)
- **Charts**: Interactive visualizations with Polkadot pink color scheme
- **Cards**: Clean metric displays with visual hierarchy
- **Profiles**: Detailed voter cards with voting statistics

## 🏗️ Project Structure

```
polkadot_dashboard/
├── polka_guardian_vercel/        # Next.js web app (recommended)
│   ├── app/                      # Next.js 14 App Router
│   │   ├── api/                  # API routes
│   │   ├── globals.css           # Global styles
│   │   └── page.tsx              # Home page
│   ├── components/               # React components
│   │   ├── chat/                 # Chat components
│   │   ├── charts/               # Chart components
│   │   ├── governance/           # Governance features
│   │   ├── ui/                   # Reusable UI components
│   │   └── wallet/               # Wallet features
│   ├── lib/                      # Utilities and store
│   ├── public/                   # Static assets
│   │   └── data/                 # Governance CSV files
│   ├── scripts/                  # Setup scripts
│   ├── SETUP.md                  # Detailed setup guide
│   └── package.json              # Dependencies
│
├── streamlit_polkaguardian/      # Python Streamlit app
│   ├── dashboard.py              # Main app
│   ├── subscan.py                # Subscan API client
│   ├── chart_components.py       # Chart utilities
│   ├── governace_app/            # Governance module
│   ├── SETUP.md                  # Setup guide
│   └── requirements.txt          # Python dependencies
│
└── README.md                     # This file
```

## 🔗 Links & Resources

- **[Polkadot](https://polkadot.network/)** - Main network
- **[Kusama](https://kusama.network/)** - Canary network
- **[Subscan API](https://www.subscan.io/)** - Block explorer & API
- **[Substrate Dune Analytics](https://dune.com/substrate)** - Data analytics platform
- **[Polkassembly](https://polkassembly.io/)** - Governance platform
- **[OpenAI Platform](https://platform.openai.com/)** - AI API

## 🚢 Deployment

### Deploy Next.js App to Vercel

**One-click deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Manual deployment:**

1. Push code to GitHub
2. Create Vercel project
3. Connect your repository
4. Add environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_ASSISTANT_ID` (from setup script)
5. Deploy

**CLI deployment:**
```bash
npm run build
vercel deploy
```

### Run Streamlit App Locally

```bash
cd streamlit_polkaguardian
source .venv/bin/activate
streamlit run dashboard.py
```

For production Streamlit deployment, see [Streamlit Cloud](https://streamlit.io/cloud).

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

**Guidelines:**
- Follow existing code style and conventions
- Use Polkadot pink colors for new UI elements
- Add proper error handling
- Include comments for complex logic
- Test your changes thoroughly

## 📞 Support

For questions or issues:
1. Check the [setup guides](./polka_guardian_vercel/SETUP.md)
2. Review the [API documentation](./polka_guardian_vercel/API_DOCUMENTATION.md)
3. Check existing GitHub issues
4. Open a new issue with detailed information

## 🎯 Hackathon Submission

**Theme**: User-centric Apps   
**Focus**: Bringing Web2 UX to Web3 governance

This project demonstrates how Web2 user experience principles can enhance Web3 applications, specifically in the Polkadot ecosystem. We prioritize:

- **Intuitive Design**: Clean, familiar interface that doesn't require blockchain expertise
- **Real-time Data**: Instant access to on-chain information
- **AI Integration**: Natural language interaction with complex blockchain data
- **Comprehensive Analytics**: All the data users need in one place
- **Beautiful UI**: Professional design with Polkadot branding

## 🎉 Key Achievements

- ✅ **Full-Stack Application**: Modern Next.js frontend + API backend
- ✅ **Dual Implementation**: Both Next.js and Streamlit versions
- ✅ **AI Integration**: Hybrid chat system with file search
- ✅ **Real-time Data**: Live blockchain data via Subscan
- ✅ **Beautiful UI**: Polkadot brand colors and modern design
- ✅ **Comprehensive Docs**: Setup guides, API docs, and README
- ✅ **Production Ready**: Deployable to Vercel with one click

## 📈 Future Enhancements

Potential future features:
- Multi-wallet tracking dashboard
- Push notifications for governance events
- Historical voting analysis and trends
- Wallet comparison tools
- Mobile app (React Native)
- Browser extension
- Custom alerts and reminders

## 🙏 Acknowledgments

Built with ❤️ for the Polkadot community.

Special thanks to:
- **Polkadot/Web3 Foundation** - For the amazing blockchain ecosystem
- **Subscan** - For comprehensive block explorer API
- **Substrate's Dune Analytics Data** - For governance data analytics
- **OpenAI** - For powerful AI capabilities
- **Vercel** - For seamless deployment platform

## 📸 Screenshots

### Dashboard Overview
Beautiful, modern interface with Polkadot pink theme and smooth animations.

### Wallet Analytics
Comprehensive view of balances, transfers, and staking information.

### Governance Monitor  
Search voters, explore proposals, and get AI-powered insights.

### AI Assistant
Hybrid chat system for wallet and governance queries.

---

**Built with ❤️ for the Polkadot Hackathon**

**Live Demo**: [Coming Soon]  
**Documentation**: See setup guides in each app folder  
**Support**: Open an issue on GitHub

🚀 **Ready to explore Polkadot governance like never before!**
