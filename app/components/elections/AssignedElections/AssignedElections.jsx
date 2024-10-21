import React, { useEffect, useState } from "react";
import ElectionCard from "./ElectionCard";
import { fetchElections } from "@/utils/FetchElections";

const AssignedElections = () => {
  const [electionData, setElectionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getElections = async () => {
      try {
        const data = await fetchElections();
        setElectionData(data);
      } catch (error) {
        console.error("Error fetching elections:", error);
      } finally {
        setLoading(false);
      }
    };

    getElections();
  }, []);

  const skeletonCards = Array(6).fill(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
      {loading
        ? skeletonCards.map((_, index) => (
            <ElectionCard
              key={index}
              loading={true}
            />
          ))
        : electionData.map((electionData, index) => (
            <ElectionCard
              key={index}
              electionData={electionData}
              loading={false}
            />
          ))}
    </div>
  );
};

export default AssignedElections;
