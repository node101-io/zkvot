import React from "react";

const ApplicationDataCard = ({ data }) => {
  if (!data) return null;

  const { id, owner, name } = data;

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white w-full mt-4">
      <h3 className="text-xl mb-2">Application Data</h3>
      <p>
        <strong>App ID:</strong> {id}
      </p>
      <p>
        <strong>Owner:</strong> {owner}
      </p>
      <p>
        <strong>Name:</strong> {name}
      </p>
    </div>
  );
};

export default ApplicationDataCard;
