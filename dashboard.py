# dashboard.py
import streamlit as st
import pandas as pd
from openai import OpenAI
import json
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

# Initialize OpenAI client with your Streamlit secret
client = OpenAI(api_key=st.secrets["OPENAI_API_KEY"])


# ---- Streamlit Page Setup ----
st.set_page_config(page_title="Subscan Account Dashboard", page_icon="🪙", layout="wide")
st.title("🪙 Subscan Multi-Chain Account Dashboard")

# ---- Session State Setup ----
session_defaults = {
    "data_section": None,
    "response_json": None,
    "transfers_df": pd.DataFrame(),
    "extrinsics_df": pd.DataFrame(),
    "staking_df": pd.DataFrame(),
    "votes_df": pd.DataFrame(),
    "account_data_snapshot": None
}
for k, v in session_defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ---- Supported Chains ----
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

# ---- Chain Selection ----
col1, col2 = st.columns([3, 1])
with col2:
    selected_chain = st.selectbox(
        "🔗 Choose Blockchain Network:",
        options=list(CHAIN_OPTIONS.keys()),
        index=0
    )

chain_key = CHAIN_OPTIONS[selected_chain]
API_KEY = st.secrets["SUBSCAN_API_KEY"]


# ---- Token Metadata ----
token_meta = get_token_metadata(chain_key, API_KEY)
symbol = token_meta["symbol"]
decimals = token_meta["decimals"]
price_usd = token_meta["price"]

# ---- User Input ----
with col1:
    account_key = st.text_input("Enter Account Address:", "15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71")

# ---- Fetch Data ----
if st.button("🔍 Fetch Account Data"):
    with st.spinner(f"Fetching data from {selected_chain}..."):
        try:
            response_json = fetch_account_data(chain_key, account_key, API_KEY)
            st.session_state.response_json = response_json
            st.session_state.data_section = response_json.get("data", {}).get("account", {})

            # Fetch all related data once and cache them in session state
            st.session_state.transfers_df = fetch_all_transfers(chain_key, account_key, API_KEY)
            st.session_state.extrinsics_df = fetch_extrinsics(chain_key, account_key, API_KEY)
            st.session_state.staking_df = fetch_staking_history(chain_key, account_key, API_KEY)
            st.session_state.votes_df = fetch_referenda_votes(chain_key, account_key, API_KEY)
            st.session_state.account_data_snapshot = get_full_account_snapshot(chain_key, account_key, API_KEY)

        except Exception as e:
            st.error(f"❌ Error fetching data: {e}")
            st.stop()

# Use stored data if available
data_section = st.session_state.data_section
response_json = st.session_state.response_json
transfers_df = st.session_state.transfers_df
extrinsics_df = st.session_state.extrinsics_df
staking_df = st.session_state.staking_df
votes_df = st.session_state.votes_df

