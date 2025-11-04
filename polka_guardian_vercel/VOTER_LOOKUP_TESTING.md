# Voter Lookup & Proposal Details Testing Guide

## Test Data

### Sample Voter Addresses (from CSV)

1. **Zooper Corp**
   - Address: `1557x4U7JTAcso9AHpiVfrEsadABQ2swNWhDeh5WvUn9Zdog`
   - Type: Direct Voter
   - Status: Active
   - Total Votes: 1,620
   - Support Ratio: 51.33%

2. **Stake Kat**
   - Address: `155LwjGpJH3xYJwPBr6aapk2WCCAezVftvSMrqeJA6eE7v2d`
   - Type: Direct Voter
   - Status: Active
   - Total Votes: 1,612
   - Support Ratio: 51.22%

## Testing Checklist

### ✅ Voter Lookup Functionality

#### Search Input
- [ ] Search input accepts wallet addresses
- [ ] Search button triggers lookup
- [ ] Enter key triggers lookup
- [ ] Loading state displays during search
- [ ] Empty address shows validation error

#### Voter Found Scenario
- [ ] Success message displays
- [ ] Voter profile card appears with gradient styling
- [ ] Display name or "Anonymous Voter" shows
- [ ] Wallet address displays (shortened and full)
- [ ] Active/Inactive status badge shows correct state
- [ ] Voter type badge displays correctly
- [ ] Last vote date formats properly

#### Voter Statistics
- [ ] Total Votes displays with comma formatting
- [ ] Total Tokens displays with comma formatting
- [ ] Support Ratio shows percentage with 1 decimal
- [ ] Delegates field shows delegation targets or "No Delegation"
- [ ] All 4 metric cards render correctly
- [ ] Hover effects work on metric cards

