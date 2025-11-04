# Testing Checklist - Account Overview & Staking Display Fix

## Pre-Testing Setup
- [ ] Ensure Subscan API key is configured in environment variables
- [ ] Start the Next.js development server: `cd polka_guardian_vercel && npm run dev`
- [ ] Have test wallet addresses ready (ideally with staking and delegation data)

## Test Case 1: Balance Overview Display

### Test with Active Wallet (with balance)
Example: `15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71`

**Steps:**
1. Enter wallet address in the input field
2. Select chain (e.g., Polkadot)
3. Click "Fetch Account Data"
4. Navigate to Wallet Activity view
5. Locate the "💰 Balance Overview" card

**Expected Results:**
- [ ] Card displays 4 columns in a grid layout
- [ ] **Column 1 - Total Balance:**
  - Shows balance amount with 2 decimal places and token symbol (e.g., "1,234.56 DOT")
  - Shows USD value with 2 decimal places (e.g., "$5,678.90")
  - Value is not zero or undefined
- [ ] **Column 2 - Transferable:**
  - Shows calculated transferable amount (balance - lock) with 2 decimals
  - Shows USD value with 2 decimal places
  - Amount is green colored (text-green-400)
- [ ] **Column 3 - Locked:**
  - Shows lock amount with 2 decimal places
  - Shows USD value with 2 decimal places
  - Amount is yellow colored (text-yellow-400)
- [ ] **Column 4 - Reserved:**
  - Shows reserved amount (divided by 1e10) with 2 decimal places
  - Shows token price with 4 decimal places (e.g., "$4.5678")
  - Amount is blue colored (text-blue-400)

**Validation:**
- [ ] All numbers are formatted with commas (e.g., 1,234.56)
- [ ] No "NaN", "undefined", or "0.00" for accounts with balance
- [ ] USD calculations are mathematically correct (amount × price)
- [ ] Transferable calculation is correct (balance - lock)

## Test Case 2: Staking Information Display

### Test with Wallet Having Staking Info

**Steps:**
1. Fetch wallet data (as above)
2. Navigate to "Detailed Activity" tabs
3. Click on "Staking" tab

**Expected Results:**

**Staking Information Section:**
- [ ] Heading "Staking Information" is displayed
- [ ] If staking info exists:
  - [ ] "Controller" field shows address in monospace font
  - [ ] "Reward Account" field shows address in monospace font
  - [ ] "Stash" field shows address in monospace font
  - [ ] All addresses are displayed in bordered cards
- [ ] If no staking info exists:
  - [ ] Shows message: "No staking information found"

**Delegations Section:**
- [ ] Heading "Delegations" is displayed
- [ ] If delegations exist:
  - [ ] Table is displayed with 5 columns:
    1. Delegate Display (shows name or 'N/A')
    2. Delegate Address (formatted, monospace)
    3. Conviction (shows conviction value or 'N/A')
    4. Amount (right-aligned, 2 decimals)
    5. Votes (right-aligned, 2 decimals)
  - [ ] Amount values are divided by 1e10
  - [ ] Votes values are divided by 1e10
  - [ ] Table has proper styling (borders, hover states)
- [ ] If no delegations exist:
  - [ ] Shows message: "No delegation data"

## Test Case 3: Empty/No Data States

### Test with Wallet Having No Staking

**Steps:**
1. Fetch wallet data for address without staking
2. Navigate to Staking tab

**Expected Results:**
- [ ] "No staking information found" message is displayed
- [ ] "No delegation data" message is displayed
- [ ] No errors in browser console
- [ ] UI remains stable and styled correctly

## Test Case 4: Calculations Verification

### Mathematical Accuracy

**Manual Verification:**
1. Note down the displayed values:
   - Balance: ________
   - Lock: ________
   - Transferable: ________
   - Reserved (displayed): ________
   - Reserved (raw from API): ________
   - Price USD: ________

2. Verify calculations:
   - [ ] Transferable = Balance - Lock
   - [ ] Balance USD = Balance × Price USD
   - [ ] Lock USD = Lock × Price USD
   - [ ] Transferable USD = Balance USD - Lock USD
   - [ ] Reserved (displayed) = Reserved (raw) / 1e10
   - [ ] Reserved USD = Reserved (displayed) × Price USD

## Test Case 5: Cross-Platform Comparison

### Compare with Streamlit Dashboard

**Steps:**
1. Run Streamlit dashboard: `streamlit run dashboard.py`
2. Fetch data for the same wallet address on both platforms
3. Compare side-by-side

**Expected Results:**
- [ ] Balance values match exactly
- [ ] Transferable values match exactly
- [ ] Locked values match exactly
- [ ] Reserved values match exactly
- [ ] USD values match exactly (accounting for decimal rounding)
- [ ] Staking info matches exactly
- [ ] Delegation data matches exactly

## Test Case 6: UI/UX Validation

### Visual and Interaction Check

**Expected Results:**
- [ ] Balance cards have glass effect styling
- [ ] Hover effects work on metric cards
- [ ] Numbers are readable with proper font sizes
- [ ] Colors are consistent with design (green, yellow, blue for different metrics)
- [ ] Responsive layout works on smaller screens
- [ ] Monospace font is applied to addresses
- [ ] All labels are properly capitalized/formatted

## Test Case 7: Multiple Chains

### Test Different Chain Networks

**Steps:**
1. Test with Polkadot address
2. Test with Kusama address (if applicable)
3. Test with other supported chains

**Expected Results:**
- [ ] Balance displays correctly for each chain
- [ ] Token symbol updates correctly (DOT, KSM, etc.)
- [ ] Token price is specific to the selected chain
- [ ] All calculations remain accurate across chains

## Browser Console Check

**During all tests:**
- [ ] No JavaScript errors in console
- [ ] No TypeScript errors in console
- [ ] No failed API requests (or appropriate error handling)
- [ ] API responses are logged correctly (check structure)

## Edge Cases

### Additional Scenarios to Test

- [ ] Very large balance values (test number formatting)
- [ ] Very small balance values (test decimal precision)
- [ ] Zero balance wallet
- [ ] Wallet with only locked funds (transferable = 0)
- [ ] Invalid wallet address (should show appropriate error)
- [ ] Network timeout (should handle gracefully)

## Final Acceptance Criteria

All of the following must be true:
- [ ] All Balance Overview cards display with correct values
- [ ] All calculations match Streamlit implementation
- [ ] Reserved is correctly divided by 1e10
- [ ] Token price shows 4 decimal places
- [ ] Staking information displays when available
- [ ] Delegations table shows with correct data
- [ ] No data states show appropriate messages
- [ ] No errors in browser console
- [ ] Build completes successfully
- [ ] TypeScript types are correct
- [ ] Linting passes without errors

## Bug Report Template

If issues are found, use this template:

```
**Issue:** [Brief description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Wallet Address:** [Test address used]
**Chain:** [Network used]
**Console Errors:** [Any errors from browser console]
**Screenshot:** [If applicable]
```

## Notes
- Test with real wallet addresses that have actual data
- Compare output with Subscan.io directly to verify API responses
- Check browser DevTools Network tab to inspect API responses
- Verify data structure matches expected format from API documentation
