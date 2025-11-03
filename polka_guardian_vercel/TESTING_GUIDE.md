# Testing Guide - Fixed Features

## Quick Start

```bash
cd polka_guardian_vercel
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Test Checklist

### 1. ✅ Ecosystem Basic Metrics - Default to Polkadot

**Test Steps:**
1. Load the application
2. Verify the "Ecosystem Overview" tab is active by default
3. Check the "Ecosystem Basic Metrics" dropdown
4. **Expected Result:** Should show "Polkadot" as selected (not "All Chains")
5. Click through the tabs (Transfers, Accounts, Events, Extrinsics)
6. Verify all charts display data for Polkadot only
7. Change dropdown to "All Chains" and verify data updates

**Success Criteria:**
- Default value is "Polkadot"
- Charts load faster with filtered data
- Can still select other chains

---

### 2. ✅ Chart Date Range Scaling

**Test Steps:**
1. Navigate to "Ecosystem Overview"
2. Check all charts for null/empty values
3. **Expected Result:** No blank spaces or null values displayed
4. Navigate to "Governance Monitor"
5. Check Monthly Voters chart
6. Check Referenda Outcomes chart
7. Verify all data points are actual values

**Success Criteria:**
- No null/undefined values visible on charts
- X-axis shows only dates with data
- Charts are properly scaled to data range

---

### 3. ✅ Chatbot Data Access Enhancement

**Test Steps:**

**Governance Context:**
1. Click on "Governance Monitor" tab
2. Open the AI Assistant in the sidebar
3. Ask: "How many proposals are in the dataset?"
4. **Expected Result:** AI should reference actual row counts from CSV files
5. Ask: "What are the most common proposal tracks?"
6. Ask: "How many voters participated in governance?"
7. Verify AI provides specific numbers and insights

**Wallet Context:**
1. Enter a Polkadot address: `14Gn7SEmzBx2nKo2dYRrZmigoePAzL1x5NavxzKi5pfVdTC2`
2. Click "Fetch Account Data"
3. Navigate to "Wallet Activity" tab
4. Ask the chatbot: "What is my account balance?"
5. **Expected Result:** AI should mention balance, reserved, locked amounts
6. Ask: "How many transfers do I have?"
7. Ask: "What is my staking activity?"
8. Verify AI references actual wallet data

**Success Criteria:**
- Chatbot references specific numbers from CSV files
- Chatbot knows about available datasets
- Chatbot provides contextual responses about wallet data
- No "I don't have access to..." messages

---

### 4. ✅ High-Level Data Tables with Pagination

**Test Steps:**

**Transfers Tab:**
1. Navigate to "Wallet Activity" tab
2. Click on "Transfers" tab
3. **Expected Result:** See a proper table with columns:
   - Block Number
   - Timestamp
   - From Address
   - To Address
   - Amount
   - Status
   - Hash
4. Verify pagination controls at bottom
5. Click "Items per page" dropdown
6. Change to 5 items per page
7. Verify table updates to show only 5 rows
8. Change to 1 item per page
9. Use pagination buttons (Previous, 1, 2, 3, Next)
10. Verify "Showing X-Y of Z items" updates correctly

**Repeat for other tabs:**
- **Extrinsics Tab:** Should show Block, Timestamp, ID, Module, Name, Status, Fee, Hash
- **Staking Tab:** Should show Era/Block, Event Type, Validator, Amount, Reward, Timestamp
- **Votes Tab:** Should show Referendum ID, Vote (colored), Balance, Conviction, Block, Timestamp

**Recent Proposals:**
1. Navigate to "Governance Monitor" tab
2. Scroll to "Recent Proposals" section
3. **Expected Result:** See table with columns:
   - Proposal ID
   - Title/Description
   - Status (with colored badges)
   - Aye Votes
   - Nay Votes
   - Abstain
   - Track
   - Created Date
4. Test pagination (should show all proposals, not just 20)
5. Use search box to filter proposals
6. Verify pagination updates with filtered results

**Success Criteria:**
- All tables display properly formatted data
- Pagination works smoothly
- Items per page selector updates table correctly
- All data is accessible (no hard limits)
- Status badges are color-coded appropriately
- Addresses display in mono font with proper truncation

---

### 5. ✅ Referenda Outcomes Chart Scaling

**Test Steps:**
1. Navigate to "Governance Monitor" tab
2. Locate "Referenda Outcomes" chart (right side of Monthly Voters)
3. **Expected Result:** Donut chart with color-coded segments
4. Verify colors:
   - Green for Passed/Confirmed
   - Red for Failed/Rejected
   - Blue for Ongoing/Active
5. Hover over segments to see tooltip
6. Check legend at bottom shows status names and counts
7. Verify chart is properly sized and readable

**Success Criteria:**
- Chart uses donut style (with center hole)
- Colors match status semantically
- Legend is clear and informative
- Tooltips show correct data
- Chart is well-proportioned

---

## Performance Testing

### Large Dataset Testing
1. Load wallet with 100+ transfers
2. Navigate through all pages of data
3. Change items per page to 50
4. Verify smooth scrolling and rendering
5. Test search/filter functionality

**Expected Performance:**
- Table renders within 1 second
- Pagination is instant
- No lag when changing pages
- Search filters update immediately

---

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

Test responsive design:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## Error Handling

**Test error scenarios:**
1. Invalid wallet address
2. Network timeout
3. Empty search results
4. No data in table
5. API key not configured (chat)

**Expected Behavior:**
- Graceful error messages
- No crashes or blank screens
- Loading states display properly
- Empty states show helpful messages

---

## API Testing

### Governance Data API
```bash
curl http://localhost:3000/api/governance?type=voters
curl http://localhost:3000/api/governance?type=proposals
curl http://localhost:3000/api/governance?type=ecosystem_metrics
curl http://localhost:3000/api/governance?type=treasury_flow
curl http://localhost:3000/api/governance?type=monthly_voters
curl http://localhost:3000/api/governance?type=referenda_outcomes
```

**Expected:** Each should return JSON with `success: true` and `data` array

### Chat API
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "How many proposals are there?"}],
    "contextType": "governance"
  }'
```

**Expected:** JSON response with AI message referencing data

---

## Known Limitations

1. CSV files are loaded on every chat API call (consider caching for production)
2. Very large tables (10,000+ rows) may have slight performance impact
3. Chart rendering depends on browser performance
4. Mobile view may require horizontal scrolling for wide tables

---

## Troubleshooting

### Build Errors
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Type Errors
```bash
npm run build
# Check output for specific type errors
```

### Linting Errors
```bash
npm run lint
# Fix escaped characters in JSX strings
```

### Data Not Loading
1. Check `/public/data/` folder exists
2. Verify CSV files are present
3. Check browser console for errors
4. Verify API routes are responding

---

## Success Summary

All features should work as follows:

1. ✅ **Default to Polkadot:** Ecosystem metrics load with Polkadot selected
2. ✅ **Clean Charts:** No null values, proper scaling
3. ✅ **Smart Chatbot:** Access to all CSV data and wallet context
4. ✅ **Professional Tables:** Pagination, all data accessible, beautiful design
5. ✅ **Improved Visuals:** Referenda chart uses semantic colors and donut style

The application now provides a complete, professional experience matching the Streamlit version's functionality with modern Next.js architecture.
