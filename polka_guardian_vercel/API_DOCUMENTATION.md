# Polka Guardian API Documentation

Complete API reference for all endpoints in the Polka Guardian application.

## Base URL

**Development:** `http://localhost:3000/api`
**Production:** `https://your-app.vercel.app/api`

## Authentication

All API routes use server-side authentication with environment variables:
- `OPENAI_API_KEY` - Required for chat endpoint
- `SUBSCAN_API_KEY` - Required for wallet data endpoints

## Endpoints

### 1. Subscan Wallet Data

Fetches comprehensive wallet data from Subscan API.

**Endpoint:** `POST /api/subscan`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "chainKey": "polkadot",
  "address": "15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chainKey` | string | Yes | Chain identifier (e.g., "polkadot", "kusama") |
| `address` | string | Yes | Wallet address to query |

**Supported Chain Keys:**
- `polkadot` - Polkadot
- `kusama` - Kusama
- `acala` - Acala
- `astar` - Astar
- `moonbeam` - Moonbeam
- `phala` - Phala
- And 15+ more chains...

**Response:**

```json
{
  "success": true,
  "data": {
    "accountData": {
      "code": 0,
      "message": "Success",
      "data": {
        "account": {
          "address": "15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71",
          "balance": "1234567890000000000",
          "lock": "0",
          "reserved": "0",
          "nonce": 5
        }
      }
    },
    "tokenMetadata": {
      "symbol": "DOT",
      "decimals": 10,
      "price": 7.25
    },
    "transfers": [
      {
        "from": "...",
        "to": "...",
        "amount": "1000000000000",
        "block_num": 12345678,
        "block_timestamp": 1698765432,
        "hash": "0x..."
      }
    ],
    "extrinsics": [
      {
        "block_num": 12345678,
        "extrinsic_index": "12345678-2",
        "call_module": "balances",
        "call_module_function": "transfer",
        "success": true,
        "block_timestamp": 1698765432
      }
    ],
    "staking": [
      {
        "event_id": "Reward",
        "amount": "100000000000",
        "block_num": 12345678,
        "block_timestamp": 1698765432
      }
    ],
    "votes": [
      {
        "referendum_index": 123,
        "vote": "Aye",
        "block_num": 12345678,
        "block_timestamp": 1698765432
      }
    ],
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Response:**

```json
{
  "error": "Subscan API key not configured"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (missing parameters)
- `500` - Server Error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/subscan \
  -H "Content-Type: application/json" \
  -d '{
    "chainKey": "polkadot",
    "address": "15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71"
  }'
```

---

### 2. Governance Data

Serves governance data from CSV files.

**Endpoint:** `GET /api/governance`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Type of governance data to fetch |

**Supported Types:**

| Type | Description | Data Source |
|------|-------------|-------------|
| `voters` | List of all voters | `polkadot_voters.csv` |
| `proposals` | Recent proposals | `proposals.csv` |
| `monthly_voters` | Monthly voting trends | `monthly_voters_voting_power_by_type.csv` |
| `ecosystem_metrics` | Ecosystem metrics | `polkadot_ecosystem_metrics_raw_data.csv` |
| `treasury_flow` | Treasury flow data | `polkadot_treasury_flow.csv` |
| `referenda_outcomes` | Referendum outcomes | `polkadot_number_of_referenda_by_outcome_opengov.csv` |

**Example Request:**
```
GET /api/governance?type=voters
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "address": "...",
      "votes_count": 42,
      "total_voting_power": "1000000000000"
    },
    // ... more records
  ]
}
```

**Error Response:**

```json
{
  "error": "Invalid data type"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid type)
- `500` - Server Error

**Example cURL:**
```bash
curl http://localhost:3000/api/governance?type=voters
```

**Response Examples by Type:**

#### Voters
```json
{
  "success": true,
  "data": [
    {
      "address": "15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71",
      "votes_count": 42,
      "total_voting_power": "1000000000000"
    }
  ]
}
```

