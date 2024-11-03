import React from "react";
import ElectionItem from "./ElectionItem";

const ElectionList = ({ elections, setElections }) => {
  return (
    <div className="w-full flex flex-col space-y-2 items-start  overflow-y-scroll">
      {elections.map((election, index) => (
        <ElectionItem
          key={index}
          index={index}
          election={election}
          elections={elections}
          setElections={setElections}
        />
      ))}
    </div>
  );
};

export default ElectionList;
