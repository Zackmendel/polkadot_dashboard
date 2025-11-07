# Polka Guardian Streamlit App - Setup Guide

## Quick Start

### Prerequisites
- Python 3.10+
- pip package manager

### Installation

1. **Navigate to the directory**
   ```bash
   cd streamlit_polkaguardian
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys:
   # - OPENAI_API_KEY (from OpenAI)
   # - SUBSCAN_API_KEY (from Subscan, optional)
   ```

5. **Run the app**
   ```bash
   streamlit run dashboard.py
   ```

The app will be available at `http://localhost:8501`

## Features

- **Wallet Analytics**: Track balances, transfers, staking on Polkadot/Kusama
- **Governance Monitor**: Search voters, explore proposals, analyze trends
- **AI Assistant**: Chat with AI for insights on your wallet and governance data

## Data Sources

- **Wallet Data**: [Subscan API](https://www.subscan.io/)
- **Governance Data**: [Dune Analytics](https://dune.com/substrate) & Substrate governance data

All governance data is properly attributed and sourced from public blockchain data.

## Environment Variables

See `.env.example` for all required variables:

- `OPENAI_API_KEY` - Required for AI assistant features
- `SUBSCAN_API_KEY` - Optional, improves rate limits for Subscan API calls
- `DEBUG` - Set to True for verbose logging

## Troubleshooting

### API Errors
- Verify your API keys are valid and have proper permissions
- Check that OpenAI API key has sufficient credits

### Module errors
- Ensure Python 3.10+ is installed: `python --version`
- Reinstall dependencies: `pip install -r requirements.txt --upgrade`

### Port in use
- Change port with: `streamlit run dashboard.py --server.port 8502`

### Streamlit errors
- Clear cache: Delete `.streamlit` folder in your home directory
- Update Streamlit: `pip install streamlit --upgrade`

## Key Components

- `dashboard.py` - Main application with multi-page interface
- `subscan.py` - Utility functions for Subscan API calls
- `chart_components.py` - Reusable chart rendering functions
- `governace_app/data/` - CSV files containing governance data

## Features Breakdown

### Ecosystem Overview
- Basic metrics visualization
- Treasury flow charts
- Network-wide statistics

### Wallet Activity
- Balance overview (total, transferable, locked, reserved)
- Transfer history with pagination
- Extrinsics (transaction) history
- Staking information
- AI chat assistant for wallet queries

### Governance Monitor
- Voter lookup by address
- Voting statistics and patterns
- Recent proposals browser
- Monthly voter activity charts
- AI assistant for governance questions

## Data Attribution

This application uses data from:
- **Subscan**: Block explorer API for Polkadot and Kusama
- **Dune Analytics**: On-chain governance data analytics
- **OpenAI**: AI-powered insights and analysis

## Notes

- The app respects Subscan's rate limit of 5 API calls per second
- Governance data is cached locally in CSV files for performance
- AI features require an active OpenAI API key

## Support

For issues or questions:
1. Check this setup guide
2. Review the main README.md in the project root
3. Open an issue on GitHub
