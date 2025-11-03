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
        
        # Custom CSS for voter details
        st.markdown("""
        <style>
            .voter-profile-card {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
                border: 2px solid rgba(102, 126, 234, 0.3);
                border-radius: 20px;
                padding: 2rem;
                margin: 1.5rem 0;
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
            }
            .voter-name {
                font-size: 1.8rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            .voter-address {
                font-family: monospace;
                font-size: 0.9rem;
                background: rgba(0, 0, 0, 0.2);
                padding: 0.5rem 1rem;
                border-radius: 8px;
                display: inline-block;
            }
            .voter-badge {
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                margin: 0.5rem 0.5rem 0.5rem 0;
            }
            .badge-active { background: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid #10B981; }
            .badge-inactive { background: rgba(107, 114, 128, 0.2); color: #9CA3AF; border: 1px solid #6B7280; }
            .badge-type { background: rgba(102, 126, 234, 0.2); color: #667eea; border: 1px solid #667eea; }
            .vote-stat-card {
                background: rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                transition: transform 0.2s;
            }
            .vote-stat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            }
            .vote-stat-value {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            .vote-stat-label {
                font-size: 0.875rem;
                opacity: 0.7;
                text-transform: uppercase;
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
            }
            .bar-aye { background: linear-gradient(90deg, #10B981 0%, #059669 100%); }
            .bar-nay { background: linear-gradient(90deg, #EF4444 0%, #DC2626 100%); }
            .bar-abstain { background: linear-gradient(90deg, #6B7280 0%, #4B5563 100%); }
        </style>
        """, unsafe_allow_html=True)
        
        # Voter Profile Card
        activity_status = "Active" if is_active else "Inactive"
        activity_badge_class = "badge-active" if is_active else "badge-inactive"
        activity_icon = "🟢" if is_active else "⚫"
        display_name = voter_name if voter_name else "Anonymous Voter"
        avatar_emoji = voter_name[:2] if voter_name and len(voter_name) >= 2 else "👤"
        
        st.markdown(f"""
        <div class="voter-profile-card">
            <div class="voter-profile-header">
                <div class="voter-avatar">{avatar_emoji}</div>
                <div>
                    <div class="voter-name">{display_name}</div>
                    <div class="voter-address">{voter_address[:20]}...{voter_address[-10:]}</div>
                </div>
            </div>
            <div>
                <span class="voter-badge {activity_badge_class}">{activity_icon} {activity_status}</span>
                <span class="voter-badge badge-type">📝 {voter_type}</span>
                <span class="voter-badge badge-type">🕐 Last: {last_vote[:10] if last_vote != 'N/A' else 'N/A'}</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.code(voter_address, language=None)
        
        # Voting Statistics
        st.subheader("📊 Voting Statistics")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown(f"""
            <div class="vote-stat-card">
                <div class="vote-stat-value" style="color: #64ffda;">🗳️ {total_votes:,}</div>
                <div class="vote-stat-label">Total Votes</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
            <div class="vote-stat-card">
                <div class="vote-stat-value" style="color: #667eea;">💎 {total_tokens:,.0f}</div>
                <div class="vote-stat-label">Total Tokens</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div class="vote-stat-card">
                <div class="vote-stat-value" style="color: #10B981;">✅ {support_ratio:.1f}%</div>
                <div class="vote-stat-label">Support Ratio</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col4:
            if delegates:
                delegate_display = delegates[:15] + "..." if len(delegates) > 15 else delegates
                st.markdown(f"""
                <div class="vote-stat-card">
                    <div class="vote-stat-value" style="color: #f59e0b; font-size: 1rem;">🔗 {delegate_display}</div>
                    <div class="vote-stat-label">Delegates</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="vote-stat-card">
                    <div class="vote-stat-value" style="opacity: 0.5;">—</div>
                    <div class="vote-stat-label">No Delegation</div>
                </div>
                """, unsafe_allow_html=True)
        
        # Vote Distribution
        st.markdown("### 🎯 Vote Distribution")
        
        total_voting_tokens = aye_tokens + nay_tokens + abstain_tokens
        if total_voting_tokens > 0:
            aye_pct = (aye_tokens / total_voting_tokens) * 100
            nay_pct = (nay_tokens / total_voting_tokens) * 100
            abstain_pct = (abstain_tokens / total_voting_tokens) * 100
        else:
            aye_pct = nay_pct = abstain_pct = 0
        
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
        
        # Breakdown
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown(f"""
            <div style="text-align: center; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 12px;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #10B981;">✅ Aye</div>
                <div style="font-size: 1.2rem;">{aye_tokens:,.0f}</div>
                <div style="font-size: 0.875rem; opacity: 0.7;">{aye_pct:.1f}%</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
            <div style="text-align: center; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 12px;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #EF4444;">❌ Nay</div>
                <div style="font-size: 1.2rem;">{nay_tokens:,.0f}</div>
                <div style="font-size: 0.875rem; opacity: 0.7;">{nay_pct:.1f}%</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div style="text-align: center; padding: 1rem; background: rgba(107, 114, 128, 0.1); border-radius: 12px;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #6B7280;">⚪ Abstain</div>
                <div style="font-size: 1.2rem;">{abstain_tokens:,.0f}</div>
                <div style="font-size: 0.875rem; opacity: 0.7;">{abstain_pct:.1f}%</div>
            </div>
            """, unsafe_allow_html=True)
        
        # Insights
        st.markdown("### 📈 Voting Insights")
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
        <div style="background: rgba(0, 0, 0, 0.1); padding: 1.5rem; border-radius: 12px; border-left: 4px solid {tendency_color};">
            <h4 style="color: {tendency_color};">{tendency_icon} Voting Pattern</h4>
            <p style="font-size: 1.1rem;">{voting_tendency}</p>
            <ul style="line-height: 1.8;">
                <li><strong>Average tokens per vote:</strong> {avg_tokens_per_vote:,.0f} tokens</li>
                <li><strong>Activity:</strong> {"🟢 Active participant" if is_active else "⚫ Inactive"}</li>
                <li><strong>Type:</strong> {voter_type}</li>
                {"<li><strong>Delegation:</strong> " + delegates + "</li>" if delegates else ""}
            </ul>
        </div>
        """, unsafe_allow_html=True)
        
        # Raw data in expander
        with st.expander("📋 View All Raw Voter Data"):
            st.dataframe(voter_info)

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
