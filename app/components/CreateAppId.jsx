"use client";
import React, { useState, useContext } from "react";
import { SubwalletContext } from "@/contexts/SubwalletContext";
import { web3FromSource } from "@polkadot/extension-dapp";
import ApplicationDataCard from "./ApplicationDataCard";

export const CreateAppId = ({ onAppIdGenerated }) => {
  const { api, selectedAccount } = useContext(SubwalletContext);
  const [appName, setAppName] = useState("");
  const [newAppId, setNewAppId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAppId = async () => {
    if (!api || !selectedAccount) {
      alert("Please connect your wallet and select an account.");
      return;
    }

    if (!appName) {
      alert("Please enter an application name.");
      return;
    }

    setIsSubmitting(true);
    setNewAppId(null);

    const injector = await web3FromSource(selectedAccount.source);

    try {
      const unsub = await api.tx.dataAvailability
        .createApplicationKey(appName)
        .signAndSend(
          selectedAccount.address,
          { app_id: 0, signer: injector.signer },
          ({ status, events, dispatchError }) => {
            if (status.isInBlock || status.isFinalized) {
              if (dispatchError) {
                let message = dispatchError.type;

                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(
                    dispatchError.asModule
                  );
                  message = `${decoded.docs.join(" ")}`;
                }

                alert(`Transaction failed: ${message}`);
                setIsSubmitting(false);
                unsub();
              } else {
                events.forEach(({ event }) => {
                  if (
                    event.section === "dataAvailability" &&
                    event.method === "ApplicationKeyCreated"
                  ) {
                    console.log("Event data:", event.data);

                    const appId = event.data[0].toString();
                    const owner = event.data[1].toString();
                    const keyName = event.data[2].toString();

                    const appData = {
                      id: appId,
                      owner: owner,
                      name: keyName,
                    };

                    setNewAppId(appData);
                    alert("Application Key created successfully!");
                    if (onAppIdGenerated) {
                      onAppIdGenerated(appData);
                    }
                  }
                });
                setIsSubmitting(false);
                unsub();
              }
            }
          }
        );
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the Application Key.");
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Application Name"
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
        disabled={!selectedAccount || isSubmitting}
        style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
      />
      <button
        onClick={handleCreateAppId}
        disabled={!selectedAccount || isSubmitting}
        style={{
          width: "100%",
          padding: "8px",
          backgroundColor: isSubmitting ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Submitting..." : "Create Application Key"}
      </button>
      {!selectedAccount && (
        <div>
          <p>You need to connect to create an Application ID</p>
        </div>
      )}
      {newAppId && (
        <div>
          <ApplicationDataCard data={newAppId} />
        </div>
      )}
    </div>
  );
};

export default CreateAppId;
