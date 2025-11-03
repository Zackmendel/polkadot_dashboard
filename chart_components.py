"""
Chart components for integrating governance charts into the dashboard.
These functions render charts without standalone page configuration.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


def render_monthly_voters_voting_power():
    """Render Monthly Voters & Voting Power by Type (No Conviction) charts"""
    try:
        df = pd.read_csv("governace_app/data/monthly_voters_voting_power_by_type.csv")
        df["month"] = pd.to_datetime(df["month"]).dt.to_period("M").astype(str)
        
        # Prepare chart data
        chart_data = pd.DataFrame({
            "Month": df["month"].repeat(2),
            "Type": ["Delegated", "Direct"] * len(df),
            "Voters": df["delegated_voters"].tolist() + df["direct_voters"].tolist(),
            "Voting Power": df["delegated_voting_power"].tolist() + df["direct_voting_power"].tolist()
        })
        
        st.subheader("📈 Monthly Voters & Voting Power by Type (No Conviction)")
        
        # Create columns: 2:1 ratio
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Metric selector
            metric = st.selectbox("Select Metric", ["Voters", "Voting Power"], key="monthly_metric_selector")
            
            fig = px.bar(
                chart_data,
                x="Month",
                y=metric,
                color="Type",
                barmode="group",
                text_auto=".2s",
                title=f"Monthly {metric} by Type (Delegated vs Direct)",
            )
            
            fig.update_layout(
                xaxis_title="Month",
                yaxis_title=metric,
                legend_title="Type",
                bargap=0.15,
                template="plotly_white",
            )
            
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("🗳️ Referenda Outcomes")
            
            # Load referenda outcome data
            df_outcome = pd.read_csv("governace_app/data/polkadot_number_of_referenda_by_outcome_opengov.csv")
            
            pie_fig = px.pie(
                df_outcome,
                values="count",
                names="status",
                title="Referenda by Outcome",
                color_discrete_sequence=px.colors.qualitative.Pastel
            )
            
            pie_fig.update_traces(textposition="inside", textinfo="percent+label")
            pie_fig.update_layout(showlegend=False)
            
            st.plotly_chart(pie_fig, use_container_width=True)
    
    except Exception as e:
        st.error(f"Error loading monthly voters chart: {e}")


def render_ecosystem_basic_metrics():
    """Render Ecosystem Basic Metrics charts"""
    try:
        st.subheader("🌍 Ecosystem Basic Metrics")
        
        # Load ecosystem metrics
        eco_df = pd.read_csv("governace_app/data/polkadot_ecosystem_metrics_raw_data.csv")
        
        # Clean & prepare
        eco_df["block_time"] = pd.to_datetime(eco_df["block_time"])
        eco_df = eco_df.sort_values("block_time")
        
        # Handle missing chain column gracefully
        if "chain" not in eco_df.columns:
            eco_df["chain"] = "Polkadot"
        
        # --- Chain selection dropdown ---
        available_chains = sorted(eco_df["chain"].dropna().unique().tolist())
        default_chain = "Polkadot" if "Polkadot" in available_chains else available_chains[0]
        chain_options = ["All Chains"] + available_chains
        
        selected_chain = st.selectbox(
            "🔗 Select Chain",
            options=chain_options,
            index=chain_options.index(default_chain),
            key="ecosystem_chain_selector"
        )
        
        # Filter data by chain (unless "All Chains" is selected)
        if selected_chain != "All Chains":
            eco_df = eco_df[eco_df["chain"] == selected_chain]
        
        # Tabs for metrics
        tab1, tab2, tab3, tab4 = st.tabs([
            "🏦 Daily Transfers",
            "👥 Active Accounts",
            "⚙️ Events",
            "🧩 Extrinsics"
        ])
        
        # --- Helper function for stacked column chart ---
        def plot_metric(df, y_col, title, y_label, color_palette):
            fig = px.bar(
                df,
                x="block_time",
                y=y_col,
                color="chain",
                barmode="stack",
                title=title,
                text_auto=True,
                color_discrete_sequence=color_palette
            )
            fig.update_layout(
                xaxis_title="Date",
                yaxis_title=y_label,
                legend_title="Chain",
                bargap=0.2,
                template="plotly_white",
                hovermode="x unified"
            )
            fig.update_traces(textfont_size=10)
            return fig
        
        # --- Tab 1: Daily Transfers ---
        with tab1:
            if "transfers_cnt" in eco_df.columns:
                st.plotly_chart(
                    plot_metric(
                        eco_df, "transfers_cnt",
                        f"Daily Transfers ({selected_chain})",
                        "Number of Transfers",
                        px.colors.qualitative.Safe
                    ),
                    use_container_width=True
                )
            else:
                st.info("No transfer data available.")
        
        # --- Tab 2: Active Accounts ---
        with tab2:
            if "active_cnt" in eco_df.columns:
                st.plotly_chart(
                    plot_metric(
                        eco_df, "active_cnt",
                        f"Daily Active Accounts ({selected_chain})",
                        "Active Accounts",
                        px.colors.qualitative.Bold
                    ),
                    use_container_width=True
                )
            else:
                st.info("No active accounts data available.")
        
        # --- Tab 3: Events ---
        with tab3:
            if "events_cnt" in eco_df.columns:
                st.plotly_chart(
                    plot_metric(
                        eco_df, "events_cnt",
                        f"Daily Events ({selected_chain})",
                        "Number of Events",
                        px.colors.qualitative.Pastel
                    ),
                    use_container_width=True
                )
            else:
                st.info("No events data available.")
        
        # --- Tab 4: Extrinsics ---
        with tab4:
            if "extrinsics_cnt" in eco_df.columns:
                st.plotly_chart(
                    plot_metric(
                        eco_df, "extrinsics_cnt",
                        f"Daily Extrinsics ({selected_chain})",
                        "Number of Extrinsics",
                        px.colors.qualitative.Prism
                    ),
                    use_container_width=True
                )
            else:
                st.info("No extrinsics data available.")
    
    except Exception as e:
        st.error(f"Error loading ecosystem metrics: {e}")


def render_treasury_flow():
    """Render Polkadot Treasury Flow chart"""
    try:
        st.subheader("💰 Polkadot Treasury Flow")
        
        # Load treasury flow data
        df = pd.read_csv("governace_app/data/polkadot_treasury_flow.csv")
        
        # Clean and prepare data
        df["block_time"] = pd.to_datetime(df["block_time"])
        df = df.sort_values("block_time")
        
        # Columns to stack (excluding net_flow)
        stack_cols = ["bounties", "burnt", "inflation", "proposal", "txn_fees", "txn_tips"]
        
        # Create the figure
        fig = go.Figure()
        
        # Add stacked bar traces
        for col in stack_cols:
            if col in df.columns:
                fig.add_trace(
                    go.Bar(
                        x=df["block_time"],
                        y=df[col],
                        name=col.replace("_", " ").title(),
                        hovertemplate="%{y:,.0f}<extra>" + col + "</extra>"
                    )
                )
        
        # Add line trace for net flow
        if "net_flow" in df.columns:
            fig.add_trace(
                go.Scatter(
                    x=df["block_time"],
                    y=df["net_flow"],
                    name="Net Flow",
                    mode="lines+markers",
                    line=dict(color="black", width=3),
                    marker=dict(size=6),
                    hovertemplate="Net Flow: %{y:,.0f}<extra></extra>"
                )
            )
        
        # Layout customization
        fig.update_layout(
            barmode="relative",
            title="Polkadot Treasury Flow (Stacked Columns + Net Flow Line)",
            xaxis_title="Date",
            yaxis_title="Amount (DOT)",
            template="plotly_white",
            legend_title="Category",
            hovermode="x unified",
            bargap=0.2,
            height=600
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    except Exception as e:
        st.error(f"Error loading treasury flow chart: {e}")
