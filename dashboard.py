# dashboard.py
import streamlit as st
import pandas as pd
from openai import OpenAI
import json
import os
from datetime import datetime
from subscan import (
    get_token_metadata,
    fetch_account_data,
    fetch_all_transfers,
    fetch_extrinsics,
    fetch_staking_history,
    fetch_referenda_votes,
    flatten_json,
    get_full_account_snapshot
)

# ============================================================================
# CUSTOM CSS - PROFESSIONAL UI/UX DESIGN
# ============================================================================
st.markdown("""
<style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    /* Global Styles */
    * {
        font-family: 'Inter', sans-serif;
    }
    
    /* Main container layout with sidebar */
    .main {
        background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        color: #ffffff;
    }
    
    /* Sidebar styling */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Headers */
    h1, h2, h3, h4, h5, h6 {
        font-weight: 700;
        letter-spacing: -0.5px;
        color: #ffffff;
    }
    
    h1 {
        font-size: 2.5rem;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 1.5rem;
    }
    
    h2 {
        font-size: 1.8rem;
        color: #a8b2d1;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    
    h3 {
        font-size: 1.4rem;
        color: #ccd6f6;
        margin-top: 1.5rem;
    }
    
    /* Metric cards */
    [data-testid="stMetric"] {
        background: rgba(255, 255, 255, 0.05);
        padding: 1.2rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }
    
    [data-testid="stMetric"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        border-color: rgba(102, 126, 234, 0.3);
    }
    
    [data-testid="stMetric"] label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #8892b0 !important;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    [data-testid="stMetric"] [data-testid="stMetricValue"] {
        font-size: 1.5rem;
        font-weight: 700;
        color: #64ffda !important;
    }
    
    /* Input fields */
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        color: #ffffff;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        background: rgba(255, 255, 255, 0.12);
    }
    
    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 2rem;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .stButton > button:active {
        transform: translateY(0);
    }
    
    /* Select boxes */
    .stSelectbox > div > div {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
    }
    
    /* Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: rgba(255, 255, 255, 0.03);
        padding: 0.5rem;
        border-radius: 12px;
    }
    
    .stTabs [data-baseweb="tab"] {
        background: transparent;
        border-radius: 8px;
        color: #8892b0;
        font-weight: 500;
        padding: 0.75rem 1.5rem;
        transition: all 0.3s ease;
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    /* DataFrames */
    [data-testid="stDataFrame"] {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Dividers */
    hr {
        margin: 2rem 0;
        border: none;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
    }
    
    /* Info/Warning/Error boxes */
    .stAlert {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border-left: 4px solid #667eea;
        padding: 1rem;
    }
    
    /* Expander */
    .streamlit-expanderHeader {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        font-weight: 600;
    }
    
    /* Chat Container Styling */
    .chat-container {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1.5rem;
        height: 600px;
        overflow-y: auto;
        margin-bottom: 1rem;
    }
    
    .chat-message {
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 12px;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .user-message {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin-left: 20%;
        text-align: right;
    }
    
    .assistant-message {
        background: rgba(255, 255, 255, 0.08);
        margin-right: 20%;
    }
    
    .message-timestamp {
        font-size: 0.75rem;
        color: #8892b0;
        margin-top: 0.5rem;
    }
    
    .message-content {
        color: #ffffff;
        line-height: 1.6;
    }
    
    /* Spinner/Loading */
    .stSpinner > div {
        border-color: #667eea transparent transparent transparent;
    }
    
    /* Scrollbar styling */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.5);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(102, 126, 234, 0.7);
    }
    
    /* Monospace for addresses */
    .mono {
        font-family: 'JetBrains Mono', monospace;
        background: rgba(255, 255, 255, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
    }
    
    /* Section cards */
    .section-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 2rem;
        margin: 1rem 0;
        backdrop-filter: blur(10px);
    }
    
    /* Number formatting */
    .metric-value-positive {
        color: #64ffda !important;
    }
    
    .metric-value-negative {
        color: #f48fb1 !important;
    }
</style>
""", unsafe_allow_html=True)

