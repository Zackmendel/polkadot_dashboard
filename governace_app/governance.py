import streamlit as st
import pandas as pd
from openai import OpenAI
import os

# ------------- SETUP ----------------
st.set_page_config(page_title="Polkadot & Kusama Governance Monitor", layout="wide")
st.title("🌀 Polkadot & Kusama Governance Dashboard")

# Enter your OpenAI API key once here (env var or Streamlit secrets)
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    try:
        api_key = st.secrets["OPENAI_API_KEY"]  # type: ignore[index]
    except Exception:
        api_key = None

client = OpenAI(api_key=api_key) if api_key else None
if client is None:
    st.warning("OPENAI_API_KEY is not set. Add it to your environment or to .streamlit/secrets.toml as OPENAI_API_KEY to enable AI features.")

# ------------- LOAD DATA ----------------
@st.cache_data
def load_data():
    voters = pd.read_csv("data/polkadot_voters.csv")
    proposals = pd.read_csv("data/proposals.csv")
    return voters, proposals

voters, proposals = load_data()

# ------------- USER INPUT ----------------
wallet_address = st.text_input("🔍 Enter Wallet Address to check details:")

if wallet_address:
    # Ensure we have an address column (alias for the 'voter' column in the CSV)
    if "address" not in voters.columns and "voter" in voters.columns:
        voters = voters.copy()
        voters["address"] = voters["voter"].astype(str).str.strip()

    # Only attempt lookup if address column exists
    if "address" in voters.columns:
        voter_info = voters[voters["address"].astype(str).str.lower() == wallet_address.lower()]
    else:
        voter_info = pd.DataFrame()

    if not voter_info.empty:
        st.subheader("👤 Voter Details")
        st.dataframe(voter_info)

        st.subheader("📊 Voting Summary")
        # Map to available columns in the dataset
        total_tokens_cast = voter_info.get("total_tokens_cast")
        total_votes = voter_info.get("total_votes")
        st.metric("Voting Power (total tokens cast)", float(total_tokens_cast.sum()) if total_tokens_cast is not None else 0)
        st.metric("Number of Votes", int(total_votes.sum()) if total_votes is not None else 0)

    else:
        st.warning("No data found for this wallet address.")

# ------------- PROPOSALS SECTION ----------------
st.subheader("🏛️ Latest Proposals")
st.dataframe(proposals.head(10))

# Select a proposal for details
top_proposals = proposals.head(10).copy()
if "title" not in top_proposals.columns:
    top_proposals["title"] = ""
top_proposals["title"] = top_proposals["title"].fillna("").astype(str).str.strip()

# Build a human-friendly display label when title is empty
def build_display_title(row: pd.Series) -> str:
    if row.get("title"):
        return str(row["title"]).strip()
    chain = str(row.get("chain", "")).strip()
    origin = str(row.get("origin", "")).strip()
    ref_id = str(row.get("referenda_id", "")).strip()
    status = str(row.get("status", "")).strip()
    proposed_by_name = str(row.get("proposed_by_name", "")).strip()
    parts = []
    if chain:
        parts.append(chain)
    if origin:
        parts.append(origin)
    if ref_id:
        parts.append(f"ID {ref_id}")
    if status:
        parts.append(status)
    if not parts and proposed_by_name:
        parts.append(proposed_by_name)
    label = " · ".join(parts)
    return label if label else "(untitled)"

top_proposals["display_title"] = top_proposals.apply(build_display_title, axis=1)

# Use index-based selection to avoid empty matches
selection_index = st.selectbox(
    "Select a proposal to explore:",
    options=list(top_proposals.index),
    format_func=lambda idx: str(top_proposals.loc[idx, "display_title"]),
)
selected_row = top_proposals.loc[selection_index]

# Map displayed fields to columns that exist in the CSV
proposal_id = selected_row.get("referenda_id", "N/A")
proposer_name = selected_row.get("proposed_by_name", selected_row.get("proposed_by", "N/A"))
status = selected_row.get("status", "N/A")
origin = selected_row.get("origin", "N/A")
referenda_url = selected_row.get("referenda_url", "")

st.markdown(f"**Referendum ID:** {proposal_id}")
st.markdown(f"**Proposer:** {proposer_name}")
st.markdown(f"**Origin:** {origin}")
st.markdown(f"**Status:** {status}")
if isinstance(referenda_url, str) and referenda_url:
    st.markdown(f"**Links:** {referenda_url}")
else:
    st.markdown("**Links:** N/A")

# ------------- AI SUMMARIES & SUGGESTIONS ----------------
st.subheader("🤖 AI Summary & Suggestions")

if st.button("Generate AI Summary"):
    if client is None:
        st.error("AI is disabled because OPENAI_API_KEY is not set.")
    else:
        # Build a compact proposals context for the model
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
        Based on the following proposal data, summarize it in simple terms, and suggest what actions
        a voter like the one entered above might take.

        Proposal:
        {selected_row.to_dict()}

        Context (recent proposals snapshot):
        {proposals_context}

        Provide a short summary, insights, and potential reasoning for or against voting YES or NO.
        """
        with st.spinner("Generating summary..."):
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )
        st.success("AI Summary:")
        st.write(response.choices[0].message.content)

# ------------- CHAT WITH AI ----------------
st.subheader("💬 Ask the Governance Assistant")
user_query = st.text_area("Ask me anything about Polkadot or Kusama governance:")

if st.button("Ask"):
    if client is None:
        st.error("AI is disabled because OPENAI_API_KEY is not set.")
    else:
        # Build compact proposals context for the chatbot
        key_columns = [
            c for c in [
                "chain", "origin", "referenda_id", "status", "title",
                "proposed_by_name", "proposed_by", "start_time", "end_time"
            ] if c in proposals.columns
        ]
        proposals_context_df = proposals[key_columns].head(25) if key_columns else proposals.head(10)
        proposals_context = proposals_context_df.to_dict(orient="records")

        with st.spinner("Thinking..."):
            chat_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a Polkadot governance assistant helping users understand referenda, proposals, and voting."},
                    {"role": "user", "content": f"User question: {user_query}\n\nRecent proposals snapshot: {proposals_context}"},
                ]
            )
        st.info(chat_response.choices[0].message.content)
