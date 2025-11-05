# Hybrid AI Chatbot System Setup

This document explains how to set up and use the hybrid AI chatbot system for Polkadot analytics.

## Overview

The hybrid system uses two different approaches:

1. **Pre-cleaned Data for Wallet Queries** - Fast, efficient responses using processed wallet data
2. **OpenAI Assistants API for Governance Queries** - Powerful, searchable governance data analysis

## Phase 1: Environment Setup

### 1.1 Install Dependencies

```bash
npm install
```

### 1.2 Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Add your API keys to `.env.local`:

```env
# Required for all AI features
OPENAI_API_KEY=your_openai_api_key_here

# Required for wallet data
SUBSCAN_API_KEY=your_subscan_api_key_here
```

## Phase 2: Setup OpenAI Assistant for Governance

### 2.1 Run Setup Script

```bash
npm run setup-assistant
```

This script will:
- Upload governance CSV files to OpenAI
- Create an Assistant with retrieval capabilities
- Update your `.env.local` file with the required IDs

### 2.2 Verify Environment Variables

After running the setup script, your `.env.local` should include:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ASSISTANT_ID=asst_xxxxxxxxxxxxxxxxxxxxxxx
OPENAI_VOTERS_FILE_ID=file_xxxxxxxxxxxxxxxxxxxxxxx
OPENAI_PROPOSALS_FILE_ID=file_xxxxxxxxxxxxxxxxxxxxxxx
OPENAI_ECOSYSTEM_METRICS_FILE_ID=file_xxxxxxxxxxxxxxxxxxxxxxx
SUBSCAN_API_KEY=your_subscan_api_key_here
```

## Phase 3: Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the hybrid AI system in action.

## How It Works

### Wallet Queries (Fast & Efficient)

When you're in the Wallet view:
- Wallet data is processed and summarized in the frontend
- Clean context is passed directly to the chat API
- Uses standard OpenAI chat completions (gpt-4o-mini)
- Responses are fast and cost-effective

**Example Wallet Questions:**
- "What's my current balance?"
- "How many transfers did I make recently?"
- "Tell me about my staking status"
- "What are my recent transactions?"

### Governance Queries (Powerful & Comprehensive)

When you're in the Governance view:
- Uses OpenAI Assistants API with file search
- Has access to all governance CSV files
- Can search through millions of records
- Uses retrieval-augmented generation

**Example Governance Questions:**
- "What are the recent proposals?"
- "Who are the top voters by voting power?"
- "Show me voting trends over time"
- "Summarize proposal #1234"

## Features

### Smart Chat Interface

The chat sidebar includes:
- **Mode Selector**: Switch between Wallet and Governance modes
- **Context Detection**: Automatically suggests appropriate mode based on keywords
- **Persistent History**: Chat history is maintained per session
- **Error Handling**: Graceful fallbacks for API failures

### Proposal Summarization

Each proposal detail page includes:
- AI-powered summary generation
- Uses governance assistant for accurate insights
- Cites specific data from the files
- Regenerate option for different perspectives

### Context-Aware Responses

- **Wallet Mode**: Knows your address, balance, recent activity
- **Governance Mode**: Has access to voters, proposals, ecosystem metrics
- **Smart Routing**: Routes questions to the appropriate AI system

## Testing

### Test Wallet Context

1. Enter a wallet address (e.g., `15hGWKqpDz2cGpLqZ5Lpz8LdJQaGgHZh8pD1gY2G2C2r`)
2. Click "Fetch Account Data"
3. Switch to Wallet view
4. Ask: "What's my balance and recent activity?"

### Test Governance Assistant

1. Switch to Governance view
2. Click the 🏛️ Governance button in the chat
3. Ask: "What are the most recent proposals?"
4. Try: "Who are the top voters by voting power?"

### Test Proposal Summary

1. Go to Governance view
2. Select any proposal from the dropdown
3. Click "Generate Summary" in the AI Summary section
4. Verify the summary is accurate and cites specific data

## Cost Management

- **Wallet Queries**: ~$0.0001 per query (gpt-4o-mini)
- **Governance Queries**: ~$0.01-0.05 per query (gpt-4-turbo with retrieval)
- **File Storage**: ~$0.20 per GB per month for uploaded files

## Troubleshooting

### Assistant Setup Fails

```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# Verify data files exist
ls -la public/data/*.csv

# Run setup with debug
DEBUG=* npm run setup-assistant
```

### Chat Not Working

1. Check browser console for errors
2. Verify API keys in `.env.local`
3. Check network tab for failed requests
4. Ensure assistant setup completed successfully

### Slow Governance Responses

- Normal behavior: 2-5 seconds for file search
- If slower, check OpenAI API rate limits
- Consider reducing context size for faster responses

## File Structure

```
components/
├── chat/
│   ├── ChatSidebar.tsx      # Original chat (legacy)
│   └── SmartChat.tsx        # New hybrid chat interface
├── governance/
│   ├── GovernanceChat.tsx    # Dedicated governance chat
│   └── ProposalSummary.tsx   # AI-powered proposal summaries
└── wallet/
    └── WalletActivity.tsx    # Sets wallet context for chat

app/api/chat/
├── route.ts                 # Updated to handle wallet context
└── assistant/
    └── route.ts             # New OpenAI Assistants API route

scripts/
└── setupAssistant.ts        # Assistant setup script
```

## Next Steps

1. **Production Deployment**: Set up production environment variables
2. **Monitoring**: Add logging for API usage and costs
3. **Optimization**: Cache frequently accessed governance data
4. **Enhancements**: Add more specialized assistants for different data types

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure the assistant setup completed successfully
4. Review OpenAI API usage and rate limits