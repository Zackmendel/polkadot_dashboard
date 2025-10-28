import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type LoadableState<TData> = {
  data: TData;
  status: LoadStatus;
  error: string | null;
  isRefreshing: boolean;
  lastUpdated: number | null;
};

interface CacheEntry<TData> {
  data: TData;
  status: LoadStatus;
  lastUpdated: number;
}

export type LoadStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface RefreshOptions {
  silent?: boolean;
  force?: boolean;
}

export interface RefreshResult<TData> {
  status: LoadStatus;
  data: TData;
}

interface UseLoadableResourceParams<TData> {
  key: string | null | undefined;
  fetcher: () => Promise<TData>;
  initialData: TData;
  getIsEmpty?: (data: TData) => boolean;
}

export const useLoadableResource = <TData>({
  key,
  fetcher,
  initialData,
  getIsEmpty = () => false,
}: UseLoadableResourceParams<TData>) => {
  const cacheRef = useRef<Map<string, CacheEntry<TData>>>(new Map());
  const fetcherRef = useRef(fetcher);
  const getIsEmptyRef = useRef(getIsEmpty);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    getIsEmptyRef.current = getIsEmpty;
  }, [getIsEmpty]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const [state, setState] = useState<LoadableState<TData>>({
    data: initialData,
    status: 'idle',
    error: null,
    isRefreshing: false,
    lastUpdated: null,
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const isMountedRef = useRef(true);
  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  const safeSetState = useCallback(
    (value: LoadableState<TData> | ((prev: LoadableState<TData>) => LoadableState<TData>)) => {
      if (!isMountedRef.current) {
        return;
      }

      setState(value);
    },
    [],
  );

  const refresh = useCallback(
    async ({ silent = false, force = false }: RefreshOptions = {}): Promise<RefreshResult<TData>> => {
      const resourceKey = key;

      if (!resourceKey) {
        const fallback = initialDataRef.current;
        safeSetState({
          data: fallback,
          status: 'idle',
          error: null,
          isRefreshing: false,
          lastUpdated: null,
        });
        return { status: 'idle', data: fallback };
      }

      const cacheEntry = cacheRef.current.get(resourceKey);
      const hasCacheEntry = Boolean(cacheEntry);
      const useCacheForDisplay = hasCacheEntry && !force;
      const showFullLoading = !useCacheForDisplay;
      const showRefreshingIndicator = hasCacheEntry && !silent;

      safeSetState((prev) => ({
        ...prev,
        status: showFullLoading ? 'loading' : prev.status,
        error: null,
        isRefreshing: showRefreshingIndicator,
      }));

      try {
        const data = await fetcherRef.current();
        const computedStatus: LoadStatus = getIsEmptyRef.current(data) ? 'empty' : 'success';
        const timestamp = Date.now();

        cacheRef.current.set(resourceKey, {
          data,
          status: computedStatus,
          lastUpdated: timestamp,
        });

        if (key === resourceKey) {
          safeSetState({
            data,
            status: computedStatus,
            error: null,
            isRefreshing: false,
            lastUpdated: timestamp,
          });
        }

        return { status: computedStatus, data };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        const fallbackData = cacheEntry?.data ?? stateRef.current.data ?? initialDataRef.current;

        if (key !== resourceKey) {
          return { status: 'error', data: fallbackData };
        }

        safeSetState((prev) => ({
          ...prev,
          status: 'error',
          error: message,
          isRefreshing: false,
        }));

        return { status: 'error', data: fallbackData };
      }
    },
    [key, safeSetState],
  );

  useEffect(() => {
    if (!key) {
      safeSetState({
        data: initialDataRef.current,
        status: 'idle',
        error: null,
        isRefreshing: false,
        lastUpdated: null,
      });
      return;
    }

    const cached = cacheRef.current.get(key);

    if (cached) {
      safeSetState((prev) => ({
        ...prev,
        data: cached.data,
        status: cached.status,
        error: null,
        isRefreshing: false,
        lastUpdated: cached.lastUpdated,
      }));

      refresh({ silent: true });
      return;
    }

    safeSetState({
      data: initialDataRef.current,
      status: 'loading',
      error: null,
      isRefreshing: false,
      lastUpdated: null,
    });

    refresh();
  }, [key, refresh, safeSetState]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  );
};
