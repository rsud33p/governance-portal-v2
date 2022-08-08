import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getVoteProxyAddresses, VoteProxyAddresses } from '../helpers/getVoteProxyAddresses';
import { MainnetSdk } from '@dethcrypto/eth-sdk-client';

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { useNetwork } from 'modules/web3/hooks/useNetwork';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error?: Error;
};

export const useVoteProxyOldAddress = (account?: string): VoteProxyAddressResponse => {
  const { voteProxyFactoryOld } = useContracts() as MainnetSdk;
  const { network } = useNetwork();

  const { data, error } = useSWR(
    account && network !== SupportedNetworks.MAINNET ? `${account}/vote-proxy-address` : null,
    async () => {
      return await getVoteProxyAddresses(voteProxyFactoryOld, account as string, network);
    }
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
