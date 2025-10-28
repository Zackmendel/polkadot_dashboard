import axios from 'axios';

const POLKASSEMBLY_API_BASE_URL = '/api/v1';

interface PolkassemblyResponse<T> {
  data: T;
  status: number;
  error: string;
}

export const fetchPolkassemblyData = async <T>(endpoint: string, data: object): Promise<PolkassemblyResponse<T> | undefined> => {
  try {
    const response = await axios.post<PolkassemblyResponse<T>>(
      `${POLKASSEMBLY_API_BASE_URL}/${endpoint}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Network': 'polkadot',
        },
      }
    );

    if (response.data.error) {
      console.error(`Polkassembly API Error for ${endpoint}:`, response.data.error);
      return undefined;
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching data from Polkassembly API (${endpoint}):`, error.response?.data || error.message);
    } else {
      console.error(`An unexpected error occurred while fetching ${endpoint}:`, error);
    }
    return undefined;
  }
};
