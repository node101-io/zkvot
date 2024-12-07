import {
  MutableRefObject,
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';

import { types } from 'zkvot-core';

import ElectionCard from '@/app/elections/(partials)/election-card.jsx';
import Loader from '@/app/elections/(partials)/loader.jsx';

import { fetchElectionsFromBackend } from '@/utils/backend.js';

interface AssignedElectionsProps {
  onlyOngoing?: boolean;
  metamaskWalletAddress?: string;
  auroWalletAddress?: string;
}

const ELECTION_SKIP_PER_REQUEST: number = 100;

const AssignedElections: React.FC<AssignedElectionsProps> = ({
  onlyOngoing = true,
  metamaskWalletAddress,
  auroWalletAddress,
}: {
  onlyOngoing?: boolean;
  metamaskWalletAddress?: string;
  auroWalletAddress?: string;
}) => {
  const [electionData, setElectionData] = useState<
    types.ElectionBackendData[] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  // TODO: fix, gives render error when building
  // const [error, setError] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [skip, setSkip] = useState<number>(0);

  const observer: MutableRefObject<IntersectionObserver | null> = useRef(null);

  if (!metamaskWalletAddress && !auroWalletAddress) {
    // setError('Wallet address not found.');
    return;
  }

  const walletAddresses = useMemo(
    () =>
      [metamaskWalletAddress, auroWalletAddress]
        .filter((any) => any != undefined)
        .map((addr) => addr.toLowerCase()),
    [metamaskWalletAddress, auroWalletAddress]
  );

  const lastElectionElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  useEffect(() => {
    setElectionData(null);
    setSkip(0);
    setHasMore(true);
    // setError('');
    setLoading(true);

    const getElections = async () => {
      try {
        const result = await fetchElectionsFromBackend(0, onlyOngoing);

        if (result instanceof Error) {
          // setError(result.message);
          return;
        }

        let filteredElectionData: types.ElectionBackendData[] = result;

        if (onlyOngoing && walletAddresses.length > 0) {
          filteredElectionData = filteredElectionData.filter(
            (election: types.ElectionBackendData) =>
              election.voters_list.some((voter: { public_key: string }) =>
                walletAddresses.includes(voter.public_key.toLowerCase())
              )
          );
        }

        setElectionData(filteredElectionData);
        setHasMore(result.length < ELECTION_SKIP_PER_REQUEST ? false : true);
        setSkip(result.length);
      } catch (error) {
        console.error('Error fetching elections:', error);
        // setError('Failed to load elections.');
      } finally {
        setLoading(false);
      }
    };

    getElections();
  }, [onlyOngoing, walletAddresses]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await fetchElectionsFromBackend(skip, onlyOngoing);

      if (result instanceof Error) {
        // setError(result.message);
        return;
      }

      let filteredElectionData: types.ElectionBackendData[] = result;

      if (onlyOngoing && walletAddresses.length > 0) {
        filteredElectionData = filteredElectionData.filter(
          (election: types.ElectionBackendData) =>
            election.voters_list.some((voter: { public_key: string }) =>
              walletAddresses.includes(voter.public_key.toLowerCase())
            )
        );
      }

      setElectionData((previousElectionData) => [
        ...(previousElectionData || []),
        ...filteredElectionData,
      ]);
      setHasMore(result.length < ELECTION_SKIP_PER_REQUEST ? false : true);
      setSkip((skip) => skip + result.length);
    } catch (error) {
      console.error('Error fetching more elections:', error);
      // setError('Failed to load more elections.');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <ElectionCard key={`skeleton-${index}`} isLoading={true} />
        ))}
      </div>
    );

  // if (error)
  //   return (
  //     <div className='text-center text-red-500'>{error}</div>
  //   );

  if (!electionData?.length)
    return (
      <div className="text-center text-gray-400">
        No elections found matching your criteria.
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {electionData.map((election, index) => {
        if (electionData.length === index + 1) {
          return (
            <div ref={lastElectionElementRef} key={election.mina_contract_id}>
              <ElectionCard electionData={election} isLoading={loading} />
            </div>
          );
        } else {
          return (
            <ElectionCard
              key={election.mina_contract_id}
              electionData={election}
              isLoading={loading}
            />
          );
        }
      })}
      {loadingMore && (
        <div className="col-span-1 md:col-span-2 flex justify-center my-4">
          <Loader />
        </div>
      )}
      {!hasMore && (
        <div className="text-center text-gray-500 my-4">
          You've reached the end of the list.
        </div>
      )}
    </div>
  );
};

export default AssignedElections;
