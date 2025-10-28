import axios from 'axios';

const SUBSCAN_API_KEY = process.env.SUBSCAN_API_KEY || 'f33ea5db0e6c4d44b0e21d50fb7e2c4f'; // Fallback to hardcoded key
const SUBSCAN_API_BASE_URL = 'https://polkadot.api.subscan.io/api/v2/scan';

async function getAccountTokens(address: string) {
  if (!SUBSCAN_API_KEY) {
    console.error('SUBSCAN_API_KEY is not set.');
    return;
  }

  try {
    const response = await axios.post(
      `${SUBSCAN_API_BASE_URL}/account/tokens`,
      {
        address: address,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': SUBSCAN_API_KEY,
        },
      }
    );

    console.log(`Account tokens for ${address}:`, response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching account tokens:', error.response?.data || error.message);
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}

// Use the provided Polkadot address for testing
const testAddress = '11EkjRhVqEQzMZVxiaCu6bq9Jze7rHQF3DWpykrPeTfs6ek';
getAccountTokens(testAddress);
