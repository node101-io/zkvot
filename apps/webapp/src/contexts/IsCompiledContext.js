"use client";
import React, { useEffect, createContext, useState } from "react";
import ZkappWorkerClient from "../app/zkappWorkerClient";

export const IsCompiledContext = createContext();

export const IsCompiledProvider = ({ children }) => {
  const [zkappWorkerClient, setZkappWorkerClient] = useState(null);
  const [hasBeenSetup, setHasBeenSetup] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        if (!hasBeenSetup && !isSettingUp) {
          setIsSettingUp(true);

          const zkappWorkerClient = new ZkappWorkerClient();
          setZkappWorkerClient(zkappWorkerClient);
          await new Promise((resolve) => setTimeout(resolve, 5000));

          await zkappWorkerClient.loadProgram();

          console.log("compileProgram starting");
          console.time("compileProgram");
          await zkappWorkerClient.compileProgram();
          console.timeEnd("compileProgram");

          setHasBeenSetup(true);
          setIsSettingUp(false);
        }
      } catch (error) {
        console.log(`Error during setup: ${error.message}`);
      }
    };

    setup();
  }, []);

  return (
    <IsCompiledContext.Provider
      value={{
        zkappWorkerClient,
        hasBeenSetup, setHasBeenSetup, isSettingUp }}
    >
      {children}
    </IsCompiledContext.Provider>
  );
};
