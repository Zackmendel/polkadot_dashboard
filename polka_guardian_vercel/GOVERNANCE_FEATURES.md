# Governance Features Documentation

## Overview
The Governance Monitor section provides comprehensive tools for exploring Polkadot and Kusama governance data, including voter lookup, proposal details, and AI-powered analysis.

## Features

### 1. Voter Lookup 🔍

Search for any wallet address in the governance database to view detailed voter information.

**Location:** Top of Governance Monitor tab

**Features:**
- Real-time wallet address search
- Voter profile display with identity and status
- Comprehensive voting statistics
- Visual vote distribution chart
- Participation insights and patterns
- Raw voter data export

**Voter Profile Information:**
- Display name or anonymous status
- Wallet address (full and shortened)
- Active/Inactive status badge
- Voter type (Direct Voter, Delegator, Mixed)
- Last vote timestamp

**Voting Statistics (4 Metrics):**
1. **Total Votes Cast** - Number of governance votes
2. **Total Tokens** - Total tokens used in voting
3. **Support Ratio** - Percentage of Aye votes
4. **Delegates To** - Delegation targets (if applicable)

**Vote Distribution:**
- Pie chart visualization
- Aye votes (tokens and percentage)
- Nay votes (tokens and percentage)
- Abstain votes (tokens and percentage)

**Participation Insights:**
- Voting pattern analysis (Support/Oppose/Balanced)
- Average tokens per vote
- Activity status
- Voter type classification
- Delegation information

### 2. Monthly Voters Chart 📊

Displays monthly governance participation metrics by voter type.

**Metrics:**
- Monthly voter counts
- Voting power distribution
- Trends over time

### 3. Recent Proposals 📋

Browse and search through governance proposals.

**Features:**
- Paginated table view
- Search by title, proposer, origin, or chain
- Status badges (Passed, Rejected, Ongoing)
- Proposal metadata display

**Displayed Information:**
- Proposal ID
- Title/Description
- Chain and Origin/Track
- Proposer
- Status
- Start Date

### 4. Proposal Details 📋

Select and explore individual proposals in detail.

**Features:**
- Dropdown selector for proposals
- Full proposal metadata display
- External links (Dune Analytics, Polkassembly)
- AI-powered proposal summaries

**Proposal Information:**
- Referendum ID
- Chain
- Origin/Track
- Proposer
- Title (if available)
- Start and end times
- Voting outcome
- Related links

**AI Summary:**
- Click "Summarize with AI" button
- Generates concise proposal summary
- Explains voting outcome
- Provides insights for voters

## Data Sources

All governance data is loaded from CSV files in `/public/data/`:

1. **polkadot_voters.csv** - Voter statistics and profiles
2. **proposals.csv** - Proposal data and metadata
3. **monthly_voters_voting_power_by_type.csv** - Monthly participation metrics

## CSV Column Mapping

### Voters CSV
```
abstain_tokens, aye_tokens, delegates, is_active, last_vote_time,
nay_tokens, support_ratio_pct, total_tokens_cast, total_votes,
voter, voter_name, voter_type
```

### Proposals CSV
```
chain, end_block, end_hash, end_time, origin, proposed_by,
proposed_by_name, proposed_by_url, referenda_id, referenda_url,
start_block_number, start_time, status, title
```

## API Endpoints

### Get Governance Data
```
GET /api/governance?type={dataType}
```

**Supported Types:**
- `voters` - Voter statistics
- `proposals` - Proposal data
- `monthly_voters` - Monthly participation
- `ecosystem_metrics` - Ecosystem data
- `treasury_flow` - Treasury metrics
- `referenda_outcomes` - Referendum outcomes

## UI Components

### VoterLookup
- Search input with validation
- Voter profile card with gradient styling
- Voting statistics grid
- Vote distribution chart (Recharts)
- Participation insights
- Raw data toggle

### ProposalDetails
- Proposal selector dropdown
- Detailed proposal display
- Link extraction and formatting
- AI summary generation
- Status badges

### ProposalsList
- Paginated data table
- Search functionality
- Status color coding
- Responsive layout

## Color Scheme

Following Polkadot brand guidelines:

**Primary Colors:**
- Polkadot Pink: #FF2670
- Primary Pink: #E6007A

**Semantic Colors:**
- Success/Aye: #10B981 (Green)
- Error/Nay: #EF4444 (Red)
- Info/Abstain: #6B7280 (Gray)
- Active: #10B981 (Green)

**Chart Colors:**
- Aye: #10B981
- Nay: #EF4444
- Abstain: #6B7280

## Usage Examples

### Search for a Voter

1. Navigate to Governance Monitor tab
2. Enter wallet address in search field
3. Click "Search" button
4. View voter profile and statistics

### Explore a Proposal

1. Scroll to Proposal Details section
2. Select proposal from dropdown
3. Review proposal metadata
4. Click "Summarize with AI" for analysis

### View Monthly Trends

1. Check Monthly Voters Chart
2. Observe participation patterns
3. Compare voter types over time

## Performance Optimizations

- CSV data cached in browser
- Paginated tables (10 items per page default)
- Lazy loading of proposal details
- Efficient chart rendering with Recharts
- Search filtering on client-side

## Error Handling

- Graceful handling of missing voter data
- Fallback values for empty fields
- User-friendly error messages
- Loading states for async operations

## Future Enhancements

- Filter proposals by chain/status
- Export voter data as CSV/JSON
- Compare multiple voters
- Historical voting trends
- Delegation network visualization
- Real-time governance updates