#### Vote Distribution
- [ ] Pie chart renders correctly
- [ ] Chart shows non-zero segments only
- [ ] Tooltip displays on hover
- [ ] Tooltip shows token count and percentage
- [ ] Aye section shows green color (#10B981)
- [ ] Nay section shows red color (#EF4444)
- [ ] Abstain section shows gray color (#6B7280)
- [ ] Breakdown cards display tokens and percentages
- [ ] Percentages add up to 100%

#### Participation Insights
- [ ] Voting pattern calculates correctly
- [ ] Pattern icon shows (✅ for Aye, ❌ for Nay, ⚖️ for balanced)
- [ ] Pattern text describes tendency
- [ ] Average tokens per vote calculates correctly
- [ ] Activity status matches voter data
- [ ] Voter type displays
- [ ] Delegation info shows if applicable

#### Raw Data
- [ ] "Show/Hide" button toggles raw data
- [ ] Raw data displays as formatted JSON
- [ ] All fields from CSV present

#### Voter Not Found Scenario
- [ ] Error message displays
- [ ] No voter profile card shows
- [ ] Previous search results clear

### ✅ Proposal Display Functionality

#### Proposals List
- [ ] Recent proposals load and display
- [ ] Table shows proposal ID
- [ ] Title displays or fallback to "Referendum #X"
- [ ] Chain and Origin show below title
- [ ] Proposer displays
- [ ] Status badge shows correct color:
  - Green for Passed/Confirmed
  - Red for Rejected/Failed
  - Blue for Ongoing/other
- [ ] Start date formats correctly
- [ ] Pagination works (10 items per page)
- [ ] Search filters proposals correctly

#### Proposal Details
- [ ] Proposal selector dropdown populates
- [ ] Dropdown shows first 50 proposals
- [ ] Dropdown format: "Chain · Origin · ID · Status"
- [ ] Selecting proposal displays details
- [ ] Referendum ID displays
- [ ] Chain displays
- [ ] Origin/Track displays
- [ ] Proposer displays
- [ ] Title displays if available
- [ ] Start time formats correctly
- [ ] End time formats correctly
- [ ] Links extract and display correctly
- [ ] External links open in new tab

#### AI Summary
- [ ] "Summarize with AI" button visible
- [ ] Button shows loading state when clicked
- [ ] AI summary generates successfully
- [ ] Summary displays in styled card
- [ ] Summary includes proposal context
- [ ] Summary explains voting outcome
- [ ] Summary provides voter insights
- [ ] Error handling if API fails

### ✅ UI/UX Checks

#### Responsive Design
- [ ] Mobile view (< 768px) works correctly
- [ ] Tablet view (768px - 1024px) works correctly
- [ ] Desktop view (> 1024px) works correctly
- [ ] Charts resize appropriately
- [ ] Tables scroll horizontally on small screens

#### Visual Styling
- [ ] Polkadot pink gradient on buttons (#FF2670 to #E6007A)
- [ ] Glass card styling applied
- [ ] Hover effects work smoothly
- [ ] Border colors match pink theme
- [ ] Status badges use semantic colors
- [ ] Typography is consistent
- [ ] Spacing is appropriate

#### Animations & Transitions
- [ ] Button hover effects smooth
- [ ] Card hover scale transitions smooth
- [ ] Loading spinners work
- [ ] Chart animations render correctly

#### Accessibility
- [ ] Buttons have proper labels
- [ ] Input has placeholder text
- [ ] Color contrast meets standards
- [ ] Interactive elements keyboard accessible
- [ ] Screen reader friendly text

### ✅ Data Validation

#### CSV Parsing
- [ ] Voters CSV loads without errors
- [ ] Proposals CSV loads without errors
- [ ] Column headers map correctly
- [ ] Numeric fields parse as numbers
- [ ] Boolean fields parse correctly
- [ ] Date fields parse correctly
- [ ] Empty fields handled gracefully

#### Calculations
- [ ] Support ratio = (aye_votes / total_votes) × 100
- [ ] Vote percentages = (vote_tokens / total_tokens) × 100
- [ ] Average tokens per vote = total_tokens / total_votes
- [ ] All calculations handle division by zero

#### Edge Cases
- [ ] Voter with no delegation
- [ ] Voter with all Aye votes
- [ ] Voter with all Nay votes
- [ ] Voter with all Abstain votes
- [ ] Proposal with no title
- [ ] Proposal with no links
- [ ] Proposal with missing fields

### ✅ Integration Tests

#### API Endpoints
- [ ] GET /api/governance?type=voters returns data
- [ ] GET /api/governance?type=proposals returns data
- [ ] POST /api/chat generates AI summaries
- [ ] Error responses handle gracefully

#### Navigation
- [ ] Switching to Governance tab loads components
- [ ] Components maintain state when switching tabs
- [ ] Voter search persists during session
- [ ] Proposal selection persists

#### Performance
- [ ] Initial page load < 3 seconds
- [ ] Voter search response < 1 second
- [ ] Proposal details render instantly
- [ ] AI summary generates < 5 seconds
- [ ] Charts render without lag

## Testing Commands

### Build Test
```bash
cd polka_guardian_vercel
npm run build
```

### Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### Type Check
```bash
npm run type-check
```

## Manual Testing Steps

### Test Voter Lookup

1. Navigate to http://localhost:3000
2. Click "Governance Monitor" tab
3. In Voter Lookup section:
   - Enter: `1557x4U7JTAcso9AHpiVfrEsadABQ2swNWhDeh5WvUn9Zdog`
   - Click "Search"
4. Verify voter profile displays
5. Check all statistics are correct
6. Verify pie chart renders
7. Confirm participation insights show

### Test Proposal Details

1. Scroll to Proposal Details section
2. Click dropdown and select first proposal
3. Verify all proposal fields display
4. Click "Summarize with AI"
5. Wait for AI summary
6. Verify summary is relevant and helpful

### Test Edge Cases

1. Search for non-existent address:
   - Enter: `invalid_address_12345`
   - Verify error message displays
   
2. Select proposal without title:
   - Verify fallback text displays
   
3. Test mobile view:
   - Resize browser to mobile width
   - Verify responsive layout

## Expected Results

### Successful Voter Search
- Profile card with name and address
- 4 metric cards with accurate data
- Pie chart with correct proportions
- Insights with voting pattern analysis
- Expandable raw data section

### Successful Proposal View
- Complete proposal metadata
- Working external links
- AI summary with relevant content
- Status badge with correct color

## Common Issues & Solutions

### Issue: Voter not found
**Solution:** Check address spelling and verify it exists in polkadot_voters.csv

### Issue: Proposals show "Untitled"
**Solution:** Verify CSV column mapping in ProposalsList.tsx

### Issue: Charts not rendering
**Solution:** Check browser console for Recharts errors, verify data format

### Issue: AI summary fails
**Solution:** Verify OpenAI API key is set in environment variables

### Issue: Build fails
**Solution:** Run `npm install` to ensure dependencies are installed

## Browser Compatibility

Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Performance Benchmarks

Target metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## Sign-off

When all tests pass:
- [ ] All features work as expected
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Data displays correctly
- [ ] AI integration functional
- [ ] Performance acceptable

**Tested by:** _____________
**Date:** _____________
**Build Version:** _____________
**Status:** Pass / Fail