# ---- Only display dashboard if data exists ----
if data_section:
    # ---- Account Overview ----
    st.header(f"👤 Account Overview ({selected_chain})")
    col1, col2 = st.columns(2)
    col1.metric("Address", data_section.get("address", "N/A"))
    col2.metric("Display Name", data_section.get("display", "N/A"))
    col1.metric("Role", data_section.get("role", "N/A"))
    col2.metric("Transactions", data_section.get("nonce", "N/A"))

    st.divider()

    # ---- Financial Info ----
    st.subheader("💰 Account Balances")
    balance = float(data_section.get("balance", 0))
    balance_usd = balance * price_usd
    lock = float(data_section.get("lock", 0))
    lock_usd = lock * price_usd
    transferrable = balance - lock
    transferrable_usd = balance_usd - lock_usd

    reserved = float(data_section.get("reserved", 0)) / 10**10
    reserved_usd = reserved * price_usd
    bonded = float(data_section.get("bonded", 0))
    democracy_lock = float(data_section.get("democracy_lock", 0))
    conviction_lock = float(data_section.get("conviction_lock", 0))

    col1, col2, col3 = st.columns(3)
    col1.metric("Total Balance", f"{balance:,.2f} {symbol}")
    col1.metric("Total Balance USD", f"${balance_usd:,.2f}")
    col1.metric("Transferable Balance", f"${transferrable:,.2f}")
    col2.metric("Locked Balance", f"{lock:,.2f} {symbol}")
    col2.metric("Locked Balance USD", f"${lock_usd:,.2f}")
    col2.metric("Transferable Balance USD", f"${transferrable_usd:,.2f}")
    col3.metric("Reserved", f"{reserved:,.2f}")
    col3.metric("Reserved USD", f"{reserved_usd:,.2f}")

    col1.metric("Token", f"${symbol}")
    col2.metric("Decimals", f"{decimals}")
    col3.metric("USD Price", f"{price_usd:,.2f}")

    col4, col5, col6 = st.columns(3)
    col4.metric("Bonded", bonded)
    col5.metric("Democracy Lock", democracy_lock)
    col6.metric("Conviction Lock", conviction_lock)

    st.divider()

    # ====================================
    # 🧩 New Tab Layout Integration
    # ====================================
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "Transfers",
        "Extrinsics",
        "Proxy",
        "Staking",
        "Democracy",
        "Referenda Votes"
    ])

    # ---- Transfers ----
    with tab1:
        st.subheader("🔄 Token Transfer History")
        if not transfers_df.empty:
            st.dataframe(
                transfers_df[["from", "to", "amount", "asset_symbol", "block_num", "datetime"]],
                use_container_width=True,
                hide_index=True
            )
        else:
            st.info("No transfer history available.")

    # ---- Extrinsics ----
    with tab2:
        st.subheader("⚙️ Extrinsics History")
        if not extrinsics_df.empty:
            display_cols = [
                "block_num", "extrinsic_index", "call_module", "call_module_function",
                "nonce", "success", "fee", "tip", "extrinsic_hash", "datetime"
            ]
            display_cols = [c for c in display_cols if c in extrinsics_df.columns]
            st.success(f"✅ {len(extrinsics_df)} extrinsics found for address {account_key}")
            st.dataframe(extrinsics_df[display_cols], use_container_width=True, hide_index=True)
        else:
            st.info("No extrinsics found for this address.")

    # ---- Proxy ----
    with tab3:
        st.subheader("🧩 Proxy Extrinsics")
        if not extrinsics_df.empty:
            proxy_df = extrinsics_df[extrinsics_df["call_module"] == "proxy"]
            if not proxy_df.empty:
                st.dataframe(proxy_df, use_container_width=True, hide_index=True)
            else:
                st.info("No proxy extrinsics found.")
        else:
            st.info("Extrinsics data not available.")

    # ---- Staking ----
    with tab4:
        staking_info = data_section.get("staking_info", {})
        if staking_info:
            st.subheader("🪶 Staking Information")
            st.write(f"**Controller:** {staking_info.get('controller', 'N/A')}")
            st.write(f"**Reward Account:** {staking_info.get('reward_account', 'N/A')}")
            st.write(f"**Stash:** {data_section.get('stash', 'N/A')}")
            st.write(f"**Role:** {data_section.get('role', 'N/A')}")
        else:
            st.info("No staking information found.")

        st.divider()
        delegate_data = data_section.get("delegate", {}).get("conviction_delegate", [])
        if delegate_data:
            st.subheader("🗳️ Delegations")
            table_data = []
            for d in delegate_data:
                delegate = d.get("delegate_account", {})
                table_data.append({
                    "Delegate Display": delegate.get("people", {}).get("display", "N/A"),
                    "Delegate Address": delegate.get("address", "N/A"),
                    "Conviction": d.get("conviction", "N/A"),
                    "Amount": int(d.get("amount", 0)) / 1e10,
                    "Votes": int(d.get("votes", 0)) / 1e10,
                    "Origins": d.get("origins", "N/A")
                })
            df = pd.DataFrame(table_data).astype(str)
            st.dataframe(df, use_container_width=True)
        else:
            st.info("No delegation data available.")

        st.subheader("🪶 Staking Rewards & Slashes")
        if not staking_df.empty:
            staking_df['amount'] = pd.to_numeric(staking_df['amount'], errors='coerce')
            staking_df['datetime'] = pd.to_datetime(staking_df['block_timestamp'], unit='s')
            st.dataframe(staking_df[['block_num', 'datetime', 'event_id', 'amount']],
                         use_container_width=True, hide_index=True)
        else:
            st.info("No staking history found.")

    # ---- Democracy ----
    with tab5:
        st.subheader("🏛️ Democracy Extrinsics")
        if not extrinsics_df.empty:
            demo_df = extrinsics_df[extrinsics_df["call_module"] == "democracy"]
            if not demo_df.empty:
                st.dataframe(demo_df, use_container_width=True, hide_index=True)
            else:
                st.info("No democracy extrinsics found.")
        else:
            st.info("Extrinsics data not available.")

    # ---- Referenda Votes ----
    with tab6:
        st.subheader("🗳️ Referenda Votes")
        if not votes_df.empty:
            votes_df['amount'] = pd.to_numeric(votes_df['amount'], errors='coerce')
            votes_df['datetime'] = pd.to_datetime(votes_df['block_timestamp'], unit='s')
            st.dataframe(votes_df[['referendum_index', 'datetime', 'status', 'amount', 'conviction']],
                         use_container_width=True, hide_index=True)
        else:
            st.info("No referenda votes found.")

    st.divider()

    # ---- Flattened Developer View ----
    st.subheader("🧩 Flattened Data (Developer View)")
    flat_data = flatten_json(data_section)
    flat_df = pd.DataFrame(list(flat_data.items()), columns=["Field", "Value"])
    st.dataframe(flat_df, use_container_width=True)

    with st.expander("🧩 Raw JSON Response"):
        st.json(response_json)

    # ====================================
    # 💬 Account Assistant Tab
    # ====================================
    st.divider()
    st.header("💬 Account Assistant")

    st.info("Ask questions about this account. The AI has access to your on-chain data from Subscan.")

    if st.session_state.account_data_snapshot:
        user_query = st.text_area("Ask the assistant something about this account:")

        if user_query:
            snapshot_text = json.dumps(
                    st.session_state["account_data_snapshot"],
                    indent=2,
                    default=str  # ✅ converts Timestamps and other types to strings
                )


            prompt = f"""
            You are a blockchain account analyst assistant.
            You have access to this full Subscan dataset for a user's account:
            {snapshot_text}

            Based on this data, answer the following user question:
            {user_query}

            If relevant, suggest actions the user might consider to optimize performance,
            staking rewards, or governance participation.
            """

            with st.spinner("Thinking..."):
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an expert blockchain account advisor."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=800
                )
                st.write(response.choices[0].message.content)