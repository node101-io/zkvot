import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import ElectionCard from "./ElectionCard";
import { fetchElections } from "@/utils/FetchElections";
import Loader from "./Loader.jsx";

const AssignedElections = ({
  onlyOngoing,
  metamaskWalletAddress,
  minaWalletAddress,
}) => {
  const [electionData, setElectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const observer = useRef();

  const walletAddresses = useMemo(
    () =>
      [metamaskWalletAddress, minaWalletAddress]
        .filter(Boolean)
        .map((addr) => addr.toLowerCase()),
    [metamaskWalletAddress, minaWalletAddress]
  );

  const lastElectionElementRef = useCallback(
    (node) => {
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
    setElectionData([]);
    setSkip(0);
    setHasMore(true);
    setError(null);
    setLoading(true);

    const getElections = async () => {
      try {
        const { data, hasMore } = await fetchElections(limit, 0);

        let filteredData = data;

        if (onlyOngoing && walletAddresses.length > 0) {
          filteredData = data.filter((election) =>
            election.voters_list?.some((address) =>
              walletAddresses.includes(address.toLowerCase())
            )
          );
        }

        setElectionData(filteredData);
        setHasMore(hasMore);
        setSkip((prevSkip) => prevSkip + limit);
      } catch (error) {
        console.error("Error fetching elections:", error);
        setError("Failed to load elections.");
      } finally {
        setLoading(false);
      }
    };

    getElections();
  }, [onlyOngoing, walletAddresses]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const { data, hasMore: newHasMore } = await fetchElections(limit, skip);

      let filteredData = data;

      if (onlyOngoing && walletAddresses.length > 0) {
        filteredData = data.filter((election) =>
          election.voters_list?.some((address) =>
            walletAddresses.includes(address.toLowerCase())
          )
        );
      }

      setElectionData((prevData) => [...prevData, ...filteredData]);
      setHasMore(newHasMore);
      setSkip((prevSkip) => prevSkip + limit);
    } catch (error) {
      console.error("Error fetching more elections:", error);
      setError("Failed to load more elections.");
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <ElectionCard
            key={`skeleton-${index}`}
            loading={true}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (onlyOngoing && walletAddresses.length > 0 && electionData.length === 0) {
    return (
      <div className="text-center text-gray-400">
        No elections found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {electionData.map((election, index) => {
        if (electionData.length === index + 1) {
          return (
            <div
              ref={lastElectionElementRef}
              key={election.electionId}
            >
              <ElectionCard
                electionData={election}
                loading={loading}
              />
            </div>
          );
        } else {
          return (
            <ElectionCard
              key={election.electionId}
              electionData={election}
              loading={loading}
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
