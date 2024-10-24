"use client";
import { useState, useEffect } from "react";
import InitialLoadingPage from "@/components/InitialLoadingPage";
import Navbar from "@/components/NavBar/NavBar";
import Hero from "@/components/hero/hero";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [exiting, setExiting] = useState(false);

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