# ============================================================================
# PAGE CONFIGURATION
# ============================================================================
st.set_page_config(
    page_title="Polkadot Analytics Dashboard",
    page_icon="🌐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================================
# INITIALIZE OPENAI CLIENT
# ============================================================================
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    try:
        api_key = st.secrets["OPENAI_API_KEY"]
    except Exception:
        api_key = None

client = OpenAI(api_key=api_key) if api_key else None

# ============================================================================
# SESSION STATE INITIALIZATION
# ============================================================================
session_defaults = {
    "data_section": None,
    "response_json": None,
    "transfers_df": pd.DataFrame(),
    "extrinsics_df": pd.DataFrame(),
    "staking_df": pd.DataFrame(),
    "votes_df": pd.DataFrame(),
    "account_data_snapshot": None,
    "chat_messages": [],
    "current_view": "Wallet Activity",
    "governance_voters": None,
    "governance_proposals": None,
}

for k, v in session_defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ============================================================================
# LOAD GOVERNANCE DATA
# ============================================================================
@st.cache_data
def load_governance_data():
    """Load governance CSV data"""
    try:
        voters = pd.read_csv("governace_app/data/polkadot_voters.csv")
        proposals = pd.read_csv("governace_app/data/proposals.csv")
        return voters, proposals
    except Exception as e:
        st.error(f"Error loading governance data: {e}")
        return pd.DataFrame(), pd.DataFrame()

# ============================================================================
# MAIN LAYOUT WITH SIDEBAR FOR CHAT
# ============================================================================

# Create two-column layout: main content + chat sidebar
main_col, chat_col = st.columns([2.5, 1])

with main_col:
    # ========================================================================
    # HEADER
    # ========================================================================
    st.title("🌐 Polkadot Analytics Dashboard")
    st.markdown("### Professional Multi-Chain Account & Governance Analytics")
    
    st.divider()
    
    # ========================================================================
    # NAVIGATION - Main View Selector
    # ========================================================================
    view_option = st.radio(
        "📊 Select Dashboard View:",
        ["Wallet Activity", "Governance Monitor"],
        horizontal=True,
        key="main_view_selector"
    )
    st.session_state.current_view = view_option
    
    st.divider()
    
    # ========================================================================
    # WALLET ACTIVITY VIEW
    # ========================================================================
    if view_option == "Wallet Activity":
        # Chain selection and configuration
        CHAIN_OPTIONS = {
            "Polkadot": "polkadot",
            "Kusama": "kusama",
            "Acala": "acala",
            "Astar": "astar",
            "Moonbeam": "moonbeam",
            "Phala": "phala",
            "Bifrost": "bifrost",
            "Centrifuge": "centrifuge",
            "Parallel": "parallel",
            "HydraDX": "hydradx",
            "Litentry": "litentry",
            "Crust": "crust",
            "Darwinia": "darwinia",
            "Edgeware": "edgeware",
            "Karura": "karura",
            "Statemine": "statemine",
            "Statemint": "statemint",
            "Ternoa": "ternoa",
            "Unique": "unique",
            "Zeitgeist": "zeitgeist"
        }
        
        # Input section
        col1, col2 = st.columns([3, 1])
        with col1:
            account_key = st.text_input(
                "🔑 Enter Wallet Address:",
                "15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71",
                help="Enter a valid Polkadot/Substrate address"
            )
        with col2:
            selected_chain = st.selectbox(
                "🔗 Select Network:",
                options=list(CHAIN_OPTIONS.keys()),
                index=0
            )
        
        chain_key = CHAIN_OPTIONS[selected_chain]
        
        try:
            API_KEY = st.secrets["SUBSCAN_API_KEY"]
        except:
            API_KEY = None
            st.error("⚠️ Subscan API key not found in secrets")
        
        # Fetch button
        if st.button("🔍 Fetch Account Data", use_container_width=False):
            if API_KEY:
                with st.spinner(f"Fetching data from {selected_chain}..."):
                    try:
                        response_json = fetch_account_data(chain_key, account_key, API_KEY)
                        st.session_state.response_json = response_json
                        st.session_state.data_section = response_json.get("data", {}).get("account", {})
                        
                        # Fetch all related data
                        st.session_state.transfers_df = fetch_all_transfers(chain_key, account_key, API_KEY)
                        st.session_state.extrinsics_df = fetch_extrinsics(chain_key, account_key, API_KEY)
                        st.session_state.staking_df = fetch_staking_history(chain_key, account_key, API_KEY)
                        st.session_state.votes_df = fetch_referenda_votes(chain_key, account_key, API_KEY)
                        st.session_state.account_data_snapshot = get_full_account_snapshot(chain_key, account_key, API_KEY)
                        
                        st.success("✅ Data fetched successfully!")
                    except Exception as e:
                        st.error(f"❌ Error fetching data: {e}")
        
        # Display dashboard if data exists
        data_section = st.session_state.data_section
        if data_section and API_KEY:
            token_meta = get_token_metadata(chain_key, API_KEY)
            symbol = token_meta["symbol"]
            decimals = token_meta["decimals"]
            price_usd = token_meta["price"]
            
            st.divider()
            
            # Account Overview Section
            st.markdown("## 👤 Account Overview")
            
            overview_col1, overview_col2, overview_col3, overview_col4 = st.columns(4)
            with overview_col1:
                st.metric("Network", selected_chain)
            with overview_col2:
                st.metric("Transactions", data_section.get("nonce", "N/A"))
            with overview_col3:
                st.metric("Role", data_section.get("role", "N/A"))
            with overview_col4:
                st.metric("Display Name", data_section.get("display", "N/A") if data_section.get("display") else "—")
            
            st.markdown(f"**Address:** `{data_section.get('address', 'N/A')}`")
            
            st.divider()
            
            # Financial Metrics
            st.markdown("## 💰 Balance Overview")
            
            balance = float(data_section.get("balance", 0))
            balance_usd = balance * price_usd
            lock = float(data_section.get("lock", 0))
            lock_usd = lock * price_usd
            transferrable = balance - lock
            transferrable_usd = balance_usd - lock_usd
            reserved = float(data_section.get("reserved", 0)) / 10**10
            reserved_usd = reserved * price_usd
            
            balance_col1, balance_col2, balance_col3, balance_col4 = st.columns(4)
            
            with balance_col1:
                st.metric("Total Balance", f"{balance:,.2f} {symbol}")
                st.metric("USD Value", f"${balance_usd:,.2f}")
            with balance_col2:
                st.metric("Transferable", f"{transferrable:,.2f} {symbol}")
                st.metric("USD Value", f"${transferrable_usd:,.2f}")
            with balance_col3:
                st.metric("Locked", f"{lock:,.2f} {symbol}")
                st.metric("USD Value", f"${lock_usd:,.2f}")
            with balance_col4:
                st.metric("Reserved", f"{reserved:,.2f} {symbol}")
                st.metric("Token Price", f"${price_usd:,.4f}")
            
            st.divider()
            
            # Additional Metrics
            st.markdown("## 📊 Additional Metrics")
            metric_col1, metric_col2, metric_col3 = st.columns(3)
            with metric_col1:
                st.metric("Bonded", f"{float(data_section.get('bonded', 0)):,.2f}")
            with metric_col2:
                st.metric("Democracy Lock", f"{float(data_section.get('democracy_lock', 0)):,.2f}")
            with metric_col3:
                st.metric("Conviction Lock", f"{float(data_section.get('conviction_lock', 0)):,.2f}")
            
            st.divider()
            
            # Detailed Data Tabs
            st.markdown("## 📈 Detailed Activity")
            
            tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
                "💸 Transfers",
                "⚙️ Extrinsics",
                "🔗 Proxy",
                "🪙 Staking",
                "🏛️ Democracy",
                "🗳️ Votes"
            ])
            
            with tab1:
                st.subheader("Token Transfer History")
                transfers_df = st.session_state.transfers_df
                if not transfers_df.empty:
                    display_cols = ["from", "to", "amount", "asset_symbol", "block_num", "datetime"]
                    display_cols = [c for c in display_cols if c in transfers_df.columns]
                    st.dataframe(transfers_df[display_cols], use_container_width=True, hide_index=True)
                else:
                    st.info("No transfer history available.")
            
            with tab2:
                st.subheader("Extrinsics History")
                extrinsics_df = st.session_state.extrinsics_df
                if not extrinsics_df.empty:
                    display_cols = [
                        "block_num", "extrinsic_index", "call_module", "call_module_function",
                        "nonce", "success", "fee", "tip", "extrinsic_hash", "datetime"
                    ]
                    display_cols = [c for c in display_cols if c in extrinsics_df.columns]
                    st.success(f"✅ {len(extrinsics_df)} extrinsics found")
                    st.dataframe(extrinsics_df[display_cols], use_container_width=True, hide_index=True)
                else:
                    st.info("No extrinsics found.")
            
            with tab3:
                st.subheader("Proxy Extrinsics")
                extrinsics_df = st.session_state.extrinsics_df
                if not extrinsics_df.empty:
                    proxy_df = extrinsics_df[extrinsics_df["call_module"] == "proxy"]
                    if not proxy_df.empty:
                        st.dataframe(proxy_df, use_container_width=True, hide_index=True)
                    else:
                        st.info("No proxy extrinsics found.")
                else:
                    st.info("No data available.")
            
            with tab4:
                st.subheader("Staking Information")
                staking_info = data_section.get("staking_info", {})
                if staking_info:
                    st.write(f"**Controller:** {staking_info.get('controller', 'N/A')}")
                    st.write(f"**Reward Account:** {staking_info.get('reward_account', 'N/A')}")
                    st.write(f"**Stash:** {data_section.get('stash', 'N/A')}")
                else:
                    st.info("No staking information found.")
                
                st.markdown("#### Delegations")
                delegate_data = data_section.get("delegate", {}).get("conviction_delegate", [])
                if delegate_data:
                    table_data = []
                    for d in delegate_data:
                        delegate = d.get("delegate_account", {})
                        table_data.append({
                            "Delegate Display": delegate.get("people", {}).get("display", "N/A"),
                            "Delegate Address": delegate.get("address", "N/A"),
                            "Conviction": d.get("conviction", "N/A"),
                            "Amount": int(d.get("amount", 0)) / 1e10,
                            "Votes": int(d.get("votes", 0)) / 1e10,
                        })
                    st.dataframe(pd.DataFrame(table_data), use_container_width=True)
                else:
                    st.info("No delegation data.")
                
                st.markdown("#### Staking Rewards & Slashes")
                staking_df = st.session_state.staking_df
                if not staking_df.empty:
                    staking_df['amount'] = pd.to_numeric(staking_df['amount'], errors='coerce')
                    staking_df['datetime'] = pd.to_datetime(staking_df['block_timestamp'], unit='s')
                    st.dataframe(
                        staking_df[['block_num', 'datetime', 'event_id', 'amount']],
                        use_container_width=True,
                        hide_index=True
                    )
                else:
                    st.info("No staking history.")
            
            with tab5:
                st.subheader("Democracy Extrinsics")
                extrinsics_df = st.session_state.extrinsics_df
                if not extrinsics_df.empty:
                    demo_df = extrinsics_df[extrinsics_df["call_module"] == "democracy"]
                    if not demo_df.empty:
                        st.dataframe(demo_df, use_container_width=True, hide_index=True)
                    else:
                        st.info("No democracy extrinsics.")
                else:
                    st.info("No data available.")
            
            with tab6:
                st.subheader("Referenda Votes")
                votes_df = st.session_state.votes_df
                if not votes_df.empty:
                    votes_df['amount'] = pd.to_numeric(votes_df['amount'], errors='coerce')
                    votes_df['datetime'] = pd.to_datetime(votes_df['block_timestamp'], unit='s')
                    st.dataframe(
                        votes_df[['referendum_index', 'datetime', 'status', 'amount', 'conviction']],
                        use_container_width=True,
                        hide_index=True
                    )
                else:
                    st.info("No referenda votes.")
            
            # Developer view
            with st.expander("🧩 Developer View - Raw Data"):
                flat_data = flatten_json(data_section)
                flat_df = pd.DataFrame(list(flat_data.items()), columns=["Field", "Value"])
                st.dataframe(flat_df, use_container_width=True)
                st.json(st.session_state.response_json)
    
    # ========================================================================
    # GOVERNANCE MONITOR VIEW
    # ========================================================================
    elif view_option == "Governance Monitor":
        st.markdown("## 🌀 Polkadot & Kusama Governance Monitor")
        
        # Load governance data
        if st.session_state.governance_voters is None or st.session_state.governance_proposals is None:
            voters, proposals = load_governance_data()
            st.session_state.governance_voters = voters
            st.session_state.governance_proposals = proposals
        else:
            voters = st.session_state.governance_voters
            proposals = st.session_state.governance_proposals
        
        if voters.empty or proposals.empty:
            st.warning("⚠️ Governance data not available. Please check data files in governace_app/data/")
        else:
            st.divider()
            
            # Voter Lookup Section
            st.markdown("### 🔍 Voter Lookup")
            wallet_address = st.text_input(
                "Enter Wallet Address:",
                help="Check governance participation for a specific address"
            )
            
            if wallet_address:
                # Prepare address column
                if "address" not in voters.columns and "voter" in voters.columns:
                    voters = voters.copy()
                    voters["address"] = voters["voter"].astype(str).str.strip()
                
                if "address" in voters.columns:
                    voter_info = voters[voters["address"].astype(str).str.lower() == wallet_address.lower()]
                else:
                    voter_info = pd.DataFrame()
                
                if not voter_info.empty:
                    st.success("✅ Voter found!")
                    
                    # Extract voter data
                    voter_row = voter_info.iloc[0]
                    voter_address = str(voter_row.get("voter", wallet_address))
                    voter_name = str(voter_row.get("voter_name", "")) if pd.notna(voter_row.get("voter_name")) else ""
                    voter_type = str(voter_row.get("voter_type", "Unknown"))
                    is_active = voter_row.get("is_active", False)
                    last_vote = str(voter_row.get("last_vote_time", "N/A"))
                    total_votes = int(voter_row.get("total_votes", 0)) if pd.notna(voter_row.get("total_votes")) else 0
                    total_tokens = float(voter_row.get("total_tokens_cast", 0)) if pd.notna(voter_row.get("total_tokens_cast")) else 0
                    aye_tokens = float(voter_row.get("aye_tokens", 0)) if pd.notna(voter_row.get("aye_tokens")) else 0
                    nay_tokens = float(voter_row.get("nay_tokens", 0)) if pd.notna(voter_row.get("nay_tokens")) else 0
                    abstain_tokens = float(voter_row.get("abstain_tokens", 0)) if pd.notna(voter_row.get("abstain_tokens")) else 0
                    support_ratio = float(voter_row.get("support_ratio_pct", 0)) if pd.notna(voter_row.get("support_ratio_pct")) else 0
                    delegates = str(voter_row.get("delegates", "")) if pd.notna(voter_row.get("delegates")) else ""
                    
                    # ===== 1. VOTER PROFILE CARD =====
                    st.markdown("""
                    <style>
                        .voter-profile-card {
                            background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
                            border: 2px solid rgba(102, 126, 234, 0.3);
                            border-radius: 20px;
                            padding: 2rem;
                            margin: 1.5rem 0;
                            backdrop-filter: blur(10px);
                        }
                        .voter-profile-header {
                            display: flex;
                            align-items: center;
                            margin-bottom: 1.5rem;
                        }
                        .voter-avatar {
                            width: 80px;
                            height: 80px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 2.5rem;
                            margin-right: 1.5rem;
                            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
                        }
                        .voter-info {
                            flex: 1;
                        }
                        .voter-name {
                            font-size: 1.8rem;
                            font-weight: 700;
                            color: #ffffff;
                            margin-bottom: 0.5rem;
                        }
                        .voter-address {
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 0.9rem;
                            color: #a8b2d1;
                            background: rgba(255, 255, 255, 0.08);
                            padding: 0.5rem 1rem;
                            border-radius: 8px;
                            display: inline-block;
                            margin-bottom: 0.5rem;
                        }
                        .voter-badges {
                            display: flex;
                            gap: 0.75rem;
                            flex-wrap: wrap;
                            margin-top: 1rem;
                        }
                        .voter-badge {
                            padding: 0.5rem 1rem;
                            border-radius: 20px;
                            font-size: 0.85rem;
                            font-weight: 600;
                            display: inline-flex;
                            align-items: center;
                            gap: 0.5rem;
                        }
                        .badge-active {
                            background: rgba(16, 185, 129, 0.2);
                            color: #10B981;
                            border: 1px solid rgba(16, 185, 129, 0.5);
                        }
                        .badge-inactive {
                            background: rgba(107, 114, 128, 0.2);
                            color: #9CA3AF;
                            border: 1px solid rgba(107, 114, 128, 0.5);
                        }
                        .badge-type {
                            background: rgba(102, 126, 234, 0.2);
                            color: #667eea;
                            border: 1px solid rgba(102, 126, 234, 0.5);
                        }
                        .vote-stats-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 1rem;
                            margin: 1.5rem 0;
                        }
                        .vote-stat-card {
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 12px;
                            padding: 1.5rem;
                            text-align: center;
                            transition: all 0.3s ease;
                        }
                        .vote-stat-card:hover {
                            transform: translateY(-4px);
                            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
                            border-color: rgba(102, 126, 234, 0.4);
                        }
                        .vote-stat-value {
                            font-size: 2rem;
                            font-weight: 700;
                            margin-bottom: 0.5rem;
                        }
                        .vote-stat-label {
                            font-size: 0.875rem;
                            color: #8892b0;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            font-weight: 500;
                        }
                        .distribution-bar {
                            width: 100%;
                            height: 40px;
                            background: rgba(0, 0, 0, 0.3);
                            border-radius: 20px;
                            overflow: hidden;
                            display: flex;
                            margin: 1rem 0;
                        }
                        .bar-segment {
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 0.875rem;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        }
                        .bar-segment:hover {
                            filter: brightness(1.2);
                        }
                        .bar-aye {
                            background: linear-gradient(90deg, #10B981 0%, #059669 100%);
                        }
                        .bar-nay {
                            background: linear-gradient(90deg, #EF4444 0%, #DC2626 100%);
                        }
                        .bar-abstain {
                            background: linear-gradient(90deg, #6B7280 0%, #4B5563 100%);
                        }
                        .legend-item {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            margin: 0.5rem 0;
                        }
                        .legend-color {
                            width: 20px;
                            height: 20px;
                            border-radius: 4px;
                        }
                        .progress-circle {
                            width: 120px;
                            height: 120px;
                            border-radius: 50%;
                            background: conic-gradient(
                                #667eea 0deg,
                                #667eea calc(var(--progress) * 3.6deg),
                                rgba(255, 255, 255, 0.1) calc(var(--progress) * 3.6deg),
                                rgba(255, 255, 255, 0.1) 360deg
                            );
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 1rem auto;
                            position: relative;
                        }
                        .progress-circle::before {
                            content: '';
                            width: 90px;
                            height: 90px;
                            background: #1a1a2e;
                            border-radius: 50%;
                            position: absolute;
                        }
                        .progress-value {
                            position: relative;
                            z-index: 1;
                            font-size: 1.5rem;
                            font-weight: 700;
                            color: #667eea;
                        }
                    </style>
                    """, unsafe_allow_html=True)
                    
                    # Voter Profile Card HTML
                    activity_status = "Active" if is_active else "Inactive"
                    activity_badge_class = "badge-active" if is_active else "badge-inactive"
                    activity_icon = "🟢" if is_active else "⚫"
                    
                    display_name = voter_name if voter_name else "Anonymous Voter"
                    avatar_emoji = voter_name[:2] if voter_name and len(voter_name) >= 2 else "👤"
                    
                    st.markdown(f"""
                    <div class="voter-profile-card">
                        <div class="voter-profile-header">
                            <div class="voter-avatar">{avatar_emoji}</div>
                            <div class="voter-info">
                                <div class="voter-name">{display_name}</div>
                                <div class="voter-address">{voter_address[:20]}...{voter_address[-10:]}</div>
                            </div>
                        </div>
                        <div class="voter-badges">
                            <span class="voter-badge {activity_badge_class}">{activity_icon} {activity_status}</span>
                            <span class="voter-badge badge-type">📝 {voter_type}</span>
                            <span class="voter-badge badge-type">🕐 Last Vote: {last_vote[:10] if last_vote != 'N/A' else 'N/A'}</span>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Add copy button for address
                    st.code(voter_address, language=None)
                    
                    st.markdown("---")
                    
                    # ===== 2. VOTING STATISTICS PANEL =====
                    st.markdown("## 📊 Voting Statistics")
                    
                    # Key metrics in cards
                    metric_col1, metric_col2, metric_col3, metric_col4 = st.columns(4)
                    
                    with metric_col1:
                        st.markdown(f"""
                        <div class="vote-stat-card">
                            <div class="vote-stat-value" style="color: #64ffda;">🗳️ {total_votes:,}</div>
                            <div class="vote-stat-label">Total Votes Cast</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with metric_col2:
                        st.markdown(f"""
                        <div class="vote-stat-card">
                            <div class="vote-stat-value" style="color: #667eea;">💎 {total_tokens:,.0f}</div>
                            <div class="vote-stat-label">Total Tokens</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with metric_col3:
                        st.markdown(f"""
                        <div class="vote-stat-card">
                            <div class="vote-stat-value" style="color: #10B981;">✅ {support_ratio:.1f}%</div>
                            <div class="vote-stat-label">Support Ratio</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with metric_col4:
                        if delegates:
                            delegate_display = delegates[:20] + "..." if len(delegates) > 20 else delegates
                            st.markdown(f"""
                            <div class="vote-stat-card">
                                <div class="vote-stat-value" style="color: #f59e0b; font-size: 1.2rem;">🔗 {delegate_display}</div>
                                <div class="vote-stat-label">Delegates To</div>
                            </div>
                            """, unsafe_allow_html=True)
                        else:
                            st.markdown(f"""
                            <div class="vote-stat-card">
                                <div class="vote-stat-value" style="color: #8892b0;">—</div>
                                <div class="vote-stat-label">No Delegation</div>
                            </div>
                            """, unsafe_allow_html=True)
                    
                    st.markdown("<br>", unsafe_allow_html=True)
                    
                    # ===== 3. VOTE DISTRIBUTION VISUALIZATION =====
                    st.markdown("### 🎯 Vote Distribution")
                    
                    # Calculate percentages
                    total_voting_tokens = aye_tokens + nay_tokens + abstain_tokens
                    if total_voting_tokens > 0:
                        aye_pct = (aye_tokens / total_voting_tokens) * 100
                        nay_pct = (nay_tokens / total_voting_tokens) * 100
                        abstain_pct = (abstain_tokens / total_voting_tokens) * 100
                    else:
                        aye_pct = nay_pct = abstain_pct = 0
                    
                    # Distribution bar
                    st.markdown(f"""
                    <div class="distribution-bar">
                        <div class="bar-segment bar-aye" style="width: {aye_pct}%;" title="Aye: {aye_pct:.1f}%">
                            {f'{aye_pct:.0f}%' if aye_pct > 10 else ''}
                        </div>
                        <div class="bar-segment bar-nay" style="width: {nay_pct}%;" title="Nay: {nay_pct:.1f}%">
                            {f'{nay_pct:.0f}%' if nay_pct > 10 else ''}
                        </div>
                        <div class="bar-segment bar-abstain" style="width: {abstain_pct}%;" title="Abstain: {abstain_pct:.1f}%">
                            {f'{abstain_pct:.0f}%' if abstain_pct > 10 else ''}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Legend with detailed breakdown
                    legend_col1, legend_col2, legend_col3 = st.columns(3)
                    
                    with legend_col1:
                        st.markdown(f"""
                        <div style="text-align: center; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #10B981; margin-bottom: 0.5rem;">✅ Aye</div>
                            <div style="font-size: 1.2rem; color: #64ffda;">{aye_tokens:,.0f} tokens</div>
                            <div style="font-size: 0.875rem; color: #8892b0;">{aye_pct:.1f}% of votes</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with legend_col2:
                        st.markdown(f"""
                        <div style="text-align: center; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.3);">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #EF4444; margin-bottom: 0.5rem;">❌ Nay</div>
                            <div style="font-size: 1.2rem; color: #64ffda;">{nay_tokens:,.0f} tokens</div>
                            <div style="font-size: 0.875rem; color: #8892b0;">{nay_pct:.1f}% of votes</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with legend_col3:
                        st.markdown(f"""
                        <div style="text-align: center; padding: 1rem; background: rgba(107, 114, 128, 0.1); border-radius: 12px; border: 1px solid rgba(107, 114, 128, 0.3);">
                            <div style="font-size: 1.5rem; font-weight: 700; color: #6B7280; margin-bottom: 0.5rem;">⚪ Abstain</div>
                            <div style="font-size: 1.2rem; color: #64ffda;">{abstain_tokens:,.0f} tokens</div>
                            <div style="font-size: 0.875rem; color: #8892b0;">{abstain_pct:.1f}% of votes</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    st.markdown("---")
                    
                    # ===== 4. PARTICIPATION INSIGHTS =====
                    st.markdown("### 📈 Participation Insights")
                    
                    insight_col1, insight_col2 = st.columns([1, 2])
                    
                    with insight_col1:
                        # Circular progress for support ratio
                        st.markdown(f"""
                        <div style="text-align: center;">
                            <div class="progress-circle" style="--progress: {support_ratio};">
                                <span class="progress-value">{support_ratio:.0f}%</span>
                            </div>
                            <div style="color: #a8b2d1; font-size: 0.875rem; margin-top: 0.5rem;">Support Ratio</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with insight_col2:
                        # Key insights text
                        if aye_pct > nay_pct:
                            voting_tendency = f"This voter tends to support proposals ({aye_pct:.0f}% Aye votes)"
                            tendency_color = "#10B981"
                            tendency_icon = "✅"
                        elif nay_pct > aye_pct:
                            voting_tendency = f"This voter tends to oppose proposals ({nay_pct:.0f}% Nay votes)"
                            tendency_color = "#EF4444"
                            tendency_icon = "❌"
                        else:
                            voting_tendency = "This voter has a balanced voting pattern"
                            tendency_color = "#667eea"
                            tendency_icon = "⚖️"
                        
                        avg_tokens_per_vote = total_tokens / total_votes if total_votes > 0 else 0
                        
                        st.markdown(f"""
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px; border-left: 4px solid {tendency_color};">
                            <h4 style="color: {tendency_color}; margin-bottom: 1rem;">{tendency_icon} Voting Pattern</h4>
                            <p style="color: #ccd6f6; font-size: 1.1rem; margin-bottom: 1rem;">{voting_tendency}</p>
                            <ul style="color: #a8b2d1; line-height: 1.8;">
                                <li><strong>Average tokens per vote:</strong> {avg_tokens_per_vote:,.0f} tokens</li>
                                <li><strong>Activity status:</strong> {"🟢 Active participant" if is_active else "⚫ Inactive"}</li>
                                <li><strong>Voter type:</strong> {voter_type}</li>
                                {"<li><strong>Delegation:</strong> Delegates to " + delegates + "</li>" if delegates else ""}
                            </ul>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    # ===== 5. RAW DATA (EXPANDABLE) =====
                    with st.expander("📋 View All Raw Voter Data"):
                        st.dataframe(voter_info, use_container_width=True)
                
                else:
                    st.warning("No governance data found for this address.")
            
            st.divider()
            
            # Proposals Section
            st.markdown("### 🏛️ Recent Proposals")
            st.dataframe(proposals.head(10), use_container_width=True, hide_index=True)
            
            st.markdown("### 📋 Proposal Details")
            
            # Prepare proposals for selection
            top_proposals = proposals.head(20).copy()
            if "title" not in top_proposals.columns:
                top_proposals["title"] = ""
            top_proposals["title"] = top_proposals["title"].fillna("").astype(str).str.strip()
            
            def build_display_title(row: pd.Series) -> str:
                if row.get("title"):
                    return str(row["title"]).strip()
                chain = str(row.get("chain", "")).strip()
                origin = str(row.get("origin", "")).strip()
                ref_id = str(row.get("referenda_id", "")).strip()
                status = str(row.get("status", "")).strip()
                parts = []
                if chain:
                    parts.append(chain)
                if origin:
                    parts.append(origin)
                if ref_id:
                    parts.append(f"ID {ref_id}")
                if status:
                    parts.append(status)
                label = " · ".join(parts)
                return label if label else "(untitled)"
            
            top_proposals["display_title"] = top_proposals.apply(build_display_title, axis=1)
            
            selection_index = st.selectbox(
                "Select a proposal to explore:",
                options=list(top_proposals.index),
                format_func=lambda idx: str(top_proposals.loc[idx, "display_title"]),
            )
            selected_row = top_proposals.loc[selection_index]
            
            # Display proposal details
            detail_col1, detail_col2, detail_col3, detail_col4 = st.columns(4)
            with detail_col1:
                st.metric("Referendum ID", selected_row.get("referenda_id", "N/A"))
            with detail_col2:
                st.metric("Status", selected_row.get("status", "N/A"))
            with detail_col3:
                st.metric("Chain", selected_row.get("chain", "N/A"))
            with detail_col4:
                st.metric("Origin", selected_row.get("origin", "N/A"))
            
            st.markdown(f"**Proposer:** {selected_row.get('proposed_by_name', selected_row.get('proposed_by', 'N/A'))}")
            
            referenda_url = selected_row.get("referenda_url", "")
            if isinstance(referenda_url, str) and referenda_url:
                st.markdown(f"**Links:** {referenda_url}")
            
            st.divider()
            
            # AI Summary Section
            st.markdown("### 🤖 AI-Powered Analysis")
            
            if st.button("📝 Generate AI Summary of This Proposal"):
                if client is None:
                    st.error("⚠️ OpenAI API key not configured. AI features are disabled.")
                else:
                    key_columns = [
                        c for c in [
                            "chain", "origin", "referenda_id", "status", "title",
                            "proposed_by_name", "proposed_by", "start_time", "end_time"
                        ] if c in proposals.columns
                    ]
                    proposals_context_df = proposals[key_columns].head(25) if key_columns else proposals.head(10)
                    proposals_context = proposals_context_df.to_dict(orient="records")
                    
                    prompt = f"""
                    You are an expert on Polkadot governance.
                    Based on the following proposal data, provide a comprehensive analysis:
                    
                    Proposal Details:
                    {selected_row.to_dict()}
                    
                    Recent Proposals Context:
                    {proposals_context}
                    
                    Please provide:
                    1. A clear summary of what this proposal is about
                    2. Key insights and implications
                    3. Arguments for voting YES
                    4. Arguments for voting NO
                    5. Overall recommendation for voters
                    """
                    
                    with st.spinner("🤖 Generating AI analysis..."):
                        response = client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[
                                {"role": "system", "content": "You are an expert Polkadot governance analyst."},
                                {"role": "user", "content": prompt}
                            ],
                            temperature=0.3,
                            max_tokens=1000
                        )
                        st.success("✅ AI Analysis Complete")
                        st.markdown(response.choices[0].message.content)

# ============================================================================
# CHAT SIDEBAR (RIGHT COLUMN)
# ============================================================================
with chat_col:
    st.markdown("## 💬 AI Assistant")
    st.markdown("---")
    
    if client is None:
        st.warning("⚠️ OpenAI API key not configured")
        st.info("Add OPENAI_API_KEY to your secrets to enable the AI assistant.")
    else:
        # Chat interface
        st.markdown("**Ask questions about your data**")
        
        # Chat history display container
        chat_container = st.container()
        
        with chat_container:
            # Display chat history
            if st.session_state.chat_messages:
                for msg in st.session_state.chat_messages:
                    role = msg["role"]
                    content = msg["content"]
                    timestamp = msg.get("timestamp", "")
                    
                    if role == "user":
                        st.markdown(f"""
                        <div class="chat-message user-message">
                            <div class="message-content"><strong>You:</strong><br>{content}</div>
                            <div class="message-timestamp">{timestamp}</div>
                        </div>
                        """, unsafe_allow_html=True)
                    else:
                        st.markdown(f"""
                        <div class="chat-message assistant-message">
                            <div class="message-content"><strong>Assistant:</strong><br>{content}</div>
                            <div class="message-timestamp">{timestamp}</div>
                        </div>
                        """, unsafe_allow_html=True)
            else:
                st.info("👋 Start a conversation! Ask me anything about your wallet or governance data.")
        
        # Chat input section
        st.markdown("---")
        
        # Text input for user query
        user_input = st.text_area(
            "Your question:",
            key="chat_input",
            height=100,
            placeholder="Type your question here... (Shift+Enter for new line)"
        )
        
        # Send button
        col1, col2 = st.columns([3, 1])
        with col1:
            send_button = st.button("📤 Send", use_container_width=True)
        with col2:
            if st.button("🗑️ Clear"):
                st.session_state.chat_messages = []
                st.rerun()
        
        # Process chat input
        if send_button and user_input.strip():
            timestamp = datetime.now().strftime("%H:%M:%S")
            
            # Add user message to history
            st.session_state.chat_messages.append({
                "role": "user",
                "content": user_input,
                "timestamp": timestamp
            })
            
            # Generate AI response based on current view
            with st.spinner("🤖 Thinking..."):
                try:
                    if st.session_state.current_view == "Wallet Activity":
                        # Wallet-focused assistant
                        if st.session_state.account_data_snapshot:
                            snapshot_text = json.dumps(
                                st.session_state.account_data_snapshot,
                                indent=2,
                                default=str
                            )
                            
                            prompt = f"""
                            You are a blockchain account analyst assistant.
                            You have access to this Subscan data for the user's account:
                            {snapshot_text}
                            
                            User question: {user_input}
                            
                            Provide a helpful, concise answer. If relevant, suggest actions
                            to optimize staking, governance participation, or account management.
                            """
                        else:
                            prompt = f"""
                            You are a blockchain account analyst assistant.
                            The user hasn't fetched account data yet.
                            
                            User question: {user_input}
                            
                            Provide general guidance or ask them to fetch account data first if needed.
                            """
                    
                    else:  # Governance Monitor
                        # Governance-focused assistant
                        proposals = st.session_state.governance_proposals
                        if proposals is not None and not proposals.empty:
                            key_columns = [
                                c for c in [
                                    "chain", "origin", "referenda_id", "status", "title",
                                    "proposed_by_name", "proposed_by"
                                ] if c in proposals.columns
                            ]
                            proposals_context_df = proposals[key_columns].head(20) if key_columns else proposals.head(10)
                            proposals_context = proposals_context_df.to_dict(orient="records")
                            
                            prompt = f"""
                            You are a Polkadot governance assistant.
                            You have access to recent governance proposals:
                            {proposals_context}
                            
                            User question: {user_input}
                            
                            Provide helpful insights about Polkadot/Kusama governance, referenda, or voting strategies.
                            """
                        else:
                            prompt = f"""
                            You are a Polkadot governance assistant.
                            
                            User question: {user_input}
                            
                            Provide general guidance about Polkadot/Kusama governance.
                            """
                    
                    response = client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "You are a helpful blockchain analytics assistant. Provide clear, concise answers."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.3,
                        max_tokens=800
                    )
                    
                    ai_response = response.choices[0].message.content
                    
                    # Add assistant response to history
                    st.session_state.chat_messages.append({
                        "role": "assistant",
                        "content": ai_response,
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    })
                    
                except Exception as e:
                    st.error(f"Error generating response: {e}")
            
            # Rerun to update chat display
            st.rerun()

# ============================================================================
# FOOTER
# ============================================================================
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #8892b0; padding: 1rem;">
    <p>🌐 Polkadot Analytics Dashboard | Powered by Subscan API & OpenAI</p>
</div>
""", unsafe_allow_html=True)
