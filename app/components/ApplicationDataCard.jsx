import React from "react";

const ApplicationDataCard = ({ data }) => {
  return (
    <div className="border-[1px] border-[#ccc] p-4 rounded-lg">
      <h3>Application Details</h3>
      <p>
        <strong>ID:</strong> {data.id}
      </p>
      <p>
        <strong>Owner:</strong> {data.owner}
      </p>
      <p>
        <strong>Name:</strong> {data.name}
      </p>
      <p>
        <strong>Application Name:</strong> {data.appName}
      </p>
    </div>
  );
};

export default ApplicationDataCard;
