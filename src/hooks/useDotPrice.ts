import { useLoadableResource } from './useLoadableResource';
import { fetchDotPrice } from '../utils/priceService';

const DOT_PRICE_RESOURCE_KEY = 'dot-usd-price';

export const useDotPrice = () =>
  useLoadableResource<number>({
    key: DOT_PRICE_RESOURCE_KEY,
    fetcher: fetchDotPrice,
    initialData: 0,
    getIsEmpty: () => false,
  });