#### Proposals
```json
{
  "success": true,
  "data": [
    {
      "referendumIndex": 123,
      "title": "Treasury Proposal: Fund Development",
      "track": "root",
      "status": "Confirmed",
      "proposer": "15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71",
      "content": "Proposal description...",
      "ayeVotes": 1000,
      "nayVotes": 100,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Monthly Voters
```json
{
  "success": true,
  "data": [
    {
      "month": "2024-01",
      "delegated_voters": 500,
      "direct_voters": 300,
      "delegated_voting_power": 1000000,
      "direct_voting_power": 500000
    }
  ]
}
```

#### Ecosystem Metrics
```json
{
  "success": true,
  "data": [
    {
      "block_time": "2024-01-01T00:00:00Z",
      "chain": "Polkadot",
      "transfers_cnt": 1000,
      "active_cnt": 500,
      "events_cnt": 5000,
      "extrinsics_cnt": 2000
    }
  ]
}
```

#### Treasury Flow
```json
{
  "success": true,
  "data": [
    {
      "block_time": "2024-01-01T00:00:00Z",
      "bounties": 100000,
      "burnt": 50000,
      "inflation": 200000,
      "proposal": 150000,
      "txn_fees": 10000,
      "txn_tips": 5000,
      "net_flow": 105000
    }
  ]
}
```

#### Referenda Outcomes
```json
{
  "success": true,
  "data": [
    {
      "status": "Confirmed",
      "count": 45
    },
    {
      "status": "Rejected",
      "count": 10
    }
  ]
}
```

---

### 3. AI Chat

OpenAI-powered chat endpoint for wallet and governance insights.

**Endpoint:** `POST /api/chat`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is the balance of this wallet?"
    }
  ],
  "context": "{\"accountData\": {...}}",
  "contextType": "wallet"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | array | Yes | Array of chat messages |
| `context` | string | No | JSON string of wallet/governance data |
| `contextType` | string | No | Either "wallet" or "governance" |

**Message Format:**
```typescript
{
  role: 'user' | 'assistant' | 'system',
  content: string
}
```

**Context Types:**
- `wallet` - Wallet analytics mode
- `governance` - Governance insights mode

**Response:**

```json
{
  "success": true,
  "message": "Based on the data, this wallet has a free balance of 123.45 DOT..."
}
```

**Error Response:**

```json
{
  "error": "OpenAI API key not configured"
}
```

**Status Codes:**
- `200` - Success
- `500` - Server Error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain this wallet activity"}
    ],
    "contextType": "wallet"
  }'
```

**OpenAI Model:**
- Model: `gpt-4o-mini`
- Temperature: `0.7`
- Max Tokens: `1000`

**Rate Limiting:**
- Implemented at OpenAI level
- Typical limit: 200 requests/minute
- Cost: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens

---

## Error Handling

All endpoints return consistent error formats:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Error Codes:**

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request - Invalid parameters |
| 500 | Internal Server Error |

## Rate Limiting

- **Subscan API**: Varies by plan (typically 5 requests/second)
- **OpenAI API**: 200 requests/minute on free tier
- **Application**: No built-in rate limiting (relies on upstream APIs)

## CORS

CORS is configured to allow all origins in development. In production, configure based on your domain.

## Data Formats

### Timestamps
All timestamps are in Unix epoch seconds:
```json
"block_timestamp": 1698765432
```

### Amounts
All amounts are in the smallest unit (Planck for DOT):
```json
"balance": "1234567890000000000"
```

To convert to DOT:
```javascript
const balance = "1234567890000000000"
const decimals = 10
const balanceDOT = parseFloat(balance) / Math.pow(10, decimals)
// Result: 123456789.0 DOT
```

### Addresses
All addresses are in SS58 format:
```json
"address": "15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71"
```

## Client-Side Usage

### React/Next.js Example

```typescript
import axios from 'axios'

// Fetch wallet data
async function fetchWalletData(address: string, chain: string) {
  const response = await axios.post('/api/subscan', {
    chainKey: chain,
    address: address,
  })
  return response.data
}

// Load governance data
async function loadGovernanceData(type: string) {
  const response = await axios.get(`/api/governance?type=${type}`)
  return response.data
}

// Chat with AI
async function sendChatMessage(message: string, context?: any) {
  const response = await axios.post('/api/chat', {
    messages: [{ role: 'user', content: message }],
    context: JSON.stringify(context),
    contextType: 'wallet',
  })
  return response.data
}
```

### JavaScript (Fetch API)

```javascript
// Fetch wallet data
fetch('/api/subscan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chainKey: 'polkadot',
    address: '15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
```

## Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **Input Validation**: All user inputs are validated server-side
3. **Rate Limiting**: Consider implementing application-level rate limiting
4. **CORS**: Configure CORS properly for production
5. **HTTPS**: Always use HTTPS in production

## Caching

- **Subscan data**: Cached client-side using Zustand store
- **Governance data**: Served from static CSV files
- **AI responses**: Not cached (each request is unique)

## Testing

### Using cURL

```bash
# Test subscan endpoint
curl -X POST http://localhost:3000/api/subscan \
  -H "Content-Type: application/json" \
  -d '{"chainKey":"polkadot","address":"15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71"}'

# Test governance endpoint
curl http://localhost:3000/api/governance?type=voters

# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"contextType":"wallet"}'
```

### Using Postman

Import this collection:

```json
{
  "info": {
    "name": "Polka Guardian API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Fetch Wallet Data",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/subscan",
        "body": {
          "mode": "raw",
          "raw": "{\"chainKey\":\"polkadot\",\"address\":\"15g4zgBFXtbPv2JMgf21DQZP851BeMJJqmAsE9R3MMaWea71\"}"
        }
      }
    }
  ]
}
```

## Support

For API issues or questions:
- Check error messages in response
- Review server logs in Vercel dashboard
- Open an issue on GitHub

---

**API Version:** 1.0.0
**Last Updated:** 2024-01-01
