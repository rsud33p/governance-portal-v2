import { useNetwork } from 'modules/web3/hooks/useNetwork';
import useSWR, { SWRResponse, useSWRConfig } from 'swr';
import { DelegatesAPIResponse } from '../types';

export const useDelegates = (): SWRResponse<DelegatesAPIResponse> => {
  const { network } = useNetwork();
  const { cache } = useSWRConfig();
  const dataKey = `/api/delegates?network=${network}`;

  return useSWR<DelegatesAPIResponse>(dataKey, null, {
    // refresh every 30 mins
    refreshInterval: 1800000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKey),
    revalidateOnReconnect: false
  });
};
