import React, { useEffect, useState, useMemo } from "react";
import ElectionCard from "./ElectionCard";
import { fetchElections } from "@/utils/FetchElections";

const AssignedElections = ({
  onlyOngoing,
  metamaskWalletAddress,
  minaWalletAddress,
}) => {
  const [electionData, setElectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const walletAddresses = useMemo(
    () =>
      [metamaskWalletAddress, minaWalletAddress]
        .filter(Boolean)
        .map((addr) => addr.toLowerCase()),
    [metamaskWalletAddress, minaWalletAddress]
  );

  useEffect(() => {
    const getElections = async () => {
      try {
        let data = await fetchElections();

        if (onlyOngoing && walletAddresses.length > 0) {
          data = data.filter((election) =>
            election.voters_list?.some((address) =>
              walletAddresses.includes(address.toLowerCase())
            )
          );
        }

        setElectionData(data);
      } catch (error) {
        console.error("Error fetching elections:", error);
        setError("Failed to load elections.");
      } finally {
        setLoading(false);
      }
    };

    getElections();
  }, [onlyOngoing, walletAddresses]);

  const skeletonCards = Array(6).fill(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skeletonCards.map((_, index) => (
          <ElectionCard
            key={index}
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
      {electionData.map((election) => (
        <ElectionCard
          key={election.electionId}
          electionData={election}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default AssignedElections;
