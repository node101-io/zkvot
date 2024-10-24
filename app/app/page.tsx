"use client";
import { Field } from "o1js";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
// import './reactCOIServiceWorker';
import ZkappWorkerClient from "./zkappWorkerClient";
import Hero from "../components/hero/hero";
import InitialLoadingPage from "../components/InitialLoadingPage";

export default function Home() {
  const [zkappWorkerClient, setZkappWorkerClient] =
    useState<null | ZkappWorkerClient>(null);
  const [hasWallet, setHasWallet] = useState<null | boolean>(null);
  const [hasBeenSetup, setHasBeenSetup] = useState(false);

  const [exiting, setExiting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
    }, 2500);

    const exitTimer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        if (!hasBeenSetup) {
          const zkappWorkerClient = new ZkappWorkerClient();
          setZkappWorkerClient(zkappWorkerClient);
          await new Promise((resolve) => setTimeout(resolve, 5000));

          const mina = (window as any).mina;
          if (mina == null) {
            setHasWallet(false);
            return;
          }

          await zkappWorkerClient.loadProgram();

          await zkappWorkerClient.compileProgram();

          setHasBeenSetup(true);
          setHasWallet(true);
        }
      } catch (error: any) {
        console.log(`Error during setup: ${error.message}`);
      }
    };

    setup();
  }, []);

  let auroLinkElem;
  if (hasWallet === false) {
    const auroLink = "https://www.aurowallet.com/";
    auroLinkElem = (
      <div>
        Could not find a wallet.{" "}
        <a
          href="https://www.aurowallet.com/"
          target="_blank"
          rel="noreferrer"
        >
          Install Auro wallet here
        </a>
      </div>
    );
  }
  return (
    <div className="h-full  flex flex-col relative">
      <div
        className={`flex flex-col h-full transition-opacity duration-1000 ${
          exiting ? "opacity-100" : "opacity-0"
        }`}
      >
        <main className="flex-grow flex items-start justify-center overflow-hidden">
          <Hero />
        </main>
      </div>

      {loading && <InitialLoadingPage isExiting={exiting} />}
    </div>
  );
}
