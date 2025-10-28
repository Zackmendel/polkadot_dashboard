import axios from 'axios';

const COINGECKO_SIMPLE_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price';

let cachedDotPrice = 0;
let lastUpdatedAt: number | null = null;

export const fetchDotPrice = async (): Promise<number> => {
  try {
    const response = await axios.get(COINGECKO_SIMPLE_PRICE_URL, {
      params: {
        ids: 'polkadot',
        vs_currencies: 'usd',
      },
      timeout: 5000,
    });

    const price = response.data?.polkadot?.usd;

    if (typeof price === 'number' && Number.isFinite(price)) {
      cachedDotPrice = price;
      lastUpdatedAt = Date.now();
      return price;
    }

    return cachedDotPrice > 0 ? cachedDotPrice : 0;
  } catch (error) {
    return cachedDotPrice > 0 ? cachedDotPrice : 0;
  }
};

export const getCachedDotPrice = () => cachedDotPrice;

export const getDotPriceLastUpdated = () => lastUpdatedAt;

export const __testing = {
  resetCache: () => {
    cachedDotPrice = 0;
    lastUpdatedAt = null;
  },
};
