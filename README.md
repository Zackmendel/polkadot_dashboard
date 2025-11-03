# Polkadot Analytics Dashboard

A comprehensive multi-chain account and governance analytics platform for the Polkadot ecosystem.

---

## 📦 Available Versions

This repository contains **two versions** of Polka Guardian:

### 🐍 **Version 1: Streamlit Application** (This README)
- **Location:** Root directory
- **Tech:** Python + Streamlit
- **Best For:** Quick prototyping, internal tools
- **Status:** ✅ Fully functional

### ⚛️ **Version 2: Next.js Web Application** (NEW!)
- **Location:** [`polka_guardian_vercel/`](./polka_guardian_vercel/)
- **Tech:** Next.js + TypeScript + Tailwind CSS
- **Best For:** Production deployments, public-facing apps
- **Status:** ✅ Production-ready
- **Documentation:** See [`polka_guardian_vercel/README.md`](./polka_guardian_vercel/README.md)

**📖 Compare Versions:** See [POLKA_GUARDIAN_VERSIONS.md](./POLKA_GUARDIAN_VERSIONS.md)

---

## Streamlit Version (Below)

## Features

### 🌍 Ecosystem Overview
- **Ecosystem Basic Metrics**: Daily transfers, active accounts, events, and extrinsics across chains
- **Treasury Flow**: Polkadot treasury inflow/outflow visualization with stacked columns and net flow
- View network-wide governance and ecosystem statistics

### 💼 Wallet Activity
- Multi-chain support (Polkadot, Kusama, Acala, Astar, Moonbeam, and more)
- Account balance and financial metrics
- Transfer history (sent, received, all)
- Extrinsics and transaction history
- Staking rewards and delegation info
- Democracy participation and referenda votes
- Comprehensive wallet analytics

### 🏛️ Governance Monitor
- **Monthly Voters & Voting Power**: Track delegated vs direct voting patterns over time
- **Referenda Outcomes**: Pie chart visualization of proposal statuses
- **Voter Lookup**: Detailed governance participation analysis
  - Voting statistics and patterns
  - Vote distribution (Aye/Nay/Abstain)
  - Support ratio and participation insights
- **Recent Proposals**: Browse and analyze governance proposals
- **AI-Powered Analysis**: Generate comprehensive proposal summaries and recommendations

### 💬 AI Assistant
- Context-aware AI chat powered by OpenAI
- Wallet-focused insights for account analytics
- Governance-focused insights for proposal analysis
- Real-time data interpretation and recommendations

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Create and activate a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure API keys:
Create a `.streamlit/secrets.toml` file:
```toml
SUBSCAN_API_KEY = "your-subscan-api-key"
OPENAI_API_KEY = "your-openai-api-key"  # Optional, for AI features
```

## Usage

Run the dashboard:
```bash
streamlit run dashboard.py
```

The dashboard will open in your browser at `http://localhost:8501`.

## Navigation Flow

### Initial Load
1. Dashboard opens to **Ecosystem Overview** by default
2. View ecosystem-wide metrics and treasury flow
3. Enter a wallet address to explore specific account data

### After Wallet Entry
1. Enter wallet address and select network
2. Click "Fetch Account Data" button
3. Both wallet activity AND governance data load automatically
4. Navigate between three views:
   - **Ecosystem Overview**: Network-wide statistics
   - **Wallet Activity**: Your account analytics
   - **Governance Monitor**: Governance participation and proposals

### View Switching
- Use radio buttons to switch between views
- All data persists in session state
- No need to re-enter wallet address when switching views

## Data Sources

- **Wallet Data**: Subscan API (multi-chain support)
- **Governance Data**: CSV files in `governace_app/data/`
  - `polkadot_voters.csv`: Voter participation records
  - `proposals.csv`: Governance proposals
  - `monthly_voters_voting_power_by_type.csv`: Monthly voting trends
  - `polkadot_ecosystem_metrics_raw_data.csv`: Ecosystem metrics
  - `polkadot_treasury_flow.csv`: Treasury flow data

## Project Structure

```
.
├── dashboard.py                    # Main Streamlit application
├── chart_components.py             # Reusable chart rendering functions
├── subscan.py                      # Subscan API utilities
├── governace_app/
│   ├── data/                       # Governance and ecosystem CSV data
│   └── charts.py                   # Standalone charts (legacy)
├── requirements.txt                # Python dependencies
├── .streamlit/
│   └── secrets.toml                # API keys (not in git)
└── README.md                       # This file
```

## Key Components

### `dashboard.py`
- Main application with three-view layout
- Wallet input and data fetching
- Session state management
- AI chat sidebar

### `chart_components.py`
- `render_monthly_voters_voting_power()`: Monthly voting trends
- `render_ecosystem_basic_metrics()`: Ecosystem statistics
- `render_treasury_flow()`: Treasury flow visualization

### `subscan.py`
- API wrappers for Subscan endpoints
- Data fetching and processing utilities
- Multi-chain support

## Session State

The dashboard uses Streamlit session state to persist:
- `wallet_address`: Currently loaded wallet
- `selected_chain`: Selected blockchain network
- `current_view`: Active view (Ecosystem/Wallet/Governance)
- `data_section`: Wallet account data
- `governance_voters`: Governance voter data
- `governance_proposals`: Proposal data
- `chat_messages`: AI chat history
- Various DataFrames for transfers, extrinsics, staking, votes

## Styling

The dashboard features a professional dark theme with:
- Gradient color schemes (blues/purples)
- Custom CSS for metrics, cards, and containers
- Inter font family for typography
- Smooth transitions and hover effects
- Responsive layout

## Requirements

- Python 3.8+
- streamlit
- pandas
- plotly
- openai
- requests

See `requirements.txt` for full dependency list.

## API Keys

### Subscan API Key (Required)
Get your API key from [Subscan.io](https://support.subscan.io/#introduction)

### OpenAI API Key (Optional)
Required only for AI assistant features. Get from [OpenAI Platform](https://platform.openai.com/)

## Contributing

This dashboard integrates governance charts directly into the main flow for a seamless user experience. When adding new features:

1. Use session state for data persistence
2. Follow existing UI/UX patterns and styling
3. Add error handling with try/except blocks
4. Use st.cache_data for data loading functions
5. Keep chart functions modular in `chart_components.py`

## License

[Your License Here]

## Support

For issues or questions, please open an issue on GitHub.
