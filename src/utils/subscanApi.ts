import axios from 'axios';

const SUBSCAN_API_KEY = import.meta.env.VITE_SUBSCAN_API_KEY //|| 'f33ea5db0e6c4d44b0e21d50fb7e2c4f'; // Fallback to hardcoded key
// const SUBSCAN_API_BASE_URL = '/api/v2/scan';
const SUBSCAN_API_BASE_URL = 'https://polkadot.api.subscan.io/api/v2/scan';


interface SubscanResponse<T> {
  code: number;
  message: string;
  generated_at: number;
  data: T;
}

export const fetchSubscanData = async <T>(endpoint: string, data: object): Promise<SubscanResponse<T> | undefined> => {
  if (!SUBSCAN_API_KEY) {
    console.error('SUBSCAN_API_KEY is not set.');
    return;
  }

  try {
    const response = await axios.post<SubscanResponse<T>>(
      `${SUBSCAN_API_BASE_URL}/${endpoint}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': SUBSCAN_API_KEY,
        },
      }
    );

    if (response.data.code !== 0) {
      console.error(`Subscan API Error for ${endpoint}:`, response.data.message);
      return undefined;
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching data from Subscan API (${endpoint}):`, error.response?.data || error.message);
    } else {
      console.error(`An unexpected error occurred while fetching ${endpoint}:`, error);
    }
    return undefined;
  }
};
