# Universal Wallet Dashboard (UWD)

## Project Title: Universal Wallet Dashboard (UWD)

### Hackathon: Polkadot Hackathon
### Category: Tooling / Analytics / Multi-Chain Dashboard
### Version: v1.2 (Polkadot-API + Subscan Integration)

## 1. Project Overview

The Universal Wallet Dashboard (UWD) is a cross-parachain wallet analytics tool that aggregates user balances, staking data, governance activity, and transaction insights across the Polkadot ecosystem. It provides users with a unified, real-time, and analytics-driven view of their on-chain activity and portfolio.

### Key Features (MVP):

-   **Wallet Address Input:** Users can paste their Polkadot wallet address to fetch data.
-   **Cross-Parachain Portfolio Aggregation:** Displays token balances across various parachains (DOT, ACA, GLMR, ASTR, PHA, etc.) in native and USD values.
-   **Staking Overview:** Shows staked DOT and parachain-native staking data, including active nominators and average reward APY.
-   **Governance Participation:** Displays proposals voted on, voting history, referenda participation, and outcomes.
-   **Transaction History:** Fetches and displays the latest transactions with details like amount, chain, timestamp, and status.

## 2. Technology Stack

-   **Frontend:** React, Vite, TailwindCSS
-   **Blockchain Connector:** @polkadot/api (for direct Polkadot interaction)
-   **Data Indexing:** Subscan API (for aggregated indexed data)
-   **HTTP Client:** Axios

## 3. Setup and Installation

To get the Universal Wallet Dashboard up and running on your local machine, follow these steps:

### Prerequisites

-   Node.js (LTS version recommended)
-   npm (Node Package Manager)

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd polkadot_dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    In the root directory of the project, create a file named `.env` and add your Subscan API key:
    ```
    SUBSCAN_API_KEY=f33ea5db0e6c4d44b0e21d50fb7e2c4f
    ```
    _Note: The API key is also hardcoded in `src/utils/subscanApi.ts` as a fallback, but using the .env file is recommended for production._

## 4. Running the Project

To start the development server:

```bash
npm run start
```

This will open the application in your browser (usually at `http://localhost:5173`).

## 5. Testing API Integrations

### Polkadot API Test

To verify the `@polkadot/api` integration:

```bash
npm run polkadot-api-test
```

### Subscan API Test

To verify the Subscan API integration for account tokens:

```bash
npm run subscan-test
```

## 6. Future Enhancements

-   WalletConnect / Polkadot.js extension integration.
-   Custom indexer (SubQuery) for enhanced analytics and lower latency.
-   Cross-chain bridge tracking using XCM message indexing.
-   Notifications for governance changes or staking rewards.
-   AI-driven insights: suggestions on better staking, validator performance, or governance engagement.


