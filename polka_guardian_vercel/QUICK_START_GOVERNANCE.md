# Quick Start: Governance Features

## 🚀 Getting Started

### 1. Start the Application
```bash
cd polka_guardian_vercel
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### 2. Navigate to Governance Monitor
Click the **"Governance Monitor"** tab in the main navigation.

## 📖 Feature Guide

### 🔍 Voter Lookup

**Purpose:** Search for any Polkadot/Kusama voter and view their governance participation.

**How to Use:**
1. In the "Voter Lookup" section (top of page)
2. Enter a wallet address
3. Click "Search" or press Enter

**Example Addresses to Try:**
- `1557x4U7JTAcso9AHpiVfrEsadABQ2swNWhDeh5WvUn9Zdog` (Zooper Corp)
- `155LwjGpJH3xYJwPBr6aapk2WCCAezVftvSMrqeJA6eE7v2d` (Stake Kat)

**What You'll See:**
- 👤 Voter profile with name and status
- 📊 Voting statistics (votes, tokens, support ratio)
- 🎯 Vote distribution pie chart
- 📈 Participation insights and patterns

### 📊 Monthly Voters Chart

**Purpose:** Visualize governance participation trends over time.

**Features:**
- Monthly voter counts by type
- Voting power distribution
- Time series trends

### 📋 Recent Proposals

**Purpose:** Browse and search governance proposals.

**How to Use:**
1. Scroll to "Recent Proposals" section
2. Use search bar to filter by title, proposer, or chain
3. View paginated results (10 per page)

**Information Shown:**
- Proposal ID
- Title and description
- Chain and origin
- Proposer
- Status (Passed/Rejected/Ongoing)
- Start date

### 📋 Proposal Details

**Purpose:** Explore individual proposals and generate AI summaries.

**How to Use:**
1. Scroll to "Proposal Details" section
2. Select a proposal from dropdown
3. Review detailed information
4. Click "Summarize with AI" for analysis

**AI Summary Includes:**
- What the proposal is about
- Voting outcome explanation
- Insights for voters

## 🎨 UI Features

### Status Colors
- 🟢 **Green** - Passed/Confirmed/Active
- 🔴 **Red** - Rejected/Failed/Inactive
- 🔵 **Blue** - Ongoing/In Progress
- 🟣 **Pink** - Primary actions and branding

### Interactive Elements
- Hover over cards for subtle effects
- Click badges for visual feedback
- Tooltips on charts show detailed info
- Expandable sections for raw data

## 🔧 Technical Details

### Data Sources
All data loaded from CSV files:
- `polkadot_voters.csv` - Voter statistics
- `proposals.csv` - Proposal data
- `monthly_voters_voting_power_by_type.csv` - Monthly metrics

### API Endpoints
- `GET /api/governance?type=voters`
- `GET /api/governance?type=proposals`
- `POST /api/chat` (for AI summaries)

### Performance
- CSV data cached in browser
- Instant client-side search
- Lazy-loaded AI summaries
- Paginated results

## 💡 Tips & Tricks

### Voter Lookup
- Copy addresses from Subscan or Polkassembly
- Search is case-insensitive
- View raw data for debugging

### Proposal Search
- Filter by chain: "Polkadot" or "Kusama"
- Search by proposer name
- Sort by clicking column headers

### AI Summaries
- Generate multiple times for different perspectives
- Use for quick proposal understanding
- Share summaries with team members

## 🐛 Troubleshooting

### "Voter not found"
- Check address spelling
- Ensure address exists in Polkadot/Kusama governance
- Try a different address from the examples

### Proposals show as "Referendum #X"
- This is normal for proposals without titles
- Details still available in full view

### AI summary fails
- Check internet connection
- Verify OpenAI API key is configured
- Try again in a few moments

### Charts not rendering
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

## 📚 Learn More

- **Full Documentation:** See `GOVERNANCE_FEATURES.md`
- **Testing Guide:** See `VOTER_LOOKUP_TESTING.md`
- **Implementation Details:** See `GOVERNANCE_IMPLEMENTATION_SUMMARY.md`

## 🎯 Use Cases

### For Voters
- Check your own governance participation
- Compare your voting patterns
- Track voting history

### For Delegates
- Monitor delegator activity
- Analyze voting trends
- Report on governance participation

### For Researchers
- Study governance patterns
- Analyze proposal outcomes
- Track ecosystem health

### For Community
- Discover active voters
- Find governance participants
- Learn about proposals

## 🚀 Next Steps

1. **Explore Sample Data**
   - Try the example addresses
   - Browse recent proposals
   - Generate AI summaries

2. **Use Real Data**
   - Search for known community members
   - Find specific proposals
   - Track governance participation

3. **Integrate with Workflow**
   - Bookmark favorite voters
   - Monitor proposal outcomes
   - Share insights with team

## 📞 Support

For issues or questions:
- Check documentation files
- Review console logs
- Test with example data first

## 🎉 Enjoy Exploring Governance!

The governance features provide powerful tools for understanding Polkadot and Kusama ecosystem participation. Happy exploring! 🌐
